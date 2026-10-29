import { CircleAlert, Download } from "lucide-react";
import { useId } from "react";
import { useResponseForm } from "@hooks/useResponseForm";
import { FormField } from "./FormField";

import type { FormSnapshot, FormValues } from "@typedefs";
import type { ReactNode } from "react";

interface FillFormProps {
  snapshot: FormSnapshot;
  submitLabel: string;
  /** Called with the answers of visible fields once everything is valid. */
  onSubmit: (answers: FormValues) => void;
  banner?: ReactNode;
}

export const ResponseForm = ({ snapshot, submitLabel, onSubmit, banner }: FillFormProps) => {
  const idPrefix = useId();
  const { visibleFields, answers, isRequired, errors, errorCount, setValue, handleSubmit, downloadDraft } =
    useResponseForm(snapshot, onSubmit);
  const hasRequired = visibleFields.some((field) => isRequired(field.id));

  return (
    <form className="fill-form" noValidate onSubmit={handleSubmit}>
      <header className="fill-header">
        <h1>{snapshot.title || "Untitled form"}</h1>
        {snapshot.description.trim() !== "" && <p className="fill-description">{snapshot.description}</p>}
        {hasRequired && (
          <p className="fill-required-note">
            <span className="required-mark" aria-hidden="true">
              *
            </span>{" "}
            Required
          </p>
        )}
      </header>
      {banner}
      <div className="fill-fields">
        {visibleFields.length === 0 ? (
          <p className="muted">This form has no fields yet.</p>
        ) : (
          visibleFields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={answers[field.id]}
              required={isRequired(field.id)}
              error={errors[field.id]}
              idPrefix={idPrefix}
              onChange={setValue}
            />
          ))
        )}
      </div>
      {errorCount > 0 && (
        <div className="form-alert" role="alert">
          <CircleAlert size={16} />
          {errorCount === 1 ? "1 field needs attention." : `${errorCount} fields need attention.`}
        </div>
      )}
      <footer className="fill-actions">
        <button type="button" className="btn btn-secondary" onClick={downloadDraft}>
          <Download size={16} />
          Download PDF
        </button>
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
      </footer>
    </form>
  );
};
