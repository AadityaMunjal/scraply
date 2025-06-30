"use client";
import { useDroppable } from "@dnd-kit/core";
import {
  verticalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { MdAdd as PlusIcon } from "react-icons/md";
import SortableBlock from "./SortableBlock";
import { useBoardStore } from "~/state/boardStore";
import { UILayer } from "~/types/index";

interface DroppableCanvasProps {}

const DroppableCanvas = ({}: DroppableCanvasProps) => {
  const { canvasBlocks } = useBoardStore();
  const { setNodeRef } = useDroppable({
    id: "canvas",
  });

  const { setNodeRef: setEmptySkeletonRef, isOver: isOverEmptySkeleton } =
    useDroppable({
      id: "empty-skeleton",
    });

  return (
    <div
      ref={setNodeRef}
      className="z-10 flex min-h-[600px] flex-col items-center whitespace-nowrap rounded-2xl border-2 border-dashed border-blue-600 bg-zinc-900 p-2 pb-[100px]"
    >
      <SortableContext
        items={canvasBlocks.map((block: UILayer) => block.id)}
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

      <div className="overlayblock-div mt-2 min-w-[40%]">
        <div className="group relative flex items-center gap-2">
          <div
            ref={setEmptySkeletonRef}
            className={`flex-1 cursor-pointer rounded-xl border-2 border-dashed p-4 text-gray-400 shadow-lg ring-1 backdrop-blur-sm transition-all duration-300 ${
              isOverEmptySkeleton
                ? "border-blue-400 bg-blue-900/30 text-blue-300 shadow-blue-400/20 ring-blue-400/50"
                : "border-gray-500 bg-zinc-800/50 ring-gray-500/20 hover:shadow-xl hover:ring-gray-400/30"
            }`}
          >
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <PlusIcon size={24} />
              </div>
            </div>
          </div>
          {/* Invisible spacer for remove button area */}
          <div className="h-6 w-6"></div>
        </div>
      </div>
    </div>
  );
};

export default DroppableCanvas;
