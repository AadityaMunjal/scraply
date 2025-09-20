import { useMutation } from "@tanstack/react-query";
import { Config, TransformerConfig } from "~/types/index";

// Electron API functions
const downloadFile = async (config: Config): Promise<Blob> => {
  if (typeof window !== "undefined" && window.electronAPI) {
    const result = await window.electronAPI.generateNotebook(config);

    // Convert the result to a blob for download
    const jsonString = JSON.stringify(result, null, 2);
    return new Blob([jsonString], { type: "application/json" });
  } else {
    throw new Error("Electron API not available");
  }
};

const startTraining = async (config: Config) => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return await window.electronAPI.startTraining(config);
  } else {
    throw new Error("Electron API not available");
  }
};

const startTransformerTraining = async (config: TransformerConfig) => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return await window.electronAPI.startTraining(config);
  } else {
    throw new Error("Electron API not available");
  }
};

const transformerTest = async (params: {
  temperature: number;
  prompt: string;
}) => {
  if (typeof window !== "undefined" && window.electronAPI) {
    // For transformer testing, we'd need to add this to the Electron API
    // For now, return a placeholder
    return {
      message: "Transformer testing not yet implemented in Electron mode",
    };
  } else {
    throw new Error("Electron API not available");
  }
};

const checkServerHealth = async () => {
  if (typeof window !== "undefined" && window.electronAPI) {
    return await window.electronAPI.checkPythonHealth();
  } else {
    throw new Error("Electron API not available");
  }
};

// hooks
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: downloadFile,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "generated_notebook.ipynb";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onError: (error) => {
      console.error("Error downloading file:", error);
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

// Raw API functions for backward compatibility
export {
  downloadFile as downloadFileApi,
  startTraining as startTrainingApi,
  startTransformerTraining as startTransformerTrainingApi,
  transformerTest as transformerTestApi,
  checkServerHealth as checkServerHealthApi,
};
