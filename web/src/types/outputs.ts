// Output data structures for classification results

export interface ConfusionMatrix {
  matrix: number[][];
  labels: string[];
  accuracy: number;
  precision: number[];
  recall: number[];
  f1Score: number[];
}

export interface MisclassifiedExample {
  originalImage: string;
  actualClass: string;
  predictedClass: string;
  confidence: number;
  index: number;
}

export interface ConvLayerActivation {
  layerName: string;
  activationMaps: string[]; // URLs to activation map images
}

export interface ExplainabilityResult {
  originalImage: string;
  predictedClass: string;
  confidence: number;
  convLayers: ConvLayerActivation[];
  index: number;
}

export interface ClassificationOutputData {
  confusionMatrix: ConfusionMatrix;
  misclassified: MisclassifiedExample[];
  explainability: ExplainabilityResult[];
}
