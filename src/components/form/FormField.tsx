import { CircleAlert } from "lucide-react";
import { getFieldDefinition } from "@utils/fieldRegistry";
import { classNames } from "@utils/classNames";

import type { Field, FieldValue } from "@typedefs";

interface FieldControlProps {
  field: Field;
  value: FieldValue | undefined;
  required: boolean;
  error: string | undefined;
  /** Keeps ids unique when the same form is on the page twice (builder canvas and preview). */
  idPrefix: string;
  onChange: (fieldId: string, value: FieldValue) => void;
}

/** One field in Fill Mode: label, the type's own input, and the error message. */
export const FormField = ({ field, value, required, error, idPrefix, onChange }: FieldControlProps) => {
  const definition = getFieldDefinition(field);
  const typed = definition.readValue(value, field);
  const inputId = `${idPrefix}-${field.id}`;
  const labelId = `${inputId}-label`;
  const errorId = `${inputId}-error`;
  const handleChange = (next: FieldValue) => onChange(field.id, next);

  if (definition.kind === "display") {
    return (
      <div className="form-item form-item-display" data-field-id={field.id}>
        <definition.Input
          field={field}
          value={typed}
          onChange={handleChange}
          inputId={inputId}
          labelId={labelId}
          describedBy={undefined}
          invalid={false}
          required={false}
        />
      </div>
    );
  }

  const label = (
    <>
      {field.label || "Untitled field"}
      {required && (
        <span className="required-mark" aria-hidden="true">
          *
        </span>
      )}
    </>
  );

  return (
    <div className={classNames("form-item", error !== undefined && "has-error")} data-field-id={field.id}>
      {(definition.labelTarget?.(field) ?? "control") === "control" ? (
        <label id={labelId} htmlFor={inputId} className="field-label">
          {label}
        </label>
      ) : (
        <div id={labelId} className="field-label">
          {label}
        </div>
      )}
      <definition.Input
        field={field}
        value={typed}
        onChange={handleChange}
        inputId={inputId}
        labelId={labelId}
        describedBy={error === undefined ? undefined : errorId}
        invalid={error !== undefined}
        required={required}
      />
      {error !== undefined && (
        <p id={errorId} className="field-error">
          <CircleAlert size={14} />
          {error}
        </p>
      )}
    </div>
  );
};
