// Electron API utility functions
// This replaces the remote API calls with local Python function calls

export interface TrainingConfig {
  input: string;
  layers: any[];
  loss: string;
  optimizer: {
    kind: string;
    lr: number;
  };
  epoch: number;
  batch_size: number;
}

export interface TrainingProgress {
  event: string;
  data: any;
}

export interface NotebookResult {
  success: boolean;
  filename?: string;
  content?: string;
  error?: string;
}

export interface HealthCheckResult {
  status: string;
  message: string;
}

class ElectronApiService {
  private isElectron(): boolean {
    return typeof window !== "undefined" && window.electronAPI !== undefined;
  }

  async trainModel(config: TrainingConfig): Promise<any> {
    if (!this.isElectron() || !window.electronAPI) {
      throw new Error("Electron API not available");
    }

    try {
      const results = await window.electronAPI.trainModel(config);
      return results;
    } catch (error) {
      console.error("Training error:", error);
      throw error;
    }
  }

  async generateNotebook(config: TrainingConfig): Promise<NotebookResult> {
    if (!this.isElectron() || !window.electronAPI) {
      throw new Error("Electron API not available");
    }

    try {
      const result = await window.electronAPI.generateNotebook(config);
      return result;
    } catch (error) {
      console.error("Notebook generation error:", error);
      throw error;
    }
  }

  async saveNotebook(filename: string, content: string): Promise<any> {
    if (!this.isElectron() || !window.electronAPI) {
      throw new Error("Electron API not available");
    }

    try {
      const result = await window.electronAPI.saveFile(filename, content);
      return result;
    } catch (error) {
      console.error("Save file error:", error);
      throw error;
    }
  }

  async checkHealth(): Promise<HealthCheckResult> {
    if (!this.isElectron() || !window.electronAPI) {
      throw new Error("Electron API not available");
    }

    try {
      const result = await window.electronAPI.checkPythonHealth();
      return result;
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  }

  onTrainingProgress(callback: (data: TrainingProgress) => void): () => void {
    if (!this.isElectron() || !window.electronAPI) {
      console.warn("Electron API not available for progress tracking");
      return () => {};
    }

    return window.electronAPI.onTrainingProgress(callback);
  }

  isInElectron(): boolean {
    return this.isElectron();
  }
}

export const electronApi = new ElectronApiService();
