import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";

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
}

export const useSocket = (): UseSocketReturn => {
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

  useEffect(() => {
    // Create socket connection
    const newSocket = io("http://34.237.181.35:5000", {
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("Connected to training server");
      setIsConnected(true);

      // Check if there's an ongoing training session
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

    // Handle training status check response
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

    // Handle training pause/resume events
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
  }, []);

  const startTraining = async (config: any) => {
    try {
      const response = await fetch("http://34.237.181.35:5000/train-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

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
  };

  const pauseTraining = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("pause_training");
    }
  };

  const resumeTraining = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("resume_training");
    }
  };

  const stopTraining = () => {
    if (socketRef.current?.connected) {
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
    if (socketRef.current?.connected) {
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
  };
};
