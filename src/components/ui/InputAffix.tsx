import type { ReactNode } from "react";

interface AffixedProps {
  prefix: string;
  suffix: string;
  children: ReactNode;
}

/** Static text before or after an input, like "https://" or "kg". */
export const InputAffix = ({ prefix, suffix, children }: AffixedProps) => {
  if (prefix === "" && suffix === "") {
    return children;
  }
  return (
    <div className="affix">
      {prefix !== "" && <span className="affix-text">{prefix}</span>}
      {children}
      {suffix !== "" && <span className="affix-text">{suffix}</span>}
    </div>
  );
};
