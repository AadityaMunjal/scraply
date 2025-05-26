"use client";
import React, { useState } from "react";
import Toggle from "../_components/Toggle";
import Layers from "./layers/Layers";
import { AppMode } from "~/types";
import TrainingConfig from "./config/TrainingConfig";
import Output from "./output/Output";

const Board = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.LAYERS);

  const CurrentBoardMode = {
    [AppMode.LAYERS]: () => {
      return (
        <Layers
          lossState={lossState}
          optimizerState={optimizerState}
          learningRateState={learningRateState}
          epochState={epochState}
          batchSizeState={batchSizeState}
          isTrainingState={isTrainingState}
          trainingResState={trainingResState}
          progressState={progressState}
        />
      );
    },
    [AppMode.CONFIG]: () => {
      return <TrainingConfig />;
    },
    [AppMode.OUPUT]: () => {
      return <Output />;
    },
  };

  // global layer state
  const lossState = useState("BCE");
  const optimizerState = useState("Adam");
  const learningRateState = useState(0.001);
  const epochState = useState(100);
  const batchSizeState = useState(10);

  const isTrainingState = useState(false);
  const trainingResState = useState<any | null>(null);
  const progressState = useState(0);

  return (
    <div>
      <div className="flex justify-center p-4">
        <Toggle
          color="blue"
          options={Object.values(AppMode)}
          selected={mode}
          setSelected={setMode as React.Dispatch<React.SetStateAction<string>>}
        />
      </div>
      {CurrentBoardMode[mode]()}
    </div>
  );
};

export default Board;
