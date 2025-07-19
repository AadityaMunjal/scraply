"use client";
import { useState } from "react";
import { useTrainingStore } from "~/state/trainingStore";
import { ClassificationImageOutput, OutputsResult } from "~/types/index";

const ClassificationOutput = () => {
  const [selectedSection, setSelectedSection] = useState<
    "confusion" | "random_samples" | "top_misclassified"
  >("confusion");

  const { currentOutput } = useTrainingStore();

  if (!currentOutput) {
    return <div>No output data available</div>;
  }

  const renderConfusionMatrix = () => {
    const { confusion_matrix, outputs_overall, outputs_class } = currentOutput;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Confusion Matrix</h3>
          <div className="text-sm text-zinc-400">
            Overall Accuracy:{" "}
            <span className="font-medium text-green-400">
              {(outputs_overall.accuracy * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            Overall F1-Score:{" "}
            <span className="font-medium text-green-400">
              {(outputs_overall.f1_score * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            Overall Precision:{" "}
            <span className="font-medium text-green-400">
              {(outputs_overall.precision * 100).toFixed(1)}%
            </span>
          </div>
          <div className="text-sm text-zinc-400">
            Overall Recall:{" "}
            <span className="font-medium text-green-400">
              {(outputs_overall.recall * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-zinc-800 p-4">
          <table className="w-full text-center text-sm">
            <thead>
              <tr>
                <th className="p-2 text-zinc-400">True \ Pred</th>
                {confusion_matrix.map((row, i) => (
                  <th key={i} className="p-2 font-medium text-zinc-400">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {confusion_matrix.map((row, i) => (
                <tr key={i}>
                  <td className="p-2 font-medium text-zinc-400">{i}</td>
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
              {outputs_class.precision.map((outputs, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {i}:</span>
                  <span className="text-white">
                    {(outputs * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Recall</h4>
            <div className="space-y-1">
              {outputs_class.recall.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {i}:</span>
                  <span className="text-white">{(r * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">F1-Score</h4>
            <div className="space-y-1">
              {outputs_class.f1_score.map((f, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {i}:</span>
                  <span className="text-white">{(f * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-zinc-800 p-4">
            <h4 className="mb-2 text-sm font-medium text-zinc-400">Accuracy</h4>
            <div className="space-y-1">
              {outputs_class.accuracy.map((a, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-zinc-300">Class {i}:</span>
                  <span className="text-white">{(a * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const imageClassificationOutput = (
    imageClassificationOutput: ClassificationImageOutput,
  ) => {
    return (
      <div className="flex flex-col items-center space-y-3">
        <img
          src={`data:image/png;base64,${imageClassificationOutput.original}`}
          alt={`Sample ${imageClassificationOutput.idx}`}
          className="h-20 w-20 rounded border border-zinc-600 bg-zinc-700"
        />
        <div className="space-y-1 text-center">
          <div className="text-sm">
            <span className="text-zinc-400">
              Sample #{imageClassificationOutput.idx}
            </span>
          </div>
          {imageClassificationOutput.peek_maps.map((peek_map, i) => (
            <div key={i} className="text-sm">
              <span className="text-zinc-400">
                Peek Map {i + 1}: {peek_map.layer}
              </span>
              <img
                src={`data:image/png;base64,${peek_map.image}`}
                alt={`Peek Map ${i + 1}`}
                className="h-20 w-20 rounded border border-zinc-600 bg-zinc-700"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRandomSamples = () => {
    const { random_samples } = currentOutput;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">Random Samples</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(random_samples).map(([classKey, examples]) => (
            <div key={classKey} className="rounded-lg bg-zinc-800 p-4">
              <h4 className="mb-3 text-sm font-medium text-zinc-400">
                Class {classKey} Random Samples
              </h4>

              <div className="flex flex-wrap gap-4">
                {examples.map((example) => (
                  <div key={example.idx}>
                    {imageClassificationOutput(example)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTopMisclassified = () => {
    const { top_misclassified } = currentOutput;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-medium text-white">
            Most Commonly Misclassified
          </h3>
        </div>

        <div className="space-y-4">
          {Object.entries(top_misclassified).map(([classKey, examples]) => (
            <div key={classKey} className="rounded-lg bg-zinc-800 p-4">
              <h4 className="mb-3 text-sm font-medium text-zinc-400">
                Class {classKey} Misclassifications
              </h4>

              <div className="flex flex-wrap gap-4">
                {examples.map((example) => (
                  <div key={example.idx}>
                    {imageClassificationOutput(example)}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
          { key: "random_samples", label: "Random Samples" },
          { key: "top_misclassified", label: "Top Misclassified" },
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
        {selectedSection === "random_samples" && renderRandomSamples()}
        {selectedSection === "top_misclassified" && renderTopMisclassified()}
      </div>
    </div>
  );
};

export default ClassificationOutput;
