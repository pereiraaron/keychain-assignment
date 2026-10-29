import { FileText, List, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { AppHeader } from "@components/layout/AppHeader";
import { useTemplates } from "@hooks/useTemplates";
import { createId } from "@utils/id";
import { formatDateTime } from "@utils/format";

export const TemplatesPage = () => {
  const { templates, responseCount } = useTemplates();

  const navigate = useNavigate();
  const createTemplate = () => {
    void navigate(`/templates/${createId()}`);
  };

  return (
    <>
      <AppHeader>
        <button type="button" className="btn btn-primary" onClick={createTemplate}>
          <Plus size={16} />
          New template
        </button>
      </AppHeader>
      <main className="page">
        <div className="page-head">
          <h1>Templates</h1>
          <p className="muted">Build forms, collect responses and export them as PDFs.</p>
        </div>

        {templates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={22} />
            </div>
            <h2>No templates yet</h2>
            <p>Create a template to start building your first form.</p>
            <button type="button" className="btn btn-primary" onClick={createTemplate}>
              <Plus size={16} />
              New template
            </button>
          </div>
        ) : (
          <ul className="template-grid">
            {templates.map((template) => (
              <li key={template.id} className="template-card">
                <div className="template-card-body">
                  <h2 className="template-title">
                    <Link to={`/templates/${template.id}`} className="stretched-link">
                      {template.title || "Untitled form"}
                    </Link>
                  </h2>
                  {template.description.trim() !== "" && <p className="template-desc">{template.description}</p>}
                  <dl className="template-stats">
                    <div>
                      <dt>Fields</dt>
                      <dd>{template.fields.length}</dd>
                    </div>
                    <div>
                      <dt>Responses</dt>
                      <dd>{responseCount(template.id)}</dd>
                    </div>
                    <div>
                      <dt>Last modified</dt>
                      <dd>{formatDateTime(template.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="template-card-actions">
                  <Link className="btn btn-primary btn-sm" to={`/templates/${template.id}/fill`}>
                    <Plus size={16} />
                    New response
                  </Link>
                  <Link className="btn btn-secondary btn-sm" to={`/templates/${template.id}/responses`}>
                    <List size={16} />
                    Responses
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
};
