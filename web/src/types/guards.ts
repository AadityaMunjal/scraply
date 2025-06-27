import { UILayer, ActivationFunction } from "./layers";

// Type guard to check if a layer has neurons
export const hasNeurons = (
  layer: UILayer,
): layer is UILayer & { inputNeurons: number; outputNeurons: number } => {
  return "inputNeurons" in layer && "outputNeurons" in layer;
};

// Type guard to check if a layer has activation function
export const hasActivationFunction = (
  layer: UILayer,
): layer is UILayer & { activationFunction: ActivationFunction } => {
  return "activationFunction" in layer;
};

// Type guard to check if a layer has other params
export const hasOtherParams = (
  layer: UILayer,
): layer is UILayer & { otherParams: Record<string, number> } => {
  return "otherParams" in layer && layer.otherParams !== undefined;
};
