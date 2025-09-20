import { useEffect, useRef, useState } from "react";
import { ElectronAPI } from "~/types/electron";

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

interface TrainingCompleted {
  final_results: any;
  message: string;
}

interface UseElectronReturn {
  isConnected: boolean;
  trainingProgress: TrainingProgress | null;
  isTrainingActive: boolean;
  isTrainingPaused: boolean;
  trainingCompleted: TrainingCompleted | null;
  trainingError: string | null;
  startTraining: (config: any) => void;
  pauseTraining: () => void;
  resumeTraining: () => void;
  stopTraining: () => void;
  resetTraining: () => void;
  checkTrainingStatus: () => void;
}

export const useSocket = (): UseElectronReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [trainingProgress, setTrainingProgress] =
    useState<TrainingProgress | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [trainingCompleted, setTrainingCompleted] =
    useState<TrainingCompleted | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in Electron environment
    if (typeof window !== "undefined" && window.electronAPI) {
      setIsConnected(true);

      // Set up event listeners for training progress
      window.electronAPI.onTrainingProgress((data: TrainingProgress) => {
        console.log("Training progress:", data);
        setTrainingProgress(data);
        if (!isTrainingActive) {
          setIsTrainingActive(true);
          setTrainingCompleted(null);
          setTrainingError(null);
        }
      });

      window.electronAPI.onTrainingPaused(() => {
        console.log("Training paused");
        setIsTrainingPaused(true);
      });

      window.electronAPI.onTrainingResumed(() => {
        console.log("Training resumed");
        setIsTrainingPaused(false);
      });

      window.electronAPI.onTrainingStopped(() => {
        console.log("Training stopped");
        setIsTrainingActive(false);
        setIsTrainingPaused(false);
      });
    }

    return () => {
      // Cleanup event listeners when component unmounts
      if (typeof window !== "undefined" && window.electronAPI) {
        window.electronAPI.removeAllListeners("training-progress");
        window.electronAPI.removeAllListeners("training-paused");
        window.electronAPI.removeAllListeners("training-resumed");
        window.electronAPI.removeAllListeners("training-stopped");
      }
    };
  }, [isTrainingActive]);

  const startTraining = async (config: any) => {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        setIsTrainingActive(true);
        setTrainingCompleted(null);
        setTrainingError(null);
        setTrainingProgress(null);

        const result = await window.electronAPI.startTraining(config);
        console.log("Training started:", result);

        // If training completed successfully
        if (result.results) {
          setTrainingCompleted({
            final_results: result.results,
            message: "Training completed successfully",
          });
          setIsTrainingActive(false);
        }
      } else {
        throw new Error("Electron API not available");
      }
    } catch (error) {
      console.error("Failed to start training:", error);
      setTrainingError(
        error instanceof Error ? error.message : "Failed to start training",
      );
      setIsTrainingActive(false);
    }
  };

  const pauseTraining = async () => {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        await window.electronAPI.pauseTraining();
      }
    } catch (error) {
      console.error("Failed to pause training:", error);
    }
  };

  const resumeTraining = async () => {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        await window.electronAPI.resumeTraining();
      }
    } catch (error) {
      console.error("Failed to resume training:", error);
    }
  };

  const stopTraining = async () => {
    try {
      if (typeof window !== "undefined" && window.electronAPI) {
        await window.electronAPI.stopTraining();
      }
    } catch (error) {
      console.error("Failed to stop training:", error);
    }
  };

  const resetTraining = () => {
    setTrainingProgress(null);
    setTrainingCompleted(null);
    setTrainingError(null);
    setIsTrainingActive(false);
    setIsTrainingPaused(false);
  };

  const checkTrainingStatus = () => {
    // In Electron, we maintain local state so no need to check server
    console.log("Training status:", {
      isTrainingActive,
      isTrainingPaused,
      trainingProgress,
    });
  };

  return {
    isConnected,
    trainingProgress,
    isTrainingActive,
    isTrainingPaused,
    trainingCompleted,
    trainingError,
    startTraining,
    pauseTraining,
    resumeTraining,
    stopTraining,
    resetTraining,
    checkTrainingStatus,
  };
};
