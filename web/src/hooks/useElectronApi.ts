import { useMutation } from "@tanstack/react-query";
import { Config, TransformerConfig } from "~/types/index";
import { electronApi } from "~/util/electronApi";

// Hybrid API functions that work in both web and Electron environments
const generateNotebook = async (config: Config) => {
  if (electronApi.isInElectron()) {
    // Use Electron API for local Python execution
    const result = await electronApi.generateNotebook(config);

    if (!result.success) {
      throw new Error(result.error || "Notebook generation failed");
    }

    // If successful, save the file using Electron's save dialog
    if (result.content) {
      const saveResult = await electronApi.saveNotebook(
        "generated_notebook.ipynb",
        result.content,
      );
      if (saveResult.success) {
        return { success: true, filePath: saveResult.filePath };
      }
    }

    return result;
  } else {
    // Fallback to web API
    const response = await fetch(
      "https://5985635811ab.ngrok-free.app/generate",
      {
        method: "POST",
        body: JSON.stringify(config),
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Download failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.blob();
  }
};

const startTraining = async (config: Config) => {
  if (electronApi.isInElectron()) {
    // Use Electron API for local Python execution
    return await electronApi.trainModel(config);
  } else {
    // Fallback to web API
    const response = await fetch("https://5985635811ab.ngrok-free.app/train", {
      method: "POST",
      body: JSON.stringify(config),
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Training failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
};

const startTransformerTraining = async (config: TransformerConfig) => {
  if (electronApi.isInElectron()) {
    // For now, transformers use the same training pipeline
    // You might want to create a separate transformer wrapper
    return await electronApi.trainModel(config as any);
  } else {
    // Fallback to web API
    const response = await fetch(
      "https://5985635811ab.ngrok-free.app/transformertrain",
      {
        method: "POST",
        body: JSON.stringify(config),
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Transformer training failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
};

const transformerTest = async (params: {
  temperature: number;
  prompt: string;
}) => {
  if (electronApi.isInElectron()) {
    // You'll need to implement transformer testing in Python
    throw new Error("Transformer testing not yet implemented for Electron");
  } else {
    // Fallback to web API
    const response = await fetch(
      "https://5985635811ab.ngrok-free.app/transformertest",
      {
        method: "POST",
        body: JSON.stringify(params),
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Transformer test failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
};

const checkServerHealth = async () => {
  if (electronApi.isInElectron()) {
    // Use Electron API for local Python health check
    return await electronApi.checkHealth();
  } else {
    // Fallback to web API
    const response = await fetch("https://5985635811ab.ngrok-free.app/health", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Health check failed: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }
};

// Hooks
export const useGenerateNotebook = () => {
  return useMutation({
    mutationFn: generateNotebook,
    onSuccess: (data) => {
      if (electronApi.isInElectron()) {
        console.log("Notebook generated:", data);
      } else {
        // Handle blob download for web
        if (data instanceof Blob) {
          const url = window.URL.createObjectURL(data);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "generated_notebook.ipynb";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
      }
    },
    onError: (error) => {
      console.error("Error generating notebook:", error);
    },
  });
};

export const useStartTraining = () => {
  return useMutation({
    mutationFn: startTraining,
    onSuccess: (data) => {
      console.log("Training completed:", data);
    },
    onError: (error) => {
      console.error("Training error:", error);
    },
  });
};

export const useStartTransformerTraining = () => {
  return useMutation({
    mutationFn: startTransformerTraining,
    onSuccess: (data) => {
      console.log("Transformer training completed:", data);
    },
    onError: (error) => {
      console.error("Transformer training error:", error);
    },
  });
};

export const useTransformerTest = () => {
  return useMutation({
    mutationFn: transformerTest,
  });
};

export const useServerHealth = () => {
  return useMutation({
    mutationFn: checkServerHealth,
  });
};

// Training progress hook for Electron
export const useTrainingProgress = () => {
  return {
    subscribe: (callback: (data: any) => void) => {
      if (electronApi.isInElectron()) {
        return electronApi.onTrainingProgress(callback);
      }
      return () => {}; // No-op for web
    },
    isElectron: electronApi.isInElectron(),
  };
};

// Raw API functions for backward compatibility
export {
  generateNotebook as generateNotebookApi,
  startTraining as startTrainingApi,
  startTransformerTraining as startTransformerTrainingApi,
  transformerTest as transformerTestApi,
  checkServerHealth as checkServerHealthApi,
};
