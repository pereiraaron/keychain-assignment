import { ArrowLeft, Download, List, Pencil, Plus } from "lucide-react";
import { Link } from "react-router";
import { AppHeader } from "@components/layout/AppHeader";
import { NotFound } from "@components/layout/NotFound";
import { useTemplateResponses } from "@hooks/useTemplateResponses";
import { useTemplate } from "@hooks/useTemplates";
import { downloadResponsePdf } from "@utils/pdfExport";
import { formatDateTime, pluralize } from "@utils/format";

export const ResponsesPage = ({ templateId }: { templateId: string }) => {
  const template = useTemplate(templateId);
  const responses = useTemplateResponses(templateId);

  if (!template) {
    return <NotFound message="This template doesn't exist. It may have been deleted." />;
  }

  return (
    <>
      <AppHeader>
        <Link className="btn btn-ghost btn-sm" to={`/templates/${templateId}`}>
          <Pencil size={16} />
          Edit template
        </Link>
        <Link className="btn btn-primary btn-sm" to={`/templates/${templateId}/fill`}>
          <Plus size={16} />
          New response
        </Link>
      </AppHeader>
      <main className="page">
        <div className="page-head">
          <Link className="back-link" to="/">
            <ArrowLeft size={14} />
            Templates
          </Link>
          <h1>{template.title || "Untitled form"}</h1>
          <p className="muted">{pluralize(responses.length, "response")}</p>
        </div>

        {responses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <List size={22} />
            </div>
            <h2>No responses yet</h2>
            <p>Submitted responses show up here, ready to download as PDFs.</p>
            <Link className="btn btn-primary" to={`/templates/${templateId}/fill`}>
              <Plus size={16} />
              New response
            </Link>
          </div>
        ) : (
          <ol className="response-list">
            {responses.map((response, index) => (
              <li key={response.id} className="response-row">
                <span className="response-number">#{responses.length - index}</span>
                <div className="response-main">
                  <span className="response-time">{formatDateTime(response.submittedAt)}</span>
                </div>
                <div className="response-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => downloadResponsePdf(response)}
                  >
                    <Download size={16} />
                    Re-download PDF
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
};
