import { UILayer } from "~/types/index";

export const generatePyTorchModel = (layers: UILayer[]): string => {
  if (layers.length === 0) {
    return `import torch
import torch.nn as nn

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        # Add layers to build your model
        
    def forward(self, x):
        # Define forward pass
        return x`;
  }

  // Generate imports
  const imports = `import torch
import torch.nn as nn`;

  // Generate layer definitions
  const layerDefs = layers
    .map((layer, index) => {
      const layerNum = index + 1;

      switch (layer.label) {
        case "Linear":
          if ("params" in layer) {
            return `        self.linear${layerNum} = nn.Linear(${layer.params.inputNeurons}, ${layer.params.outputNeurons})`;
          }
          return `        # Error generating Linear layer`;

        case "Conv":
          if ("params" in layer) {
            const {
              dimension,
              inputNeurons,
              outputNeurons,
              kernelSize,
              stride,
              padding,
            } = layer.params;
            const convType = dimension === 1 ? "Conv1d" : "Conv2d";
            return `        self.conv${layerNum} = nn.${convType}(${inputNeurons}, ${outputNeurons}, kernel_size=${kernelSize}, stride=${stride}, padding=${padding})`;
          }
          return `        # Error generating Conv layer`;

        case "RNN":
          if ("params" in layer) {
            const { inputNeurons, hiddenSize, dropout } = layer.params;
            return `        self.rnn${layerNum} = nn.RNN(${inputNeurons}, ${hiddenSize}, dropout=${dropout}, batch_first=True)`;
          }
          return `        # Error generating RNN layer`;

        case "GRU":
          if ("params" in layer) {
            const { inputNeurons, hiddenSize, dropout } = layer.params;
            return `        self.gru${layerNum} = nn.GRU(${inputNeurons}, ${hiddenSize}, dropout=${dropout}, batch_first=True)`;
          }
          return `        # Error generating GRU layer`;

        case "Flatten":
          return `        self.fl${layerNum} = nn.Flatten()`;

        case "MaxPool":
          if ("params" in layer) {
            const { dimension, kernelSize, stride, padding } = layer.params;
            const poolType = dimension === 1 ? "MaxPool1d" : "MaxPool2d";
            return `        self.maxpool${layerNum} = nn.${poolType}(kernel_size=${kernelSize}, stride=${stride}, padding=${padding})`;
          }
          return `        # Error generating MaxPool layer`;

        case "Dropout":
          if ("params" in layer) {
            return `        self.dropout${layerNum} = nn.Dropout(${layer.params.dropout})`;
          }
          return `        # Error generating Dropout layer`;

        default:
          return `        # Unknown layer type: ${(layer as UILayer).label}`;
      }
    })
    .join("\n");

  // Generate forward pass
  const forwardPass = layers
    .map((layer, index) => {
      const layerNum = index + 1;
      const varName = index === 0 ? "x" : `x${index}`;
      const nextVarName = `x${index + 1}`;

      let activation = "";
      if (
        "activationFunction" in layer &&
        layer.activationFunction !== "ReLU"
      ) {
        activation = `\n        ${nextVarName} = torch.${layer.activationFunction.toLowerCase()}(${nextVarName})`;
      } else if (
        "activationFunction" in layer &&
        layer.activationFunction === "ReLU"
      ) {
        activation = `\n        ${nextVarName} = torch.relu(${nextVarName})`;
      }

      switch (layer.label) {
        case "Linear":
          return `        ${nextVarName} = self.linear${layerNum}(${varName})${activation}`;
        case "Conv":
          return `        ${nextVarName} = self.conv${layerNum}(${varName})${activation}`;
        case "RNN":
          return `        ${nextVarName}, _ = self.rnn${layerNum}(${varName})${activation}`;
        case "GRU":
          return `        ${nextVarName}, _ = self.gru${layerNum}(${varName})${activation}`;
        case "Flatten":
          return `        ${nextVarName} = self.fl${layerNum}(${varName})`;
        case "MaxPool":
          return `        ${nextVarName} = self.maxpool${layerNum}(${varName})`;
        case "Dropout":
          return `        ${nextVarName} = self.dropout${layerNum}(${varName})`;
        default:
          return `        ${nextVarName} = ${varName}  # Unknown layer`;
      }
    })
    .join("\n");

  const returnStatement =
    layers.length > 0 ? `        return x${layers.length}` : "        return x";

  // Combine all parts
  return `${imports}

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
${layerDefs}
        
    def forward(self, x):
${forwardPass}
${returnStatement}`;
};

export const generateModelSummary = (layers: UILayer[]): string => {
  if (layers.length === 0) {
    return "No layers added";
  }

  return layers
    .map((layer, index) => {
      const layerNum = index + 1;
      switch (layer.label) {
        case "Linear":
          if ("params" in layer) {
            return `${layerNum}. Linear(${layer.params.inputNeurons} → ${layer.params.outputNeurons})`;
          }
          return `${layerNum}. Linear`;
        case "Conv":
          if ("params" in layer) {
            const { dimension, inputNeurons, outputNeurons, kernelSize } =
              layer.params;
            return `${layerNum}. Conv${dimension}D(${inputNeurons} → ${outputNeurons}, k=${kernelSize})`;
          }
          return `${layerNum}. Conv`;
        case "RNN":
          if ("params" in layer) {
            return `${layerNum}. RNN(${layer.params.inputNeurons} → ${layer.params.hiddenSize})`;
          }
          return `${layerNum}. RNN`;
        case "GRU":
          if ("params" in layer) {
            return `${layerNum}. GRU(${layer.params.inputNeurons} → ${layer.params.hiddenSize})`;
          }
          return `${layerNum}. GRU`;
        case "Flatten":
          return `${layerNum}. Flatten()`;
        case "MaxPool":
          if ("params" in layer) {
            return `${layerNum}. MaxPool${layer.params.dimension}D(k=${layer.params.kernelSize})`;
          }
          return `${layerNum}. MaxPool`;
        case "Dropout":
          if ("params" in layer) {
            return `${layerNum}. Dropout(p=${layer.params.dropout})`;
          }
          return `${layerNum}. Dropout`;
        default:
          return `${layerNum}. ${(layer as UILayer).label}`;
      }
    })
    .join("\n");
};
