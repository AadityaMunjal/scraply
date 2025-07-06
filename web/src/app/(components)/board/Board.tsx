"use client";
import React, { useState } from "react";
import LayersTab from "./layers/LayersTab";
import { AppTabs } from "~/types/index";
import DATASETS from "~/util/DATASETS";
import Toggle from "../Toggle";
import TrainingTab from "./training/TrainingTab";
import OutputsTab from "./outputs/OutputsTab";
import { useBoardStore } from "~/state/boardStore";
import { generateUniqueBlocks } from "~/util/defaultConfigs";

const Board = () => {
  const [tab, setTab] = useState<AppTabs>(AppTabs.LAYERS);
  const [selectedDataset, setSelectedDataset] = useState<string>(
    DATASETS[0]!.inputName,
  );
  const [useDefaultConfig, setUseDefaultConfig] = useState<boolean>(false);
  const { loadDefaultConfig, clearCanvas } = useBoardStore();

  const handleDefaultConfigToggle = (checked: boolean) => {
    setUseDefaultConfig(checked);
    if (checked) {
      const defaultBlocks = generateUniqueBlocks(selectedDataset);
      loadDefaultConfig(defaultBlocks);
    } else {
      clearCanvas();
    }
  };

  const handleDatasetChange = (newDataset: string) => {
    setSelectedDataset(newDataset);
    if (useDefaultConfig) {
      const defaultBlocks = generateUniqueBlocks(newDataset);
      loadDefaultConfig(defaultBlocks);
    }
  };

  const Tabs: Record<AppTabs, React.ReactNode> = {
    [AppTabs.LAYERS]: <LayersTab />,
    [AppTabs.TRAINING]: <TrainingTab selectedDataset={selectedDataset} />,
    [AppTabs.OUTPUTS]: <OutputsTab selectedDataset={selectedDataset} />,
  };

  return (
    <div className={`overflow-hidden bg-zinc-900 text-white`}>
      <div>
        <div className="flex justify-between p-4">
          <div className="mx-4 flex items-center space-x-6">
            <div className="flex items-center">
              <div className="mx-2 text-lg">Dataset</div>
              <select
                className="rounded bg-zinc-800 p-2 text-white outline-none"
                onChange={(e) => handleDatasetChange(e.target.value)}
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
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useDefaultConfig"
                checked={useDefaultConfig}
                onChange={(e) => handleDefaultConfigToggle(e.target.checked)}
                className="mr-2 h-4 w-4 rounded border-gray-300 bg-zinc-800 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="useDefaultConfig"
                className="text-sm text-zinc-300"
              >
                Load default config
              </label>
            </div>
          </div>
          <Toggle
            color="blue"
            options={Object.values(AppTabs)}
            selected={tab}
            setSelected={setTab as React.Dispatch<React.SetStateAction<string>>}
          />

          {/* duplicate invisible component for centering, find a better way */}
          <div className="invisible mx-4 flex items-center space-x-6">
            <div className="flex items-center">
              <div className="mx-2 text-lg">Dataset</div>
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
            <div className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 h-4 w-4 rounded border-gray-300 bg-zinc-800 text-blue-600"
              />
              <label className="text-sm text-zinc-300">
                Load default config
              </label>
            </div>
          </div>
        </div>

        {Tabs[tab]}
      </div>
    </div>
  );
};

export default Board;
