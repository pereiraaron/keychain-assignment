import { Check, Download, List, Pencil } from "lucide-react";
import { Link } from "react-router";
import { ResponseForm } from "@components/form/ResponseForm";
import { AppHeader } from "@components/layout/AppHeader";
import { NotFound } from "@components/layout/NotFound";
import { useResponseSubmission } from "@hooks/useResponseSubmission";
import { useTemplate } from "@hooks/useTemplates";
import { downloadResponsePdf } from "@utils/pdfExport";
import { formatDateTime } from "@utils/format";

export const FillPage = ({ templateId }: { templateId: string }) => {
  const template = useTemplate(templateId);
  const { submission, submit, startOver } = useResponseSubmission(template);

  if (!template) {
    return <NotFound message="This template doesn't exist. It may have been deleted, or it was never saved." />;
  }

  return (
    <>
      <AppHeader>
        <Link className="btn btn-ghost btn-sm" to={`/templates/${templateId}/responses`}>
          <List size={16} />
          Responses
        </Link>
        <Link className="btn btn-ghost btn-sm" to={`/templates/${templateId}`}>
          <Pencil size={16} />
          Edit template
        </Link>
      </AppHeader>
      <main className="page page-narrow">
        {submission ? (
          <div className="card success-card">
            <div className="success-icon">
              <Check size={22} />
            </div>
            <h1>Response submitted</h1>
            <p className="muted">
              {template.title || "Untitled form"} · {formatDateTime(submission.submittedAt)}
            </p>
            <div className="success-actions">
              <button type="button" className="btn btn-primary" onClick={() => downloadResponsePdf(submission)}>
                <Download size={16} />
                Download PDF
              </button>
              <button type="button" className="btn btn-secondary" onClick={startOver}>
                Submit another response
              </button>
              <Link className="btn btn-ghost" to={`/templates/${templateId}/responses`}>
                View all responses
              </Link>
            </div>
          </div>
        ) : (
          <div className="card">
            <ResponseForm snapshot={template} submitLabel="Submit" onSubmit={submit} />
          </div>
        )}
      </main>
    </>
  );
};
