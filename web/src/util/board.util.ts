import {
  Config,
  TransformerConfig,
  UILayer,
  LossFunction,
  OptimizerType,
  hasNeurons,
  hasActivationFunction,
  hasOtherParams,
} from "~/types/index";

export const getConfig = (
  input: string,
  blocks: UILayer[],
  loss: LossFunction,
  optimizer: OptimizerType,
  learningRate: number,
  epoch: number,
  batch_size: number,
): Config => {
  const layers = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]!;

    // Handle layers that have input/output neurons
    if (hasNeurons(block)) {
      const inputNeurons = block.inputNeurons;
      const outputNeurons = block.outputNeurons;

      // Extract other parameters if they exist
      const otherParamValues = hasOtherParams(block)
        ? Object.values(block.otherParams)
        : [];

      layers.push({
        kind: block.label,
        args:
          otherParamValues.length > 0
            ? [inputNeurons, outputNeurons, ...otherParamValues]
            : [inputNeurons, outputNeurons],
      });

      if (hasActivationFunction(block)) {
        layers.push({
          kind: block.activationFunction,
        });
      }
    } else {
      // Handle layers without neurons (like MaxPool)
      const otherParamValues = hasOtherParams(block)
        ? Object.values(block.otherParams)
        : [];

      layers.push({
        kind: block.label,
        args: otherParamValues,
      });
    }
  }

  const config = {
    input,
    layers,
    loss,
    optimizer: { kind: optimizer, lr: learningRate },
    epoch,
    batch_size,
    learning_rate: learningRate,
  };

  return config;
};

export const downloadFile = async (config: any) => {
  await fetch("http://127.0.0.1:5000/generate", {
    method: "POST",
    body: JSON.stringify(config),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.blob();
    })
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "generated_notebook.ipynb";

      document.body.appendChild(a);
      a.click();

      // clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch((error) => {
      console.error("Error downloading file:", error);
    });
};

export const startTraining = async (config: Config) => {
  try {
    const response = await fetch("http://127.0.0.1:5000/train", {
      method: "POST",
      body: JSON.stringify(config),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Training failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Training error:", error);
    throw error;
  }
};

export const getArchitectureSuggestion = async (dataset: string) => {
  return await fetch("/api/get-suggestions", {
    method: "POST",
    body: JSON.stringify({ dataset }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
};

export const startTransformerTraining = async (config: TransformerConfig) => {
  try {
    console.log(config);
    const response = await fetch("http://127.0.0.1:5000/transformertrain", {
      method: "POST",
      body: JSON.stringify(config),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Transformer training failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Transformer training error:", error);
    throw error;
  }
};

export const transformerTest = async (temperature: number, prompt: string) => {
  return await fetch("http://127.0.0.1:5000/transformertest", {
    method: "POST",
    body: JSON.stringify({ temperature, prompt }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data;
    });
};
