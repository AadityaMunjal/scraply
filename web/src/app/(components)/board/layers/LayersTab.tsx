import {
  useSensors,
  useSensor,
  PointerSensor,
  DndContext,
  closestCenter,
  DragOverlay,
} from "@dnd-kit/core";
import React from "react";
import { useBoardStore } from "~/state/boardStore";
import { LAYER_BLOCKS } from "~/util/LAYER_BLOCKS";
import { hasParams } from "~/types/index";
import DraggableBlock from "./DraggableBlock";
import DroppableCanvas from "./DroppableCanvas";
import OverlayBlock from "./OverlayBlock";

interface LayersTabProps {}

const LayersTab: React.FC<LayersTabProps> = () => {
  const { activeBlock, dragStart, dragOver, dragEnd } = useBoardStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={dragStart}
      onDragOver={dragOver}
      onDragEnd={dragEnd}
      sensors={sensors}
    >
      <div className={`mx-20 mt-10 flex`}>
        {/* Toolbox area */}
        <div className="mr-4">
          <div className="rounded-xl bg-zinc-800 py-1">
            {LAYER_BLOCKS.map((block) => (
              <DraggableBlock
                key={block.id}
                id={block.id}
                label={block.label}
                color={block.color}
                params={
                  hasParams(block)
                    ? (block.params as Record<string, number>)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
        {/* Canvas area */}
        <div className="mr-10 flex-grow">
          <div className="relative">
            <DroppableCanvas />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeBlock ? (
          <OverlayBlock
            id={activeBlock.id}
            label={activeBlock.label}
            color={activeBlock.color}
            block={activeBlock}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default LayersTab;
