"use client";
import { useState } from "react";
import { useTrainingStore } from "~/state/trainingStore";
import { ClassificationImageOutput, OutputsResult } from "~/types/index";

const ClassificationOutput = () => {
  const [selectedSection, setSelectedSection] = useState<
    "confusion" | "random_samples" | "top_misclassified"
  >("confusion");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );

  const { currentOutput } = useTrainingStore();

  if (!currentOutput) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="mt-10 rounded-xl bg-zinc-800/50 p-8 text-center backdrop-blur-sm">
          <div className="text-zinc-400">
            No output data available. Please train a model first.
          </div>
        </div>
      </div>
    );
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderConfusionMatrix = () => {
    const { confusion_matrix, outputs_overall, outputs_class } = currentOutput;

    return (
      <div className="space-y-8">
        {/* Combined Metrics Grid */}
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {[
            {
              label: "Accuracy",
              overall: outputs_overall.accuracy,
              class_values: outputs_class.accuracy,
              color: "emerald",
            },
            {
              label: "F1-Score",
              overall: outputs_overall.f1_score,
              class_values: outputs_class.f1_score,
              color: "blue",
            },
            {
              label: "Precision",
              overall: outputs_overall.precision,
              class_values: outputs_class.precision,
              color: "purple",
            },
            {
              label: "Recall",
              overall: outputs_overall.recall,
              class_values: outputs_class.recall,
              color: "orange",
            },
          ].map((metric) => (
            <div
              key={metric.label}
              className="group rounded-xl bg-zinc-800 p-6 shadow-lg transition-all hover:shadow-xl"
            >
              <div className="mb-2 text-sm font-medium text-zinc-400">
                {metric.label}
              </div>
              <div
                className={`text-3xl font-bold text-${metric.color}-400 mb-4`}
              >
                {(metric.overall * 100).toFixed(1)}%
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  By Class
                </div>
                {metric.class_values.map((value, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Class {i}</span>
                    <span
                      className={`text-sm font-semibold text-${metric.color}-400`}
                    >
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Confusion Matrix */}
        <div className="rounded-xl bg-zinc-800 p-6 shadow-lg">
          <h3 className="mb-6 text-xl font-semibold text-white">
            Confusion Matrix
          </h3>
          <div className="bg overflow-hidden rounded-lg p-4">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr>
                  <th className="border border-zinc-600/30 p-3 font-medium text-zinc-400">
                    True \ Pred
                  </th>
                  {confusion_matrix.map((row, i) => (
                    <th
                      key={i}
                      className="border border-zinc-600/30 p-3 font-semibold text-zinc-300"
                    >
                      {i}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusion_matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="border border-zinc-600/30 p-3 font-semibold text-zinc-300">
                      {i}
                    </td>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`border border-zinc-600/30 p-3 font-semibold transition-colors ${
                          i === j
                            ? "bg-emerald-500/20 text-emerald-400 shadow-lg"
                            : cell > 0
                              ? "bg-red-500/20 text-red-400"
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
        </div>
      </div>
    );
  };

  const imageClassificationOutput = (
    imageClassificationOutput: ClassificationImageOutput,
    isExpanded: boolean = false,
  ) => {
    if (isExpanded) {
      // Expanded card layout with peek maps
      return (
        <div className="group rounded-xl bg-zinc-800 p-6 shadow-lg transition-all hover:shadow-xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            {/* Main Image */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="overflow-hidden rounded-lg shadow-md">
                <img
                  src={`data:image/png;base64,${imageClassificationOutput.original}`}
                  alt={`Sample ${imageClassificationOutput.idx}`}
                  className="h-32 w-32 bg-zinc-700 transition-transform"
                />
              </div>
              <div className="space-y-2 text-center">
                <div className="rounded-full bg-zinc-700 px-3 py-1 text-sm font-medium text-zinc-300">
                  #{imageClassificationOutput.idx}
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-zinc-400">
                    True:{" "}
                    <span className="font-semibold text-zinc-300">
                      {imageClassificationOutput.true_label}
                    </span>
                  </div>
                  <div
                    className={`text-xs ${imageClassificationOutput.true_label === imageClassificationOutput.pred_label ? "text-emerald-400" : "text-red-400"}`}
                  >
                    Pred:{" "}
                    <span className="font-semibold">
                      {imageClassificationOutput.pred_label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Peek Maps Grid */}
            <div className="space-y-4">
              <div className="text-sm font-semibold text-zinc-300">
                Feature Maps
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {imageClassificationOutput.peek_maps.map((peek_map, i) => (
                  <div
                    key={i}
                    className="group/peek flex flex-col items-center space-y-3 rounded-lg bg-zinc-700/50 p-4 transition-all hover:bg-zinc-700"
                  >
                    <div className="overflow-hidden rounded shadow-sm">
                      <img
                        src={`data:image/png;base64,${peek_map.image}`}
                        alt={`Peek Map ${i + 1}`}
                        className="h-20 w-20 bg-zinc-700"
                      />
                    </div>
                    <div className="text-center text-sm font-medium leading-tight text-zinc-300">
                      {peek_map.layer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      // Compact grid item
      return (
        <div className="group flex flex-col items-center space-y-3 rounded-lg bg-zinc-700/30 p-4 transition-all hover:bg-zinc-700/50">
          <div className="overflow-hidden rounded shadow-sm">
            <img
              src={`data:image/png;base64,${imageClassificationOutput.original}`}
              alt={`Sample ${imageClassificationOutput.idx}`}
              className="h-24 w-24 bg-zinc-700 transition-transform"
            />
          </div>
          <div className="space-y-2 text-center">
            <div className="rounded-full bg-zinc-600/50 px-3 py-1 text-sm font-medium text-zinc-300">
              #{imageClassificationOutput.idx}
            </div>
            <div className="space-y-1">
              <div className="text-xs text-zinc-400">
                T:{" "}
                <span className="font-semibold text-zinc-300">
                  {imageClassificationOutput.true_label}
                </span>
              </div>
              <div
                className={`text-xs ${imageClassificationOutput.true_label === imageClassificationOutput.pred_label ? "text-emerald-400" : "text-red-400"}`}
              >
                P:{" "}
                <span className="font-semibold">
                  {imageClassificationOutput.pred_label}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const renderRandomSamples = () => {
    const { random_samples } = currentOutput;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">Random Samples</h3>
        </div>

        <div className="grid gap-6">
          {Object.entries(random_samples).map(([classKey, examples]) => {
            const sectionId = `random-${classKey}`;
            const isExpanded = expandedSections.has(sectionId);

            return (
              <div
                key={classKey}
                className="rounded-xl bg-zinc-800 shadow-lg transition-all"
              >
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full rounded-xl p-6 text-left transition-all hover:bg-zinc-700/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-600 font-semibold text-white">
                        {classKey}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Class {classKey}
                        </h4>
                      </div>
                    </div>
                    <div
                      className={`text-2xl text-zinc-400 transition-transform ${isExpanded ? "rotate-45" : ""}`}
                    >
                      +
                    </div>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-zinc-700 p-6 pt-6">
                    <div className="grid gap-6">
                      {examples.map((example) => (
                        <div key={example.idx}>
                          {imageClassificationOutput(example, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-zinc-700 p-6 pt-6">
                    <div className="grid grid-cols-3 gap-8">
                      {examples.map((example) => (
                        <div key={example.idx}>
                          {imageClassificationOutput(example, false)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTopMisclassified = () => {
    const { top_misclassified } = currentOutput;

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white">
            Most Commonly Misclassified
          </h3>
        </div>

        <div className="grid gap-6">
          {Object.entries(top_misclassified).map(([classKey, examples]) => {
            const sectionId = `misclassified-${classKey}`;
            const isExpanded = expandedSections.has(sectionId);

            return (
              <div
                key={classKey}
                className="rounded-xl bg-zinc-800 shadow-lg transition-all hover:shadow-xl"
              >
                <button
                  onClick={() => toggleSection(sectionId)}
                  className="w-full rounded-xl p-6 text-left transition-all hover:bg-zinc-700/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 font-semibold text-white">
                        {classKey}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">
                          Class {classKey}
                        </h4>
                      </div>
                    </div>
                    <div
                      className={`text-2xl text-zinc-400 transition-transform ${isExpanded ? "rotate-45" : ""}`}
                    >
                      +
                    </div>
                  </div>
                </button>

                {isExpanded ? (
                  <div className="border-t border-zinc-700 p-6 pt-6">
                    <div className="grid gap-6">
                      {examples.map((example) => (
                        <div key={example.idx}>
                          {imageClassificationOutput(example, true)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-zinc-700 p-6 pt-6">
                    <div className="grid grid-cols-3 gap-8">
                      {examples.map((example) => (
                        <div key={example.idx}>
                          {imageClassificationOutput(example, false)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-zinc-900 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Modern Tab Navigation */}
        <div className="flex space-x-2 rounded-xl bg-zinc-800/50 p-2 backdrop-blur-sm">
          {[
            { key: "confusion", label: "Confusion Matrix" },
            { key: "random_samples", label: "Random Samples" },
            { key: "top_misclassified", label: "Misclassified" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedSection(tab.key as any)}
              className={`flex flex-1 items-center justify-center space-x-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all ${
                selectedSection === tab.key
                  ? "bg-white text-zinc-900 shadow-lg"
                  : "text-zinc-400 hover:bg-zinc-700/50 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1">
          {selectedSection === "confusion" && renderConfusionMatrix()}
          {selectedSection === "random_samples" && renderRandomSamples()}
          {selectedSection === "top_misclassified" && renderTopMisclassified()}
        </div>
      </div>
    </div>
  );
};

export default ClassificationOutput;
