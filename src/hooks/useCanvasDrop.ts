import { useState } from "react";
import { isFieldType } from "@utils/fieldRegistry";
import { DRAG_MOVE_FIELD, DRAG_NEW_FIELD, isBuilderDrag } from "@utils/dragData";

import type { FieldType } from "@typedefs";
import type { DragEvent } from "react";

interface FieldDropOptions {
  onAdd: (type: FieldType, index: number) => void;
  onMove: (fieldId: string, index: number) => void;
}

/** Where a drop at `clientY` would insert: the number of cards whose middle is above the pointer. */
const dropIndexAt = (container: HTMLElement, clientY: number): number =>
  Array.from(container.querySelectorAll<HTMLElement>("[data-card]")).filter((card) => {
    const rect = card.getBoundingClientRect();
    return clientY > rect.top + rect.height / 2;
  }).length;

/** Drag-and-drop for adding and reordering canvas cards (`data-card`). */
export const useCanvasDrop = ({ onAdd, onMove }: FieldDropOptions) => {
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const dropProps = {
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!isBuilderDrag(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = event.dataTransfer.types.includes(DRAG_MOVE_FIELD) ? "move" : "copy";
      setDropIndex(dropIndexAt(event.currentTarget, event.clientY));
    },
    onDragLeave: (event: DragEvent<HTMLElement>) => {
      if (!(event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget))) {
        setDropIndex(null);
      }
    },
    onDrop: (event: DragEvent<HTMLElement>) => {
      if (!isBuilderDrag(event.dataTransfer)) {
        return;
      }
      event.preventDefault();
      const index = dropIndexAt(event.currentTarget, event.clientY);
      setDropIndex(null);
      const type = event.dataTransfer.getData(DRAG_NEW_FIELD);
      const fieldId = event.dataTransfer.getData(DRAG_MOVE_FIELD);
      if (isFieldType(type)) {
        onAdd(type, index);
      } else if (fieldId !== "") {
        onMove(fieldId, index);
      }
    },
  };

  const clearDrop = () => setDropIndex(null);

  return { dropIndex, dropProps, clearDrop };
};
