import { ChevronDown, ChevronUp, CircleAlert, EyeOff, GitBranch, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FormField } from "@components/form/FormField";
import { initialValueFor } from "@utils/formState";
import { getFieldDefinition } from "@utils/fieldRegistry";
import { useCanvasDrop } from "@hooks/useCanvasDrop";
import { classNames } from "@utils/classNames";
import { todayISO } from "@utils/format";
import { DRAG_MOVE_FIELD } from "@utils/dragData";

import type { TemplateIssues } from "@utils/validation";
import type { Field, FieldType, FormTemplate } from "@typedefs";

interface CanvasProps {
  template: FormTemplate;
  selectedId: string | null;
  issues: TemplateIssues;
  onSelect: (fieldId: string | null) => void;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onAdd: (type: FieldType, index: number) => void;
  /** Moves a field so it lands before the field now at `index` (or at the end). */
  onMove: (fieldId: string, index: number) => void;
  onRemove: (fieldId: string) => void;
}

const noop = () => undefined;

interface FieldCardProps {
  field: Field;
  fields: readonly Field[];
  index: number;
  selected: boolean;
  issues: readonly string[];
  dropPosition: "before" | "after" | null;
  today: string;
  onSelect: () => void;
  onMove: (index: number) => void;
  onRemove: () => void;
  onDragEnd: () => void;
}

const FieldCard = ({
  field,
  fields,
  index,
  selected,
  issues,
  dropPosition,
  today,
  onSelect,
  onMove,
  onRemove,
  onDragEnd,
}: FieldCardProps) => {
  const definition = getFieldDefinition(field);
  const conditionCount = field.logic.conditions.length;
  const name = field.label || definition.name;
  const stop = (action: () => void) => (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
    action();
  };

  return (
    <li
      data-card
      className={classNames(
        "field-card",
        selected && "is-selected",
        issues.length > 0 && "has-issues",
        dropPosition !== null && `drop-${dropPosition}`,
      )}
      draggable
      tabIndex={0}
      aria-label={`${definition.name}: ${name}`}
      aria-current={selected ? "true" : undefined}
      onDragStart={(event) => {
        event.dataTransfer.setData(DRAG_MOVE_FIELD, field.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="card-toolbar">
        <span className="drag-handle" title="Drag to reorder">
          <GripVertical size={16} />
        </span>
        <span className="type-chip">
          <definition.icon size={13} />
          {definition.name}
        </span>
        {definition.kind === "input" && field.required && <span className="badge">Required</span>}
        {!field.logic.visible && (
          <span className="badge">
            <EyeOff size={12} />
            Hidden by default
          </span>
        )}
        {conditionCount > 0 && (
          <span className="badge badge-accent">
            <GitBranch size={12} />
            {conditionCount === 1 ? "1 condition" : `${conditionCount} conditions`}
          </span>
        )}
        {issues.length > 0 && (
          <span className="badge badge-warning" title={issues.join("\n")}>
            <CircleAlert size={12} />
            {issues.length === 1 ? "1 issue" : `${issues.length} issues`}
          </span>
        )}
        <div className="card-actions">
          <button
            type="button"
            className="icon-btn"
            aria-label={`Move ${name} up`}
            disabled={index === 0}
            onClick={stop(() => onMove(index - 1))}
          >
            <ChevronUp size={16} />
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={`Move ${name} down`}
            disabled={index === fields.length - 1}
            onClick={stop(() => onMove(index + 2))}
          >
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="icon-btn icon-btn-danger"
            aria-label={`Delete ${name}`}
            onClick={stop(onRemove)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="card-preview" inert>
        <FormField
          field={field}
          value={initialValueFor(field, today)}
          required={definition.kind === "input" && field.required}
          error={undefined}
          idPrefix="canvas"
          onChange={noop}
        />
      </div>
    </li>
  );
};

export const FormCanvas = ({
  template,
  selectedId,
  issues,
  onSelect,
  onTitleChange,
  onDescriptionChange,
  onAdd,
  onMove,
  onRemove,
}: CanvasProps) => {
  const { dropIndex, dropProps, clearDrop } = useCanvasDrop({ onAdd, onMove });
  const [today] = useState(todayISO);
  const { fields } = template;

  return (
    <main
      className="canvas"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onSelect(null);
        }
      }}
    >
      <div className="canvas-inner">
        <section className={classNames("form-meta-card", issues.title !== null && "has-issues")}>
          <input
            className="title-input"
            aria-label="Form title"
            placeholder="Form title"
            value={template.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          {issues.title !== null && <p className="field-warning">{issues.title}</p>}
          <textarea
            className="description-input"
            aria-label="Form description"
            placeholder="Add a description (optional)"
            rows={2}
            value={template.description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </section>

        <div className="drop-area" {...dropProps}>
          {fields.length === 0 ? (
            <div className={classNames("canvas-empty", dropIndex !== null && "is-over")}>
              <Plus size={20} />
              <p className="canvas-empty-title">Add your first field</p>
              <p className="muted">Click a field type on the left, or drag it here.</p>
            </div>
          ) : (
            <ol className="field-list">
              {fields.map((field, index) => {
                let dropPosition: "before" | "after" | null = null;
                if (dropIndex === index) {
                  dropPosition = "before";
                } else if (dropIndex === fields.length && index === fields.length - 1) {
                  dropPosition = "after";
                }
                return (
                  <FieldCard
                    key={field.id}
                    field={field}
                    fields={fields}
                    index={index}
                    selected={field.id === selectedId}
                    issues={issues.fields[field.id] ?? []}
                    dropPosition={dropPosition}
                    today={today}
                    onSelect={() => onSelect(field.id)}
                    onMove={(to) => onMove(field.id, to)}
                    onRemove={() => onRemove(field.id)}
                    onDragEnd={clearDrop}
                  />
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </main>
  );
};
