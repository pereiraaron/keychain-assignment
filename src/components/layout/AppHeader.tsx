import { Layers } from "lucide-react";
import { Link } from "react-router";

import type { ReactNode } from "react";

export const AppHeader = ({ children }: { children?: ReactNode }) => (
  <header className="app-header">
    <Link to="/" className="brand">
      <span className="brand-mark">
        <Layers size={16} />
      </span>
      Form Builder
    </Link>
    <div className="app-header-actions">{children}</div>
  </header>
);
