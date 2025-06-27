import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TrainingResult, LossFunction, OptimizerType } from "~/types/index";
import { DEFAULT_TRAINING_CONFIG } from "~/configs/training";

interface TrainingConfigState {
  // Configuration
  loss: LossFunction;
  optimizer: OptimizerType;
  learningRate: number;
  epochs: number;
  batchSize: number;

  // Training state
  isTraining: boolean;
  trainingHistory: TrainingResult[];
  openHistoryItemIdx: number | null;

  // Configuration actions
  setLoss: (loss: LossFunction) => void;
  setOptimizer: (optimizer: OptimizerType) => void;
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

const defaultConfig = DEFAULT_TRAINING_CONFIG;

export const useTrainingStore = create<TrainingConfigState>()(
  immer((set) => ({
    ...defaultConfig,

    // Initial training state
    isTraining: false,
    trainingHistory: [],
    openHistoryItemIdx: null,

    // Config actions
    setLoss: (loss: LossFunction) => {
      set((state) => {
        state.loss = loss;
      });
    },

    setOptimizer: (optimizer: OptimizerType) => {
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
        state.trainingHistory.push(result);
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
        state.trainingHistory = [];
        state.openHistoryItemIdx = null;
      });
    },
  })),
);
