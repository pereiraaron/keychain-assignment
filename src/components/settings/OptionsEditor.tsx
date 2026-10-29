import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { createId } from "@utils/id";

import type { Option } from "@typedefs";

interface OptionsEditorProps {
  options: readonly Option[];
  onChange: (options: Option[]) => void;
}

export const createOptions = (...labels: string[]): Option[] => labels.map((label) => ({ id: createId(), label }));

/** Add, rename, reorder and remove options. Ids stay the same when a label changes. */
export const OptionsEditor = ({ options, onChange }: OptionsEditorProps) => {
  const move = (from: number, to: number) => {
    const next = [...options];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div className="setting">
      <div className="setting-label">Options</div>
      <ol className="options-editor">
        {options.map((option, index) => (
          <li key={option.id} className="option-row">
            <input
              className="input"
              value={option.label}
              aria-label={`Option ${index + 1}`}
              placeholder={`Option ${index + 1}`}
              onChange={(event) =>
                onChange(options.map((item) => (item.id === option.id ? { ...item, label: event.target.value } : item)))
              }
            />
            <button
              type="button"
              className="icon-btn"
              aria-label={`Move option ${index + 1} up`}
              disabled={index === 0}
              onClick={() => move(index, index - 1)}
            >
              <ChevronUp size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Move option ${index + 1} down`}
              disabled={index === options.length - 1}
              onClick={() => move(index, index + 1)}
            >
              <ChevronDown size={16} />
            </button>
            <button
              type="button"
              className="icon-btn icon-btn-danger"
              aria-label={`Remove option ${index + 1}`}
              onClick={() => onChange(options.filter((item) => item.id !== option.id))}
            >
              <X size={16} />
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => onChange([...options, ...createOptions(`Option ${options.length + 1}`)])}
      >
        <Plus size={16} />
        Add option
      </button>
    </div>
  );
};
