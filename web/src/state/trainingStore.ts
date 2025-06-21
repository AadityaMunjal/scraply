import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TrainingResult, LossFunction, OptimizerType } from "~/types";
import { DEFAULT_TRAINING_CONFIG } from "~/configs/training";
import { validateTrainingConfig, ValidationError } from "~/utils/validation";

interface TrainingConfigState {
  // Configuration
  loss: LossFunction;
  optimizer: OptimizerType;
  learningRate: number;
  epochs: number;
  batchSize: number;

  // Validation state
  validationErrors: ValidationError[];
  isValid: boolean;

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

const validateCurrentConfig = (
  state: TrainingConfigState,
): ValidationError[] => {
  return validateTrainingConfig({
    loss: state.loss,
    optimizer: { kind: state.optimizer, lr: state.learningRate },
    epoch: state.epochs,
    batch_size: state.batchSize,
    layers: [], // Will be validated separately in components
  });
};

export const useTrainingStore = create<TrainingConfigState>()(
  immer((set) => ({
    ...defaultConfig,

    // Initial validation state
    validationErrors: [],
    isValid: true,

    // Initial training state
    isTraining: false,
    trainingHistory: [],
    openHistoryItemIdx: null,

    // Config actions with validation
    setLoss: (loss: LossFunction) => {
      set((state) => {
        state.loss = loss;
        state.validationErrors = validateCurrentConfig(state);
        state.isValid = state.validationErrors.length === 0;
      });
    },

    setOptimizer: (optimizer: OptimizerType) => {
      set((state) => {
        state.optimizer = optimizer;
        state.validationErrors = validateCurrentConfig(state);
        state.isValid = state.validationErrors.length === 0;
      });
    },

    setLearningRate: (rate: number) => {
      set((state) => {
        if (rate > 0) {
          state.learningRate = rate;
          state.validationErrors = validateCurrentConfig(state);
          state.isValid = state.validationErrors.length === 0;
        }
      });
    },

    setEpochs: (epochs: number) => {
      set((state) => {
        if (epochs > 0) {
          state.epochs = epochs;
          state.validationErrors = validateCurrentConfig(state);
          state.isValid = state.validationErrors.length === 0;
        }
      });
    },

    setBatchSize: (size: number) => {
      set((state) => {
        if (size > 0) {
          state.batchSize = size;
          state.validationErrors = validateCurrentConfig(state);
          state.isValid = state.validationErrors.length === 0;
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
        state.validationErrors = [];
        state.isValid = true;
      });
    },
  })),
);
