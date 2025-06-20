import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { createStoreWithProducer } from "@xstate/store";
import { useSelector } from "@xstate/store/react";
import { produce } from "immer";
import { LAYER_BLOCKS } from "~/util/LAYER_BLOCKS";
import { ActivationFunction, UILayer } from "~/types";

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

const boardStore = createStoreWithProducer(produce, {
  context: { canvasBlocks: [], activeBlock: null } as {
    canvasBlocks: UILayer[];
    activeBlock: UILayer | null;
  },
  on: {
    dragStart: (context, event: DragStartEvent) => {
      const { id } = event.active;
      const block =
        (LAYER_BLOCKS.find((item) => item.id === id) as UILayer) ||
        (context.canvasBlocks.find(
          (item: { id: UniqueIdentifier }) => item.id === id,
        ) as UILayer);
      context.activeBlock = block;
    },

    dragOver: (context, event: DragOverEvent) => {
      const { active, over } = event;

      if (
        over &&
        active.id !== over.id &&
        context.canvasBlocks.some((block) => block.id === active.id)
      ) {
        const oldIndex = context.canvasBlocks.findIndex(
          (block) => block.id === active.id,
        );
        const newIndex = context.canvasBlocks.findIndex(
          (block) => block.id === over.id,
        );

        const reorderedBlocks = arrayMove(
          context.canvasBlocks,
          oldIndex,
          newIndex,
        );

        // Update neuron connectivity after reordering
        context.canvasBlocks = reorderedBlocks.map((block, index) => {
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
    },

    dragEnd: (context, event: DragEndEvent) => {
      const { over } = event;

      // Log the drop position
      console.log("Dropped item over target:", over);

      if (over && over.id === "canvas" && context.activeBlock) {
        const newBlock = {
          ...context.activeBlock,
          id: `${context.activeBlock.id}-${Date.now()}`,
        }; // Ensure unique ID for each new block

        if (context.canvasBlocks.length > 0) {
          const lastBlock =
            context.canvasBlocks[context.canvasBlocks.length - 1];
          if (lastBlock) {
            newBlock.inputNeurons = lastBlock.outputNeurons;
          }
        }

        context.canvasBlocks.push(newBlock);
      }

      context.activeBlock = null;
    },

    changeActivationFunction: (
      context,
      event: { id: string; activationFunction: ActivationFunction },
    ) => {
      const { id, activationFunction } = event;
      context.canvasBlocks = context.canvasBlocks.map((block) =>
        block.id === id ? { ...block, activationFunction } : block,
      );
    },

    changeInputNeurons: (
      context,
      event: { id: string; inputNeurons: number },
    ) => {
      const { id, inputNeurons } = event;
      context.canvasBlocks = context.canvasBlocks.map((block) =>
        block.id === id ? { ...block, inputNeurons } : block,
      );
    },

    changeOutputNeurons: (
      context,
      event: { id: string; outputNeurons: number },
    ) => {
      const { id, outputNeurons } = event;

      const currentLayerIndex = context.canvasBlocks.findIndex(
        (block) => block.id === id,
      );

      context.canvasBlocks = context.canvasBlocks.map((block, index) => {
        if (block.id === id) {
          return { ...block, outputNeurons };
        }

        if (index === currentLayerIndex + 1) {
          return { ...block, inputNeurons: outputNeurons };
        }

        return block;
      });
    },

    changeOtherParams: (
      context,
      event: { id: string; otherParams: Record<string, number> },
    ) => {
      const { id, otherParams } = event;
      context.canvasBlocks = context.canvasBlocks.map((block) =>
        block.id === id ? { ...block, otherParams } : block,
      );
    },

    synchronizeConnections: (context) => {
      context.canvasBlocks = syncLayerConnections(context.canvasBlocks);
    },

    setCanvasBlocks: (context, event: { canvasBlocks: UILayer[] }) => {
      context.canvasBlocks = syncLayerConnections(event.canvasBlocks);
    },

    removeLayer: (context, event: { id: string }) => {
      context.canvasBlocks = context.canvasBlocks.filter(
        (block) => block.id !== event.id,
      );
      context.canvasBlocks = syncLayerConnections(context.canvasBlocks);
    },
  },
});

export const useBoardStore = () => {
  return {
    canvasBlocks: useSelector(
      boardStore,
      (state) => state.context.canvasBlocks,
    ),
    activeBlock: useSelector(boardStore, (state) => state.context.activeBlock),
    changeActivationFunction: (
      id: string,
      activationFunction: ActivationFunction,
    ) => {
      boardStore.send({
        type: "changeActivationFunction",
        id,
        activationFunction,
      });
    },
    changeInputNeurons: (id: string, inputNeurons: number) => {
      boardStore.send({ type: "changeInputNeurons", id, inputNeurons });
    },
    changeOutputNeurons: (id: string, outputNeurons: number) => {
      boardStore.send({ type: "changeOutputNeurons", id, outputNeurons });
    },
    changeOtherParams: (id: string, otherParams: Record<string, number>) => {
      boardStore.send({ type: "changeOtherParams", id, otherParams });
    },
    synchronizeConnections: () => {
      boardStore.send({ type: "synchronizeConnections" });
    },
    setCanvasBlocks: (canvasBlocks: UILayer[]) => {
      boardStore.send({ type: "setCanvasBlocks", canvasBlocks });
    },
    removeLayer: (id: string) => {
      boardStore.send({ type: "removeLayer", id });
    },

    drag: {
      start: (event: DragStartEvent) => {
        boardStore.send({ type: "dragStart", ...event });
      },
      over: (event: DragOverEvent) => {
        boardStore.send({ type: "dragOver", ...event });
      },
      end: (event: DragEndEvent) => {
        boardStore.send({ type: "dragEnd", ...event });
      },
    },
  };
};
