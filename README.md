# Form Builder

A browser-based form builder. **Builder Mode** designs a form template from 9 field types plus conditional logic. **Fill Mode** turns a template into a response and exports it as a PDF. There is no backend: everything is stored in `localStorage`.

Built with React 19, TypeScript, Vite, React Router, Zustand and React Compiler.

---

## Running locally

Requires **Node 20.19+ or 22.12+** (Vite's minimum).

```bash
npm install
npm run dev        # http://localhost:5173
```

Other scripts:

| Command                               | What it does                           |
| ------------------------------------- | -------------------------------------- |
| `npm run build`                       | Type-check and build to `dist/`        |
| `npm run preview`                     | Serve the production build             |
| `npm run check`                       | Type-check, lint and check formatting  |
| `npm run lint:fix` / `npm run format` | Fix lint issues / format with Prettier |

The app uses normal URLs (`/templates/:id/fill`), so the server has to return `index.html` for unknown paths. Vite's dev and preview servers already do, and `vercel.json` sets the same rewrite for Vercel. Other hosts need an equivalent fallback.

---

## Project structure

```
src/
├── App.tsx            routes
├── pages/             TemplatesPage, BuilderPage, FillPage, ResponsesPage
├── components/
│   ├── fields/        one file per field type (TextField, DateField, CalculationField, …)
│   ├── builder/       FormCanvas, FieldPalette, FieldSettingsPanel, FieldLogicEditor, ConditionValueEditor
│   ├── form/          ResponseForm, FormField (shared by Fill Mode and Preview)
│   ├── settings/      SettingInputs, OptionsEditor
│   ├── layout/        AppHeader, NotFound, RootLayout
│   └── ui/            Modal, Toast, InputAffix
├── hooks/             all state and behaviour (useTemplateDraft, useResponseForm, useFormStore, …)
├── utils/             pure logic: formState, validation, operators, pdfExport, fieldRegistry, …
└── types/             shared types, imported as @typedefs
```

One rule shapes the layout: **components render, hooks hold state, utils are pure logic.** Pages read like layouts because the hooks do the work, and the logic in `utils/` has no React in it.

Imports use one alias per folder: `@components/*`, `@hooks/*`, `@pages/*`, `@typedefs`, `@utils/*` (set in `tsconfig.json` and `vite.config.ts`).

---

## localStorage schema

Everything is in **one key, `form-builder`**, written by Zustand's `persist` middleware:

```jsonc
{
  "version": 0,
  "state": {
    "templates": [FormTemplate, ...],
    "responses": [FormResponse, ...]
  }
}
```

```ts
interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: Field[];          // in form order
  createdAt: string;        // ISO timestamp
  updatedAt: string;
}

interface FormResponse {
  id: string;
  templateId: string;
  submittedAt: string;
  snapshot: { title: string; description: string; fields: Field[] };  // the template at submission
  answers: Record<string, FieldValue>;  // by field id; only fields that were visible
}

interface Field {
  id: string;
  type: "text" | "textarea" | "number" | "date" | "singleSelect" | "multiSelect" | "file" | "section" | "calculation";
  label: string;
  required: boolean;        // default; conditions can override
  config: { ... };          // per type, e.g. { min, max, decimals, prefix, suffix } for Number
  logic: { visible: boolean; match: "all" | "any"; conditions: Condition[] };
}
```

**Why it looks like this**

- **One key, two flat lists.** The app only ever needs "all templates" and "responses for a template". Two arrays cover both, and one key means a single write saves everything, so the two lists can't get out of step.
- **Responses keep a snapshot of the template.** If a template is edited or a field deleted after someone submits, their response and its re-downloaded PDF still show exactly what they answered. This costs some storage, which is fine at this scale.
- **Answers are keyed by field id, and hidden fields have no key.** Leaving hidden fields out at submit time is what keeps them out of the saved data and the PDF, with no special case anywhere else.
- **Values are stored in a stable form.** Choice fields store option **ids**, not labels, so renaming an option doesn't break saved answers or conditions. Numbers are stored as the text that was typed, so "1." mid-typing and the decimal-places check both work. Files store only `{ name, size, type }`.
- **Versioned.** `persist` writes a `version`, so a future schema change can add a `migrate` step instead of wiping data.

---

## Architecture

### Field types are plug-ins

Every field type implements one interface, `FieldDefinition` (`src/types/fieldDefinition.ts`):

```ts
{
  name, icon, kind,          // "input" | "display" | "computed"
  createConfig, initialValue, readValue, isEmpty,
  validate?, compute?,       // answer checks; Calculation's formula
  operators?,                // the comparisons conditions can make on this type
  toPdfBlock,                // how it appears in the PDF
  ConfigEditor, Input,       // its builder settings UI and its Fill Mode UI
}
```

`utils/fieldRegistry.ts` maps each type to its definition. The canvas, settings panel, Fill Mode, conditional logic, validation and PDF export all call `getFieldDefinition(field)` and never check `field.type` themselves.

**Adding an 11th field type:**

1. Add `components/fields/RatingField.tsx` exporting a `FieldDefinition<"rating">`.
2. Add one line to `utils/fieldRegistry.ts`.
3. Add one entry to `FieldTypeMap` in `types/form.ts`.

`FieldTypeMap` pairs each type with its `config` and `value` types, and `Field` is generated from it, so checking `field.type` narrows `field.config`. The only type cast in the app is one documented helper in `utils/templateFields.ts`, where TypeScript can't prove that a config belongs to its own field type.

### Conditional logic

`getFormState(fields, values)` in `utils/formState.ts` is a pure function that runs on every render. It returns each field's visible/required state and the `answers` to submit (visible fields only, with calculations filled in).

A condition is `{ targetId, operator, value, effect }`. Operators per target type follow the spec's table (`utils/operators.ts`). Effects are show, hide, mark as required, mark as not required.

Rules:

- **Empty target → default state.** A condition whose target field has no answer doesn't apply, so the field keeps its default visibility and required setting.
- **A hidden field counts as empty.** This makes chains work: if A hides B, any field that depends on B also falls back to its default. A hidden field keeps what was typed (so it reappears filled in), but its value is never submitted.
- **Hidden fields are never required, never validated, never submitted and never in the PDF.**
- **No loops.** The builder's field picker leaves out any field that already depends on the current one (directly or through a chain), which also rules out a field targeting itself.

#### AND / OR decision

Each field chooses **All** (AND) or **Any** (OR). Conditions are **grouped by their effect**, and the choice applies within each group:

- With **All**, an effect applies only if every condition with that effect matches.
- With **Any**, one matching condition is enough.

When groups disagree, **hide beats show** and **required beats not required**. Both lean toward the safer outcome: don't show something that a rule says to hide, and don't skip a check that a rule says is needed.

Why grouped by effect: a field often has a single intent ("show this when …") built from several conditions. Grouping lets "show when A and B" work naturally, while still allowing a separate "require when C" on the same field without it being ANDed into the show rule.

### Calculations

A Calculation field's `compute` reads its Number sources through the same form state, so a hidden or empty source is left out. It applies Sum, Average, Min or Max and rounds to the chosen decimal places, live as the user types. Sources can only be Number fields, so a Calculation can't use another Calculation.

### State and data flow

- **Builder:** `useTemplateDraft` keeps a local draft until **Save**, so half-made edits never reach storage. Saving is blocked if the title or a label is missing, a select has no options, or a calculation has no sources. `useUnsavedChangesWarning` uses React Router's `useBlocker` (and `beforeunload`) to ask before leaving with unsaved edits, including via the back button.
- **Fill Mode:** `useResponseForm` holds the values and calls `getFormState` each render. Errors appear after the first submit attempt and then update live; the first invalid field gets focus. `useResponseSubmission` saves the response with its template snapshot.
- **Preview** uses the same `ResponseForm` as Fill Mode, in a modal, with a submit that validates but doesn't save.
- **Storage:** one Zustand store (`hooks/useFormStore.ts`) with `persist`.
- **Memoisation:** React Compiler (via Babel in `vite.config.ts`), so the code has no `useMemo` or `useCallback`.

### PDF export

The spec allows browser APIs only, so the export uses the browser's print-to-PDF (`utils/pdfExport.ts`):

1. Each visible field's `toPdfBlock` produces a section heading or a label/answer row, in form order.
2. The blocks are rendered into a print-styled HTML page: form title, submission time (or "Draft" when exported before submitting), answered count, page numbers.
3. The page is loaded into a hidden iframe and printed; the user chooses **Save as PDF**. The file name defaults to the form title and date.

File uploads list each file's name and size, with a note that file contents aren't part of the export.

---

## Decisions where the spec was open

| Situation                                            | Decision                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Template edited after responses exist                | Each response stores a snapshot of the template, so old responses and PDFs don't change.                  |
| Multiple conditions on one field                     | Per-field All/Any, grouped by effect; hide beats show, required beats not required (see above).           |
| A condition targets a hidden field                   | The hidden field counts as empty, so the condition doesn't apply. This is how chained conditions resolve. |
| A field is hidden and shown again while filling      | Its typed value comes back; it's still never submitted while hidden.                                      |
| When to show validation errors                       | Only after the first submit attempt, then live.                                                           |
| "Download PDF" before submitting                     | Allowed; the PDF is marked "Draft (not submitted)" instead of showing a submission time.                  |
| Deleting a field that others use                     | The builder asks first, then removes the conditions and calculation sources that pointed at it.           |
| Text comparisons in conditions                       | Case-insensitive and trimmed ("Yes" equals " yes").                                                       |
| "Is within range"                                    | Inclusive of both ends.                                                                                   |
| What counts as "number of fields" on a template card | Every field, including section headers.                                                                   |
| Files in a response                                  | Only name, size and type are stored; the PDF lists names and sizes.                                       |

---

## What I'd improve with more time

- **Automated tests.** Unit tests (Vitest) for `getFormState`, operators and validation, which are pure functions and easy to cover; and a few end-to-end tests (Playwright) for build → fill → submit. The logic was checked during development with a throwaway script and manual browser runs.
- **A direct PDF download.** Generating the PDF bytes in the browser would skip the print dialog, at the cost of writing a small PDF writer and handling fonts.
- **Managing data.** Delete and duplicate for templates and responses, and undo in the builder.
- **Keyboard reordering on the canvas.** Up/down buttons work with the keyboard today; drag-and-drop doesn't.
- **Validating stored data on load,** with a schema (e.g. zod) and `persist`'s `migrate`, so hand-edited or old data can't break the app. This would also add a runtime guard against condition loops.
- **Typed inputs for condition values.** Number comparisons currently use a text input, validated when the condition runs.
- **Autosaving builder drafts,** so a refresh doesn't lose unsaved edits (today it warns instead).
