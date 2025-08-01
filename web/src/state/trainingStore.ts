import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  TrainingResult,
  LossFunction,
  OptimizerType,
  OutputsResult,
} from "~/types/index";
import { DEFAULT_TRAINING_CONFIG } from "~/util/trainingConfig";

interface TrainingProgress {
  epoch: number;
  total_epochs: number;
  progress: number;
  train_loss: number;
  train_accuracy: number;
  test_loss: number;
  test_accuracy: number;
  train_losses: { x: number; y: number }[];
  test_losses: { x: number; y: number }[];
}

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

  // Live training progress
  currentProgress: TrainingProgress | null;
  isLiveTraining: boolean;
  isTrainingPaused: boolean;

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

  // Live training actions
  setCurrentProgress: (progress: TrainingProgress | null) => void;
  setIsLiveTraining: (isLive: boolean) => void;
  setIsTrainingPaused: (isPaused: boolean) => void;

  // Output
  currentOutput: OutputsResult | null;
  setCurrentOutput: (output: OutputsResult) => void;
}

const defaultConfig = DEFAULT_TRAINING_CONFIG;

export const useTrainingStore = create<TrainingConfigState>()(
  immer((set) => ({
    ...defaultConfig,

    // Initial training state
    isTraining: false,
    trainingHistory: [],
    openHistoryItemIdx: null,

    // Initial live training state
    currentProgress: null,
    isLiveTraining: false,
    isTrainingPaused: false,

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
        state.trainingHistory.unshift(result);
        state.openHistoryItemIdx = state.trainingHistory.length;
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
        state.currentProgress = null;
        state.isLiveTraining = false;
        state.isTrainingPaused = false;
      });
    },

    // Live training actions
    setCurrentProgress: (progress: TrainingProgress | null) => {
      set((state) => {
        state.currentProgress = progress;
      });
    },

    setIsLiveTraining: (isLive: boolean) => {
      set((state) => {
        state.isLiveTraining = isLive;
      });
    },

    setIsTrainingPaused: (isPaused: boolean) => {
      set((state) => {
        state.isTrainingPaused = isPaused;
      });
    },

    // Output
    currentOutput: null,
    setCurrentOutput: (output: OutputsResult) => {
      set((state) => {
        state.currentOutput = output;
      });
    },
  })),
);
