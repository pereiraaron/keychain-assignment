import { fieldRegistry, fieldTypeOrder } from "@utils/fieldRegistry";
import { DRAG_NEW_FIELD } from "@utils/dragData";

import type { FieldType } from "@typedefs";

export const FieldPalette = ({ onAdd }: { onAdd: (type: FieldType) => void }) => (
  <aside className="palette" aria-label="Field types">
    <div className="panel-head">
      <h2 className="panel-title">Fields</h2>
      <p className="panel-hint">Click to add, or drag onto the form.</p>
    </div>
    <ul className="palette-list">
      {fieldTypeOrder.map((type) => {
        const definition = fieldRegistry[type];
        return (
          <li key={type}>
            <button
              type="button"
              className="palette-item"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData(DRAG_NEW_FIELD, type);
                event.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => onAdd(type)}
            >
              <span className="palette-icon">
                <definition.icon size={16} />
              </span>
              <span className="palette-text">
                <span className="palette-name">{definition.name}</span>
                <span className="palette-desc">{definition.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  </aside>
);
