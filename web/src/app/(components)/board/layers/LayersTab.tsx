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
import DraggableBlock from "./DraggableBlock";
import DroppableCanvas from "./DroppableCanvas";
import OverlayBlock from "./OverlayBlock";
import ValidationDisplay from "../../ValidationDisplay";

interface LayersTabProps {}

const LayersTab: React.FC<LayersTabProps> = () => {
  const {
    canvasBlocks,
    activeBlock,
    dragStart,
    dragOver,
    dragEnd,
    layerValidationErrors,
    layersValid,
  } = useBoardStore();

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
                otherParams={block.otherParams}
              />
            ))}
          </div>
        </div>
        {/* Canvas area */}
        <div className="mr-10 flex-grow">
          <div className="relative">
            <DroppableCanvas />
          </div>

          {/* Layer Validation */}
          {canvasBlocks.length > 0 && (
            <div className="mt-4">
              <ValidationDisplay
                errors={layerValidationErrors}
                isValid={layersValid}
                showSuccess={layersValid}
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <DragOverlay>
        {activeBlock && (
          <div
            style={{
              width: document
                .getElementsByClassName("overlayblock-div")[0]
                ?.getBoundingClientRect().width,
            }}
          >
            <OverlayBlock
              label={activeBlock.label}
              color={activeBlock.color}
              id={activeBlock.id}
              block={canvasBlocks.find((b) => b.id === activeBlock.id)!}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default LayersTab;
