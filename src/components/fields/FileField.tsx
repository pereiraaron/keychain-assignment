import { FileText, Paperclip, X } from "lucide-react";
import { NumberSetting, TextSetting } from "@components/settings/SettingInputs";
import { formatFileSize, pluralize } from "@utils/format";
import { pdfAnswer } from "@utils/fieldHelpers";

import type { ConfigEditorProps, FieldDefinition, FileMeta, InputProps } from "@typedefs";

/** ".PDF, png" -> [".pdf", ".png"] */
const allowedExtensions = (accept: string): string[] =>
  accept
    .split(",")
    .map((ext) => ext.trim().toLowerCase())
    .filter((ext) => ext !== "")
    .map((ext) => (ext.startsWith(".") ? ext : `.${ext}`));

const isFileMeta = (value: unknown): value is FileMeta =>
  typeof value === "object" && value !== null && "name" in value && "size" in value && "type" in value;

const FileInput = ({ field, value, onChange, inputId, describedBy, invalid, required }: InputProps<"file">) => {
  const extensions = allowedExtensions(field.config.accept);

  return (
    <div className="file-field">
      <input
        id={inputId}
        type="file"
        className="input"
        multiple={field.config.maxFiles > 1}
        accept={extensions.join(",") || undefined}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        aria-required={required}
        onChange={(event) => {
          // Only the file details are kept; the contents are never read.
          const picked = Array.from(event.target.files ?? [], (file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
          }));
          onChange([...value, ...picked]);
          // Lets the same file be picked again after it is removed.
          event.target.value = "";
        }}
      />
      {value.length > 0 && (
        <ul className="file-list">
          {value.map((file, index) => (
            <li key={`${file.name}-${String(index)}`}>
              <FileText size={16} />
              <span className="file-name">{file.name}</span>
              <span className="muted">{formatFileSize(file.size)}</span>
              <button
                type="button"
                className="icon-btn"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(value.filter((_, other) => other !== index))}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FileConfigEditor = ({ field, onChange }: ConfigEditorProps<"file">) => {
  const { config } = field;
  return (
    <>
      <TextSetting
        label="Allowed file types"
        placeholder=".pdf, .jpg, .png"
        hint="Comma-separated. Leave empty to allow any file."
        value={config.accept}
        onChange={(accept) => onChange({ ...config, accept })}
      />
      <NumberSetting
        label="Max number of files"
        integer
        min={1}
        placeholder="1"
        value={config.maxFiles}
        onChange={(maxFiles) => onChange({ ...config, maxFiles: Math.max(1, maxFiles ?? 1) })}
      />
    </>
  );
};

export const fileField: FieldDefinition<"file"> = {
  type: "file",
  name: "File upload",
  description: "Attach files (details only)",
  icon: Paperclip,
  kind: "input",
  defaultLabel: "Attachments",
  createConfig: () => ({ accept: "", maxFiles: 1 }),
  initialValue: () => [],
  readValue: (raw) => (Array.isArray(raw) ? raw.filter(isFileMeta) : []),
  isEmpty: (value) => value.length === 0,
  validate: (value, field) => {
    if (value.length > field.config.maxFiles) {
      return `Attach no more than ${pluralize(field.config.maxFiles, "file")}.`;
    }
    const extensions = allowedExtensions(field.config.accept);
    const wrong = value.find(
      (file) => extensions.length > 0 && !extensions.some((ext) => file.name.toLowerCase().endsWith(ext)),
    );
    return wrong ? `${wrong.name} isn't an accepted file type.` : null;
  },
  toPdfBlock: (field, value) =>
    pdfAnswer(
      field.label,
      value.map((file) => `${file.name} (${formatFileSize(file.size)})`),
      value.length > 0 ? "Only file names are listed. The files themselves aren't part of this export." : undefined,
    ),
  ConfigEditor: FileConfigEditor,
  Input: FileInput,
};
