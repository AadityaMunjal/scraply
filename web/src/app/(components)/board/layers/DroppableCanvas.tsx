"use client";
import { useDroppable } from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import SortableBlock from "./SortableBlock";
import { useBoardStore } from "~/state/boardStore";
import { LegacyUILayer } from "~/types";

interface DroppableCanvasProps {}

const DroppableCanvas = ({}: DroppableCanvasProps) => {
  const { canvasBlocks } = useBoardStore();
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  return (
    <div
      ref={setNodeRef}
      className="z-10 flex min-h-[600px] flex-col items-center whitespace-nowrap rounded-2xl border border-dashed border-blue-600 bg-zinc-900 p-2 pb-[100px]"
    >
      <SortableContext
        items={canvasBlocks.map((block: LegacyUILayer) => block.id)}
        strategy={verticalListSortingStrategy}
      >
        {canvasBlocks.map((block) => (
          <SortableBlock
            key={block.id}
            id={block.id}
            label={block.label}
            color={block.color}
          />
        ))}
      </SortableContext>
    </div>
  );
};

export default DroppableCanvas;
