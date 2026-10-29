/** Drag data for a new field from the field list. The value is the field type. */
export const DRAG_NEW_FIELD = "application/x-form-builder-new-field";
/** Drag data for moving a field on the canvas. The value is the field id. */
export const DRAG_MOVE_FIELD = "application/x-form-builder-move-field";

export const isBuilderDrag = (dataTransfer: DataTransfer): boolean =>
  dataTransfer.types.includes(DRAG_NEW_FIELD) || dataTransfer.types.includes(DRAG_MOVE_FIELD);
