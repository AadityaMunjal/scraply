"use client";
import { useState } from "react";
import { ClassificationOutputData } from "~/types/outputs";

// Dummy data for demonstration
const dummyOutputData: ClassificationOutputData = {
  confusionMatrix: {
    matrix: [
      [95, 2, 1, 0, 1, 0, 1, 0, 0, 0],
      [0, 98, 1, 0, 0, 0, 0, 0, 1, 0],
      [1, 0, 92, 3, 2, 0, 1, 0, 1, 0],
      [0, 0, 2, 94, 0, 2, 0, 1, 1, 0],
      [0, 0, 1, 0, 96, 0, 1, 0, 0, 2],
      [0, 0, 0, 2, 0, 95, 1, 0, 0, 2],
      [1, 0, 0, 0, 1, 1, 96, 0, 1, 0],
      [0, 0, 1, 1, 0, 0, 0, 97, 0, 1],
      [0, 1, 0, 1, 0, 1, 0, 0, 96, 1],
      [0, 0, 0, 0, 2, 1, 0, 1, 0, 96],
    ],
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    accuracy: 0.956,
    precision: [0.98, 0.97, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.96, 0.94],
    recall: [0.95, 0.98, 0.92, 0.94, 0.96, 0.95, 0.96, 0.97, 0.96, 0.96],
    f1Score: [0.96, 0.97, 0.92, 0.94, 0.95, 0.95, 0.96, 0.97, 0.96, 0.95],
  },
  misclassified: [
    {
      originalImage: "/api/placeholder/28/28",
      actualClass: "4",
      predictedClass: "9",
      confidence: 0.87,
      index: 1234,
    },
    {
      originalImage: "/api/placeholder/28/28",
      actualClass: "5",
      predictedClass: "3",
      confidence: 0.82,
      index: 2345,
    },
    {
      originalImage: "/api/placeholder/28/28",
      actualClass: "9",
      predictedClass: "7",
      confidence: 0.79,
      index: 3456,
    },
  ],
  explainability: [
    {
      originalImage: "/api/placeholder/28/28",
      predictedClass: "7",
      confidence: 0.95,
      convLayers: [
        {
          layerName: "Conv2d_1",
          activationMaps: ["/api/placeholder/28/28"],
        },
        {
          layerName: "Conv2d_2",
          activationMaps: ["/api/placeholder/14/14"],
        },
        {
          layerName: "Conv2d_3",
          activationMaps: ["/api/placeholder/7/7"],
        },
      ],
      index: 4567,
    },
    {
      originalImage: "/api/placeholder/28/28",
      predictedClass: "3",
      confidence: 0.92,
      convLayers: [
        {
          layerName: "Conv2d_1",
          activationMaps: ["/api/placeholder/28/28"],
        },
        {
          layerName: "Conv2d_2",
          activationMaps: ["/api/placeholder/14/14"],
        },
        {
          layerName: "Conv2d_3",
          activationMaps: ["/api/placeholder/7/7"],
        },
      ],
      index: 5678,
    },
  ],
};

const ClassificationOutput = () => {
  const [selectedSection, setSelectedSection] = useState<
    "confusion" | "misclassified" | "explainability"
  >("confusion");
  const [selectedExplainabilityIndex, setSelectedExplainabilityIndex] =
    useState(0);

  const renderConfusionMatrix = () => {
    const { matrix, labels, accuracy, precision, recall, f1Score } =
      dummyOutputData.confusionMatrix;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Confusion Matrix</h3>
          <div className="text-sm text-zinc-400">
            Overall Accuracy:{" "}
            <span className="font-medium text-green-400">
              {(accuracy * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-zinc-800 p-4">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-2 text-zinc-400">True \ Pred</th>
                {labels.map((label) => (
                  <th key={label} className="p-2 font-medium text-zinc-400">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 font-medium text-zinc-400">{labels[i]}</td>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={`p-2 font-medium ${
                        i === j
                          ? "bg-green-900/30 text-green-400"
                          : cell > 0
                            ? "bg-red-900/30 text-red-400"
                            : "text-zinc-600"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">
              Precision
            </h4>
            <div className="space-y-1">
              {precision.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {labels[i]}:</span>
                  <span className="text-white">{(p * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Recall</h4>
            <div className="space-y-1">
              {recall.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {labels[i]}:</span>
                  <span className="text-white">{(r * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">F1-Score</h4>
            <div className="space-y-1">
              {f1Score.map((f, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {labels[i]}:</span>
                  <span className="text-white">{(f * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMisclassified = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">
            Most Commonly Misclassified
          </h3>
          <div className="text-sm text-zinc-400">Top 3 Misclassifications</div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {dummyOutputData.misclassified.map((example, i) => (
            <div key={i} className="rounded-lg bg-zinc-800 p-4">
              <div className="flex flex-col items-center space-y-3">
                <img
                  src={example.originalImage}
                  alt={`Misclassified example ${i + 1}`}
                  className="h-20 w-20 rounded border border-zinc-600 bg-zinc-700"
                />
                <div className="space-y-1 text-center">
                  <div className="text-sm">
                    <span className="text-zinc-400">True:</span>
                    <span className="ml-1 font-medium text-green-400">
                      {example.actualClass}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-zinc-400">Predicted:</span>
                    <span className="ml-1 font-medium text-red-400">
                      {example.predictedClass}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-zinc-400">Confidence:</span>
                    <span className="ml-1 font-medium text-white">
                      {(example.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Sample #{example.index}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderExplainability = () => {
    const selectedExample =
      dummyOutputData.explainability[selectedExplainabilityIndex];

    if (!selectedExample) {
      return (
        <div className="space-y-6">
          <h3 className="text-xl font-medium text-white">
            Predictions with Explainability
          </h3>
          <div className="text-center text-zinc-400">
            No explainability data available
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">
            Predictions with Explainability
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-zinc-400">Example:</span>
            <select
              value={selectedExplainabilityIndex}
              onChange={(e) =>
                setSelectedExplainabilityIndex(Number(e.target.value))
              }
              className="rounded border border-zinc-600 bg-zinc-700 px-2 py-1 text-sm text-white"
            >
              {dummyOutputData.explainability.map((example, i) => (
                <option key={i} value={i}>
                  Sample #{example.index}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-800 p-6">
          <div className="flex items-start space-x-8">
            <div className="flex flex-col items-center space-y-3">
              <h4 className="text-sm font-medium text-zinc-400">
                Original Image
              </h4>
              <img
                src={selectedExample.originalImage}
                alt="Original"
                className="h-32 w-32 rounded border border-zinc-600 bg-zinc-700"
              />
              <div className="space-y-1 text-center">
                <div className="text-sm">
                  <span className="text-zinc-400">Predicted:</span>
                  <span className="ml-1 font-medium text-green-400">
                    {selectedExample.predictedClass}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">Confidence:</span>
                  <span className="ml-1 font-medium text-white">
                    {(selectedExample.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="mb-4 text-sm font-medium text-zinc-400">
                Convolutional Layer Activations (PEAK)
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {selectedExample.convLayers.map((layer, i) => (
                  <div key={i} className="space-y-2 text-center">
                    <div className="text-sm font-medium text-zinc-300">
                      {layer.layerName}
                    </div>
                    <img
                      src={layer.activationMaps[0]}
                      alt={`${layer.layerName} activation`}
                      className="h-24 w-full rounded border border-zinc-600 bg-zinc-700"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full space-y-6 p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 rounded-lg bg-zinc-800 p-1">
        {[
          { key: "confusion", label: "Confusion Matrix" },
          { key: "misclassified", label: "Misclassified" },
          { key: "explainability", label: "Explainability" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedSection(tab.key as any)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              selectedSection === tab.key
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {selectedSection === "confusion" && renderConfusionMatrix()}
        {selectedSection === "misclassified" && renderMisclassified()}
        {selectedSection === "explainability" && renderExplainability()}
      </div>
    </div>
  );
};

export default ClassificationOutput;
