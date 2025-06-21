import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { LAYER_BLOCKS } from "~/util/LAYER_BLOCKS";
import { ActivationFunction, UILayer } from "~/types";
import { validateUILayers, ValidationError } from "~/utils/validation";

const syncLayerConnections = (blocks: UILayer[]): UILayer[] => {
  return blocks.map((block, index) => {
    if (index === 0) {
      return block;
    }

    const previousLayer = blocks[index - 1];
    if (previousLayer) {
      return {
        ...block,
        inputNeurons: previousLayer.outputNeurons,
      };
    }
    return block;
  });
};

interface BoardState {
  canvasBlocks: UILayer[];
  activeBlock: UILayer | null;
  layerValidationErrors: ValidationError[];
  layersValid: boolean;

  // Actions
  dragStart: (event: DragStartEvent) => void;
  dragOver: (event: DragOverEvent) => void;
  dragEnd: (event: DragEndEvent) => void;
  changeActivationFunction: (
    id: string,
    activationFunction: ActivationFunction,
  ) => void;
  changeInputNeurons: (id: string, inputNeurons: number) => void;
  changeOutputNeurons: (id: string, outputNeurons: number) => void;
  changeOtherParams: (id: string, otherParams: Record<string, number>) => void;
  synchronizeConnections: () => void;
  setCanvasBlocks: (canvasBlocks: UILayer[]) => void;
  removeLayer: (id: string) => void;
}

const validateLayers = (blocks: UILayer[]): ValidationError[] => {
  return validateUILayers(blocks);
};

export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    canvasBlocks: [],
    activeBlock: null,
    layerValidationErrors: [],
    layersValid: true,

    dragStart: (event: DragStartEvent) => {
      set((state) => {
        const { id } = event.active;
        const block =
          (LAYER_BLOCKS.find((item) => item.id === id) as UILayer) ||
          (state.canvasBlocks.find(
            (item: { id: UniqueIdentifier }) => item.id === id,
          ) as UILayer);
        state.activeBlock = block;
      });
    },

    dragOver: (event: DragOverEvent) => {
      set((state) => {
        const { active, over } = event;

        if (
          over &&
          active.id !== over.id &&
          state.canvasBlocks.some((block) => block.id === active.id)
        ) {
          const oldIndex = state.canvasBlocks.findIndex(
            (block) => block.id === active.id,
          );
          const newIndex = state.canvasBlocks.findIndex(
            (block) => block.id === over.id,
          );

          const reorderedBlocks = arrayMove(
            state.canvasBlocks,
            oldIndex,
            newIndex,
          );

          // Update neuron connectivity after reordering
          state.canvasBlocks = reorderedBlocks.map((block, index) => {
            if (index === 0) {
              return block;
            }

            const previousLayer = reorderedBlocks[index - 1];
            if (previousLayer) {
              return {
                ...block,
                inputNeurons: previousLayer.outputNeurons,
              };
            }
            return block;
          });
        }
      });
    },

    dragEnd: (event: DragEndEvent) => {
      set((state) => {
        const { over } = event;

        // Log the drop position
        console.log("Dropped item over target:", over);

        if (over && over.id === "canvas" && state.activeBlock) {
          const newBlock = {
            ...state.activeBlock,
            id: `${state.activeBlock.id}-${Date.now()}`,
          }; // Ensure unique ID for each new block

          if (state.canvasBlocks.length > 0) {
            const lastBlock = state.canvasBlocks[state.canvasBlocks.length - 1];
            if (lastBlock) {
              newBlock.inputNeurons = lastBlock.outputNeurons;
            }
          }

          state.canvasBlocks.push(newBlock);
          state.layerValidationErrors = validateLayers(state.canvasBlocks);
          state.layersValid = state.layerValidationErrors.length === 0;
        }

        state.activeBlock = null;
      });
    },

    changeActivationFunction: (
      id: string,
      activationFunction: ActivationFunction,
    ) => {
      set((state) => {
        state.canvasBlocks = state.canvasBlocks.map((block) =>
          block.id === id ? { ...block, activationFunction } : block,
        );
      });
    },

    changeInputNeurons: (id: string, inputNeurons: number) => {
      set((state) => {
        state.canvasBlocks = state.canvasBlocks.map((block) =>
          block.id === id ? { ...block, inputNeurons } : block,
        );
        state.layerValidationErrors = validateLayers(state.canvasBlocks);
        state.layersValid = state.layerValidationErrors.length === 0;
      });
    },

    changeOutputNeurons: (id: string, outputNeurons: number) => {
      set((state) => {
        const currentLayerIndex = state.canvasBlocks.findIndex(
          (block) => block.id === id,
        );

        state.canvasBlocks = state.canvasBlocks.map((block, index) => {
          if (block.id === id) {
            return { ...block, outputNeurons };
          }

          if (index === currentLayerIndex + 1) {
            return { ...block, inputNeurons: outputNeurons };
          }

          return block;
        });

        state.layerValidationErrors = validateLayers(state.canvasBlocks);
        state.layersValid = state.layerValidationErrors.length === 0;
      });
    },

    changeOtherParams: (id: string, otherParams: Record<string, number>) => {
      set((state) => {
        state.canvasBlocks = state.canvasBlocks.map((block) =>
          block.id === id ? { ...block, otherParams } : block,
        );
        state.layerValidationErrors = validateLayers(state.canvasBlocks);
        state.layersValid = state.layerValidationErrors.length === 0;
      });
    },

    synchronizeConnections: () => {
      set((state) => {
        state.canvasBlocks = syncLayerConnections(state.canvasBlocks);
      });
    },

    setCanvasBlocks: (canvasBlocks: UILayer[]) => {
      set((state) => {
        state.canvasBlocks = syncLayerConnections(canvasBlocks);
      });
    },

    removeLayer: (id: string) => {
      set((state) => {
        state.canvasBlocks = state.canvasBlocks.filter(
          (block) => block.id !== id,
        );
        state.canvasBlocks = syncLayerConnections(state.canvasBlocks);
        state.layerValidationErrors = validateLayers(state.canvasBlocks);
        state.layersValid = state.layerValidationErrors.length === 0;
      });
    },
  })),
);
