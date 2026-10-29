import { Heading } from "lucide-react";
import { SegmentedSetting } from "@components/settings/SettingInputs";

import type { Choice, ConfigEditorProps, FieldDefinition, InputProps, SectionSize } from "@typedefs";

const sizeChoices: readonly Choice<SectionSize>[] = [
  { value: "xs", label: "XS" },
  { value: "sm", label: "S" },
  { value: "md", label: "M" },
  { value: "lg", label: "L" },
  { value: "xl", label: "XL" },
];

// The form title is the page's h1, so sections start at h2.
const headingTags = { xl: "h2", lg: "h3", md: "h4", sm: "h5", xs: "h6" } as const;

const SectionHeading = ({ field }: InputProps<"section">) => {
  const Tag = headingTags[field.config.size];
  return <Tag className={`section-heading section-${field.config.size}`}>{field.label || "Untitled section"}</Tag>;
};

const SectionConfigEditor = ({ field, onChange }: ConfigEditorProps<"section">) => (
  <SegmentedSetting
    label="Size"
    value={field.config.size}
    options={sizeChoices}
    onChange={(size) => onChange({ ...field.config, size })}
  />
);

export const sectionField: FieldDefinition<"section"> = {
  type: "section",
  name: "Section header",
  description: "A heading to group fields",
  icon: Heading,
  kind: "display",
  defaultLabel: "New section",
  createConfig: () => ({ size: "lg" }),
  initialValue: () => null,
  readValue: () => null,
  isEmpty: () => true,
  toPdfBlock: (field) => ({ kind: "heading", text: field.label, size: field.config.size }),
  ConfigEditor: SectionConfigEditor,
  Input: SectionHeading,
};
