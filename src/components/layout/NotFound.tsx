import { CircleAlert } from "lucide-react";
import { Link } from "react-router";
import { AppHeader } from "./AppHeader";

export const NotFound = ({ message }: { message: string }) => (
  <>
    <AppHeader />
    <main className="page">
      <div className="empty-state">
        <div className="empty-icon">
          <CircleAlert size={22} />
        </div>
        <h1>Not found</h1>
        <p>{message}</p>
        <Link className="btn btn-primary" to="/">
          Back to templates
        </Link>
      </div>
    </main>
  </>
);
