import { ArrowLeft, Check, Eye, List, Pencil } from "lucide-react";
import { Link } from "react-router";
import { FormCanvas } from "@components/builder/FormCanvas";
import { FieldSettingsPanel } from "@components/builder/FieldSettingsPanel";
import { FieldPalette } from "@components/builder/FieldPalette";
import { ResponseForm } from "@components/form/ResponseForm";
import { Modal } from "@components/ui/Modal";
import { Toast } from "@components/ui/Toast";
import { useToast } from "@hooks/useToast";
import { usePreview } from "@hooks/usePreview";
import { useTemplateDraft } from "@hooks/useTemplateDraft";
import { useUnsavedChangesWarning } from "@hooks/useUnsavedChangesWarning";
import { classNames } from "@utils/classNames";
import { formatDateTime } from "@utils/format";

export const BuilderPage = ({ templateId }: { templateId: string }) => {
  const builder = useTemplateDraft(templateId);
  const { draft, saved, hasUnsavedChanges, issues, selected } = builder;
  const { toast, showToast, dismissToast } = useToast();
  const preview = usePreview();
  useUnsavedChangesWarning(hasUnsavedChanges);

  const save = () => {
    const error = builder.save();
    showToast(error === null ? "success" : "error", error ?? "Template saved.");
  };

  let status = "Not saved yet";
  if (hasUnsavedChanges) {
    status = "Unsaved changes";
  } else if (saved) {
    status = `Saved ${formatDateTime(saved.updatedAt)}`;
  }

  return (
    <div className="builder">
      <header className="builder-header">
        <Link to="/" className="btn btn-ghost btn-sm">
          <ArrowLeft size={16} />
          Templates
        </Link>
        <div className="builder-title">
          <span className="builder-name">{draft.title.trim() || "Untitled form"}</span>
          <span className={classNames("status", hasUnsavedChanges && "status-dirty")}>{status}</span>
        </div>
        <div className="builder-actions">
          {saved && (
            <Link to={`/templates/${templateId}/responses`} className="btn btn-ghost btn-sm">
              <List size={16} />
              Responses
            </Link>
          )}
          <button type="button" className="btn btn-secondary btn-sm" onClick={preview.openPreview}>
            <Eye size={16} />
            Preview
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>
            <Check size={16} />
            Save
          </button>
        </div>
      </header>

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="builder-body">
        <FieldPalette onAdd={(type) => builder.addField(type)} />
        <FormCanvas
          template={draft}
          selectedId={builder.selectedId}
          issues={issues}
          onSelect={builder.setSelectedId}
          onTitleChange={builder.setTitle}
          onDescriptionChange={builder.setDescription}
          onAdd={builder.addField}
          onMove={builder.moveField}
          onRemove={builder.deleteField}
        />
        {selected ? (
          <FieldSettingsPanel
            key={selected.id}
            field={selected}
            fields={draft.fields}
            issues={issues.fields[selected.id] ?? []}
            onChange={builder.updateField}
          />
        ) : (
          <aside className="config-panel config-empty" aria-label="Field settings">
            <div className="empty-icon">
              <Pencil size={20} />
            </div>
            <p className="canvas-empty-title">No field selected</p>
            <p className="muted">Select a field on the form to change its settings and logic.</p>
          </aside>
        )}
      </div>

      <Modal open={preview.isOpen} title="Preview" wide onClose={preview.closePreview}>
        <ResponseForm
          snapshot={draft}
          submitLabel="Submit"
          onSubmit={preview.markSubmitted}
          banner={
            preview.submitted ? (
              <div className="notice notice-success" role="status">
                <Check size={16} />
                All answers are valid. Preview submissions aren&apos;t saved.
              </div>
            ) : (
              <div className="notice">
                <Eye size={16} />
                This is a preview. Submitting checks the answers but doesn&apos;t save them.
              </div>
            )
          }
        />
      </Modal>
    </div>
  );
};
