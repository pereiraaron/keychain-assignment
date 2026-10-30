# AI Usage Log

This log documents how I collaborated with Claude Code (inside VS Code) using a strict, incremental process. Rather than generating large blocks of code and cleaning them up later, I established the architecture and libraries upfront, built the application in small vertical slices, and enforced a strict review-and-verify gate after each slice.

### 1. Upfront Architecture and First Slice

**Prompt:** Read the brief. Before writing application code, propose a folder structure, state management approach, and routing solution that avoids over-engineering. Once agreed, implement _only_ the core `FieldDefinition` interface, the registry, and the first two field types (Text and Number).

**What I verified & decided:**

- **Library choices locked in early:** Instead of letting the AI write custom `localStorage` wrappers or hash routers, I instructed it to use Zustand (with `persist`) and React Router from the start. This prevented ~800 lines of over-engineered boilerplate.
- **Extensibility:** The registry design means adding a new field type requires just one new file and two one-line entries.
- **First slice verification:** Type-check, strict type-aware ESLint, and manual browser checks all passed for the Text and Number fields before moving on.

### 2. Conditional Logic Engine

**Prompt:** Implement the conditional logic from the spec: visibility, required state, default states, and chained conditions. Map out the edge cases for these rules before implementing the `getFormState` logic so we have a strict checklist for manual validation.

**What I verified & decided:**

- **Manual logic verification:** Verified the logic against 23 distinct edge cases via manual browser walkthroughs, including a strict three-field dependency chain (hiding the first field must correctly cascade and hide the downstream dependencies).
- **Rule clarifications:**
  - A hidden field counts as empty.
  - AND/OR is evaluated per field. Hide overrides show; required overrides optional.
  - Text comparisons ignore case and surrounding spaces.
- **Scope control:** The AI attempted to add loop-prevention in three different places (builder, runtime fallback, save-time). I rejected the runtime bloat and kept only the builder-level filter, which is sufficient to prevent cycles.

### 3. Per-Slice Audits for Over-Engineering

**Prompt:** (Run after each feature slice) Audit the newly written code against the brief. Flag any speculative features, redundant React patterns, or code that goes beyond the literal specification. Do not merge until reviewed.

**What I verified & changed:**

- **Rejected unrequested features:** Blocked the AI from adding hint text on every field, complex file drop zones with MIME wildcards, and duplicate/delete actions that weren't in the spec.
- **Simplified data shapes:** Forced the AI to refactor condition values from a complex typed union down to a simple `string[]`.
- **Removed redundant keys:** The AI tried to use standard React `key` reset hacks on the response form and preview modal. Since parent components already handle unmounting, I removed these to keep the code perfectly explainable.

### 4. Enforcing Structure and Conventions

**Prompt:** Refactor the current slice to move all state and behavior into custom hooks so components remain pure render functions. Compute all derived data before the `return` statement.

**What I verified & changed:**

- **React Compiler:** Ensured manual `useMemo` calls were omitted and verified that the production bundle contained React Compiler cache markers.
- **Naming clarity:** Intervened to rename AI-generated identifiers to clear domain language (e.g., `FillForm` → `ResponseForm`, `resolveForm` → `getFormState`).
- **Phantom errors:** When VS Code flagged "unsafe assignments" after renaming files, I ran `tsc` and ESLint from the CLI. Both were completely clean, confirming a stale language server cache. I restarted the TS server rather than polluting the code with defensive type casts.

### 5. PDF Export

**Prompt:** Evaluate the options for exporting a filled form as a PDF using browser APIs only. Recommend an approach that requires zero external libraries, then implement it.

**What I verified & decided:**

- **Approach selection:** I approved printing a styled HTML page to PDF (via a hidden iframe) rather than manually generating byte streams. This natively supports complex text layouts and character encodings without bloat, trading off only for the native browser print dialog.
- **Validation:** Confirmed the generated document safely escapes user text, correctly omits hidden fields, and neatly lists file uploads by name/size.

### 6. Final Integration and Brief Check

**Prompt:** Compare the final application line-by-line against every requirement in the brief. Separate explicit requirements from the architectural decisions we made.

**What I verified:**

- Conducted comprehensive manual browser runs against the production build.
- Verified that condition-hidden fields correctly bypass validation.
- Verified live calculation updates (e.g., Sum fields).
- Confirmed form state fully survives page reloads via Zustand persistence.
- Corrected a final AI hallucination in the documentation: the AI documented a condition operator ("is filled") that we hadn't actually built. I corrected the docs to match our strict `EQUALS`/`CONTAINS` schema.
