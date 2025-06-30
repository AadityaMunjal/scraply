import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { LAYER_BLOCKS } from "~/util/LAYER_BLOCKS";
import { UILayer, hasNeurons } from "~/types/index";

const syncLayers = (blocks: any[]): any[] => {
  return blocks.map((block, index) => {
    if (index === 0) {
      return block;
    }

    const previousLayer = blocks[index - 1];
    if (previousLayer && hasNeurons(previousLayer) && hasNeurons(block)) {
      return {
        ...block,
        params: {
          ...block.params,
          inputNeurons: previousLayer.params.outputNeurons,
        },
      };
    }
    return block;
  });
};

interface BoardState {
  canvasBlocks: any[];
  activeBlock: UILayer | null;

  // Actions
  addBlock: (block: any) => void;
  updateBlock: (id: string, updates: any) => void;
  updateInputNeurons: (id: string, inputNeurons: number) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (oldIndex: number, newIndex: number) => void;
  clearCanvas: () => void;

  // Drag and drop handlers
  dragStart: (event: DragStartEvent) => void;
  dragOver: (event: DragOverEvent) => void;
  dragEnd: (event: DragEndEvent) => void;
}

export const useBoardStore = create<BoardState>()(
  immer((set, get) => ({
    canvasBlocks: [],
    activeBlock: null,

    addBlock: (block: UILayer) => {
      set((state) => {
        state.canvasBlocks.push(block);
        state.canvasBlocks = syncLayers(state.canvasBlocks);
      });
    },

    updateBlock: (id: string, updates: any) => {
      set((state) => {
        const blockIndex = state.canvasBlocks.findIndex(
          (b: any) => b.id === id,
        );
        if (blockIndex !== -1) {
          const currentBlock = state.canvasBlocks[blockIndex];
          if (currentBlock) {
            state.canvasBlocks[blockIndex] = {
              ...currentBlock,
              ...updates,
            };
            state.canvasBlocks = syncLayers(state.canvasBlocks);
          }
        }
      });
    },

    updateInputNeurons: (id: string, inputNeurons: number) => {
      set((state) => {
        const blockIndex = state.canvasBlocks.findIndex(
          (b: any) => b.id === id,
        );
        if (blockIndex !== -1) {
          const currentBlock = state.canvasBlocks[blockIndex];
          if (currentBlock && hasNeurons(currentBlock)) {
            // Update the current block's input neurons
            state.canvasBlocks[blockIndex] = {
              ...currentBlock,
              params: {
                ...(currentBlock.params as any),
                inputNeurons,
              },
            };

            // Update previous layer's output neurons to match (reverse sync)
            if (blockIndex > 0) {
              const previousBlock = state.canvasBlocks[blockIndex - 1];
              if (previousBlock && hasNeurons(previousBlock)) {
                state.canvasBlocks[blockIndex - 1] = {
                  ...previousBlock,
                  params: {
                    ...(previousBlock.params as any),
                    outputNeurons: inputNeurons,
                  },
                };
              }
            }

            // Sync all layers to maintain connections
            state.canvasBlocks = syncLayers(state.canvasBlocks);
          }
        }
      });
    },

    removeBlock: (id: string) => {
      set((state) => {
        state.canvasBlocks = state.canvasBlocks.filter(
          (block: any) => block.id !== id,
        );
        state.canvasBlocks = syncLayers(state.canvasBlocks);
      });
    },

    reorderBlocks: (oldIndex: number, newIndex: number) => {
      set((state) => {
        state.canvasBlocks = arrayMove(state.canvasBlocks, oldIndex, newIndex);
        state.canvasBlocks = syncLayers(state.canvasBlocks);
      });
    },

    clearCanvas: () => {
      set((state) => {
        state.canvasBlocks = [];
      });
    },

    // Drag and drop handlers
    dragStart: (event: DragStartEvent) => {
      const { active } = event;
      const id = active.id as string;

      // Find block in toolbox first
      const toolboxBlock = LAYER_BLOCKS.find((block: any) => block.id === id);
      if (toolboxBlock) {
        set((state) => {
          state.activeBlock = toolboxBlock;
        });
        return;
      }

      // Then find in canvas
      const canvasBlock = get().canvasBlocks.find(
        (block: any) => block.id === id,
      );
      if (canvasBlock) {
        set((state) => {
          state.activeBlock = canvasBlock;
        });
      }
    },

    dragOver: (event: DragOverEvent) => {
      // Handle drag over logic if needed
    },

    dragEnd: (event: DragEndEvent) => {
      const { active, over } = event;

      set((state) => {
        state.activeBlock = null;
      });

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if we're dragging from the toolbox (not from canvas)
      const isFromToolbox = LAYER_BLOCKS.some(
        (block: any) => block.id === activeId,
      );
      const isFromCanvas = get().canvasBlocks.some(
        (block: any) => block.id === activeId,
      );

      // Handle dropping from toolbox to canvas or to existing canvas blocks
      if (isFromToolbox && !isFromCanvas) {
        const toolboxBlock = LAYER_BLOCKS.find(
          (block: any) => block.id === activeId,
        );
        if (toolboxBlock) {
          const newBlock = {
            ...toolboxBlock,
            id: `${toolboxBlock.id}-${Date.now()}`,
          };

          // If dropping on canvas, empty skeleton, or any existing canvas block, add to end
          if (
            overId === "canvas" ||
            overId === "empty-skeleton" ||
            get().canvasBlocks.some((block: any) => block.id === overId)
          ) {
            set((state) => {
              state.canvasBlocks.push(newBlock);
              state.canvasBlocks = syncLayers(state.canvasBlocks);
            });
          }
        }
        return;
      }

      // Handle reordering within canvas (only when dragging existing canvas blocks)
      if (isFromCanvas) {
        const activeIndex = get().canvasBlocks.findIndex(
          (block: any) => block.id === activeId,
        );
        const overIndex = get().canvasBlocks.findIndex(
          (block: any) => block.id === overId,
        );

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          set((state) => {
            state.canvasBlocks = arrayMove(
              state.canvasBlocks,
              activeIndex,
              overIndex,
            );
            state.canvasBlocks = syncLayers(state.canvasBlocks);
          });
        }
      }
    },
  })),
);
