import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TrainingResult } from "~/types";

interface TrainingConfigState {
  // Configuration
  loss: string;
  optimizer: string;
  learningRate: number;
  epochs: number;
  batchSize: number;

  // Training state
  isTraining: boolean;
  trainingHistory: TrainingResult[];
  openHistoryItemIdx: number | null;

  // Configuration actions
  setLoss: (loss: string) => void;
  setOptimizer: (optimizer: string) => void;
  setLearningRate: (rate: number) => void;
  setEpochs: (epochs: number) => void;
  setBatchSize: (size: number) => void;

  // Training actions
  setIsTraining: (training: boolean) => void;
  addTrainingResult: (result: TrainingResult) => void;
  setOpenHistoryItem: (idx: number | null) => void;
  clearHistory: () => void;
  resetConfig: () => void;
}

const defaultConfig = {
  loss: "BCE",
  optimizer: "Adam",
  learningRate: 0.001,
  epochs: 100,
  batchSize: 10,
};

export const useTrainingStore = create<TrainingConfigState>()(
  immer((set) => ({
    ...defaultConfig,

    // Initial training state
    isTraining: false,
    trainingHistory: [],
    openHistoryItemIdx: null,

    // Config actions
    setLoss: (loss: string) => {
      set((state) => {
        state.loss = loss;
      });
    },

    setOptimizer: (optimizer: string) => {
      set((state) => {
        state.optimizer = optimizer;
      });
    },

    setLearningRate: (rate: number) => {
      set((state) => {
        if (rate > 0) {
          state.learningRate = rate;
        }
      });
    },

    setEpochs: (epochs: number) => {
      set((state) => {
        if (epochs > 0) {
          state.epochs = epochs;
        }
      });
    },

    setBatchSize: (size: number) => {
      set((state) => {
        if (size > 0) {
          state.batchSize = size;
        }
      });
    },

    // Training actions
    setIsTraining: (training: boolean) => {
      set((state) => {
        state.isTraining = training;
      });
    },

    addTrainingResult: (result: TrainingResult) => {
      set((state) => {
        state.trainingHistory.unshift(result); // Add to beginning for newest first
      });
    },

    setOpenHistoryItem: (idx: number | null) => {
      set((state) => {
        state.openHistoryItemIdx = idx;
      });
    },

    clearHistory: () => {
      set((state) => {
        state.trainingHistory = [];
        state.openHistoryItemIdx = null;
      });
    },

    resetConfig: () => {
      set((state) => {
        Object.assign(state, defaultConfig);
      });
    },
  })),
);
