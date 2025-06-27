"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import OverlayBlock from "./OverlayBlock";
import { useBoardStore } from "~/state/boardStore";
import { UILayer } from "~/types/index";

interface SortableBlockProps {
  id: string;
  label: string;
  color: string;
}

const SortableBlock = ({ id, label, color }: SortableBlockProps) => {
  const { canvasBlocks } = useBoardStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    minWidth: "40%",
  };

  const block = canvasBlocks.find((block: UILayer) => block.id === id);
  if (!block) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="overlayblock-div"
    >
      <OverlayBlock label={label} color={color} id={id} block={block} />
    </div>
  );
};

export default SortableBlock;
