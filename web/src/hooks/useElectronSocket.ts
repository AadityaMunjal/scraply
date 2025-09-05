import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { electronApi } from "~/util/electronApi";

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

interface UseSocketReturn {
  socket: Socket | null;
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
  isElectron: boolean;
}

export const useElectronSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [trainingProgress, setTrainingProgress] =
    useState<TrainingProgress | null>(null);
  const [isTrainingActive, setIsTrainingActive] = useState(false);
  const [isTrainingPaused, setIsTrainingPaused] = useState(false);
  const [trainingCompleted, setTrainingCompleted] =
    useState<TrainingCompleted | null>(null);
  const [trainingError, setTrainingError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const electronProgressUnsubscribe = useRef<(() => void) | null>(null);
  const isElectron = electronApi.isInElectron();

  useEffect(() => {
    if (isElectron) {
      // In Electron, we simulate connection state and handle progress differently
      setIsConnected(true);

      // Subscribe to Electron training progress
      electronProgressUnsubscribe.current = electronApi.onTrainingProgress(
        (data) => {
          console.log("Electron training progress:", data);

          switch (data.event) {
            case "training_started":
              setIsTrainingActive(true);
              setTrainingCompleted(null);
              setTrainingError(null);
              setTrainingProgress(null);
              break;

            case "epoch_completed":
              setTrainingProgress(data.data);
              break;

            case "training_completed":
              setTrainingCompleted({
                final_results: data.data.final_results,
                message: data.data.message,
              });
              setIsTrainingActive(false);
              break;

            case "training_error":
              setTrainingError(data.data.error);
              setIsTrainingActive(false);
              break;
          }
        },
      );

      return () => {
        if (electronProgressUnsubscribe.current) {
          electronProgressUnsubscribe.current();
        }
      };
    } else {
      // Web mode - use original socket logic
      const newSocket = io("https://5985635811ab.ngrok-free.app", {
        transports: ["websocket"],
        autoConnect: true,
      });

      socketRef.current = newSocket;
      setSocket(newSocket);

      // Connection events
      newSocket.on("connect", () => {
        console.log("Connected to training server");
        setIsConnected(true);
        newSocket.emit("check_training_status");
      });

      newSocket.on("disconnect", () => {
        console.log("Disconnected from training server");
        setIsConnected(false);
        setIsTrainingActive(false);
      });

      // Training events
      newSocket.on("training_started", (data) => {
        console.log("Training started:", data);
        setIsTrainingActive(true);
        setTrainingCompleted(null);
        setTrainingError(null);
        setTrainingProgress(null);
      });

      newSocket.on("epoch_started", (data: any) => {
        console.log("Epoch started:", data);
      });

      newSocket.on("epoch_completed", (data: TrainingProgress) => {
        console.log("Epoch completed:", data);
        setTrainingProgress(data);
      });

      newSocket.on("training_completed", (data: TrainingCompleted) => {
        console.log("Training completed:", data);
        setTrainingCompleted(data);
        setIsTrainingActive(false);
      });

      newSocket.on("training_error", (data: any) => {
        console.error("Training error:", data);
        setTrainingError(data.error);
        setIsTrainingActive(false);
      });

      newSocket.on("training_status", (data: any) => {
        console.log("Training status:", data);
        if (data.is_training) {
          setIsTrainingActive(true);
          setIsTrainingPaused(data.is_paused || false);
          if (data.current_progress) {
            setTrainingProgress(data.current_progress);
          }
        } else {
          setIsTrainingActive(false);
          setIsTrainingPaused(false);
        }
      });

      newSocket.on("training_paused", (data: any) => {
        console.log("Training paused:", data);
        setIsTrainingPaused(true);
      });

      newSocket.on("training_resumed", (data: any) => {
        console.log("Training resumed:", data);
        setIsTrainingPaused(false);
      });

      newSocket.on("training_stopped", (data: any) => {
        console.log("Training stopped:", data);
        setIsTrainingActive(false);
        setIsTrainingPaused(false);
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isElectron]);

  const startTraining = async (config: any) => {
    if (isElectron) {
      try {
        setIsTrainingActive(true);
        setTrainingError(null);
        setTrainingCompleted(null);

        // This will handle the training and emit progress events
        await electronApi.trainModel(config);
      } catch (error) {
        console.error("Failed to start training:", error);
        setTrainingError(
          error instanceof Error ? error.message : "Failed to start training",
        );
        setIsTrainingActive(false);
      }
    } else {
      // Web mode
      try {
        const response = await fetch(
          "https://5985635811ab.ngrok-free.app/train-stream",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(config),
          },
        );

        if (!response.ok) {
          throw new Error(`Training request failed: ${response.status}`);
        }

        const result = await response.json();
        console.log("Training started:", result);
      } catch (error) {
        console.error("Failed to start training:", error);
        setTrainingError(
          error instanceof Error ? error.message : "Failed to start training",
        );
      }
    }
  };

  const pauseTraining = () => {
    if (isElectron) {
      // In Electron, pausing would need to be implemented in the Python wrapper
      console.log("Pause training not yet implemented for Electron");
    } else if (socketRef.current?.connected) {
      socketRef.current.emit("pause_training");
    }
  };

  const resumeTraining = () => {
    if (isElectron) {
      // In Electron, resuming would need to be implemented in the Python wrapper
      console.log("Resume training not yet implemented for Electron");
    } else if (socketRef.current?.connected) {
      socketRef.current.emit("resume_training");
    }
  };

  const stopTraining = () => {
    if (isElectron) {
      // In Electron, stopping would need to be implemented in the Python wrapper
      console.log("Stop training not yet implemented for Electron");
      setIsTrainingActive(false);
    } else if (socketRef.current?.connected) {
      socketRef.current.emit("stop_training");
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
    if (isElectron) {
      // In Electron, we don't need to check status as it's handled locally
      console.log("Training status check not needed in Electron");
    } else if (socketRef.current?.connected) {
      socketRef.current.emit("check_training_status");
    }
  };

  return {
    socket,
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
    isElectron,
  };
};
