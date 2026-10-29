import { CircleAlert } from "lucide-react";
import { useState } from "react";
import { TextSetting, ToggleSetting } from "@components/settings/SettingInputs";
import { getFieldDefinition } from "@utils/fieldRegistry";
import { setFieldConfig } from "@utils/templateFields";
import { classNames } from "@utils/classNames";
import { FieldLogicEditor } from "./FieldLogicEditor";

import type { Field } from "@typedefs";

interface ConfigPanelProps {
  field: Field;
  fields: readonly Field[];
  issues: readonly string[];
  onChange: (field: Field) => void;
}

type Tab = "settings" | "logic";

export const FieldSettingsPanel = ({ field, fields, issues, onChange }: ConfigPanelProps) => {
  const [tab, setTab] = useState<Tab>("settings");
  const definition = getFieldDefinition(field);
  const conditionCount = field.logic.conditions.length;

  return (
    <aside className="config-panel" aria-label="Field settings">
      <div className="panel-head">
        <span className="type-chip">
          <definition.icon size={13} />
          {definition.name}
        </span>
        <div className="tabs" role="tablist">
          {(["settings", "logic"] as const).map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              id={`tab-${name}`}
              aria-selected={tab === name}
              aria-controls="config-tabpanel"
              className={classNames("tab", tab === name && "is-active")}
              onClick={() => setTab(name)}
            >
              {name === "settings" ? "Settings" : "Logic"}
              {name === "logic" && conditionCount > 0 && <span className="tab-count">{conditionCount}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-body" role="tabpanel" id="config-tabpanel" aria-labelledby={`tab-${tab}`}>
        {issues.length > 0 && (
          <ul className="issue-list">
            {issues.map((issue) => (
              <li key={issue}>
                <CircleAlert size={14} />
                {issue}
              </li>
            ))}
          </ul>
        )}
        {tab === "settings" ? (
          <div className="settings-stack">
            <TextSetting
              label={definition.kind === "display" ? "Heading text" : "Label"}
              required
              value={field.label}
              onChange={(label) => onChange({ ...field, label })}
            />
            {definition.kind === "input" && (
              <ToggleSetting
                label="Required"
                hint="Conditions in Logic can change this."
                checked={field.required}
                onChange={(required) => onChange({ ...field, required })}
              />
            )}
            <definition.ConfigEditor
              field={field}
              fields={fields}
              onChange={(config) => onChange(setFieldConfig(field, config))}
            />
          </div>
        ) : (
          <FieldLogicEditor field={field} fields={fields} onChange={onChange} />
        )}
      </div>
    </aside>
  );
};
