import { UILayer, LayerWithNeurons, LayerWithAF, Labels } from "./layers";

// Type guard to check if a layer has neurons
export const hasNeurons = (
  layer: UILayer,
): layer is UILayer & LayerWithNeurons => {
  return (
    "params" in layer &&
    layer.params !== undefined &&
    typeof layer.params === "object" &&
    "inputNeurons" in (layer.params as any) &&
    "outputNeurons" in (layer.params as any)
  );
};

// Type guard to check if a layer has activation function
export const hasActivationFunction = (
  layer: UILayer,
): layer is UILayer & LayerWithAF<Labels> => {
  return "activationFunction" in layer;
};

// Type guard to check if a layer has params
export const hasParams = <T>(
  layer: UILayer,
): layer is UILayer & { params: T } => {
  return "params" in layer && layer.params !== undefined;
};

// Type guard to check if a layer has dimension parameter
export const hasDimension = (
  layer: UILayer,
): layer is UILayer & { params: { dimension: 1 | 2 } } => {
  return hasParams(layer) && "dimension" in (layer.params as any);
};

// Type guard to check if a layer has other params (for backward compatibility)
export const hasOtherParams = (
  layer: UILayer,
): layer is UILayer & { otherParams: Record<string, number> } => {
  return "otherParams" in layer && layer.otherParams !== undefined;
};
