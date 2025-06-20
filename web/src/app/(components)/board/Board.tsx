"use client";
import React, { useState } from "react";
import LayersTab from "./layers/LayersTab";
import { AppTabs, TrainingResult } from "~/types";
import DATASETS from "~/util/DATASETS";
import Toggle from "../Toggle";
import TrainingTab from "./training/TrainingTab";
import OutputsTab from "./outputs/OutputsTab";

const Board = () => {
  const [tab, setTab] = useState<AppTabs>(AppTabs.LAYERS);
  const [selectedDataset, setSelectedDataset] = useState<string>(
    DATASETS[0]!.inputName,
  );

  // global layer state
  const lossState = useState("BCE");
  const optimizerState = useState("Adam");
  const learningRateState = useState(0.001);
  const epochState = useState(100);
  const batchSizeState = useState(10);

  const isTrainingState = useState(false);
  const trainingResHistoryState = useState<TrainingResult[]>([]);
  const openHistoryItemIdxState = useState<number | null>(null);

  const Tabs: Record<AppTabs, React.ReactNode> = {
    [AppTabs.LAYERS]: <LayersTab />,
    [AppTabs.TRAINING]: (
      <TrainingTab
        selectedDataset={selectedDataset}
        lossState={lossState}
        optimizerState={optimizerState}
        learningRateState={learningRateState}
        epochState={epochState}
        batchSizeState={batchSizeState}
        isTrainingState={isTrainingState}
        trainingResHistoryState={trainingResHistoryState}
        openHistoryItemIdxState={openHistoryItemIdxState}
      />
    ),
    [AppTabs.OUTPUTS]: <OutputsTab />,
  };

  return (
    <div className={`overflow-hidden bg-zinc-900 text-white`}>
      <div>
        <div className="flex justify-between p-4">
          <div className="mx-4 flex items-center">
            <div className="mx-2 text-lg">Dataset</div>
            <select
              className="rounded bg-zinc-800 p-2 text-white outline-none"
              onChange={(e) => setSelectedDataset(e.target.value)}
              value={selectedDataset}
            >
              {DATASETS.map((dataset, idx) => {
                return (
                  <option
                    key={idx}
                    value={dataset.inputName}
                    className="text-wrap"
                  >
                    {dataset.label}
                  </option>
                );
              })}
            </select>
          </div>
          <Toggle
            color="blue"
            options={Object.values(AppTabs)}
            selected={tab}
            setSelected={setTab as React.Dispatch<React.SetStateAction<string>>}
          />

          {/* duplicate invisible component for centering, find a better way */}
          <div className="invisible mx-4 flex items-center">
            <div className="mx-2 text-xl">Dataset</div>
            <select
              className="rounded bg-zinc-800 p-2 text-white outline-none"
              onChange={(e) => console.log(e.target.value)}
              value={selectedDataset}
            >
              {DATASETS.map((dataset, idx) => {
                return (
                  <option key={idx} value={dataset.inputName}>
                    {dataset.label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {Tabs[tab]}
      </div>
    </div>
  );
};

export default Board;
