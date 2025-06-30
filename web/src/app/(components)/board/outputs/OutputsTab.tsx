"use client";

import DATASETS from "~/util/DATASETS";
import ClassificationOutput from "./ClassificationOutput";

interface OutputsTabProps {
  selectedDataset: string;
}

const OutputsTab: React.FC<OutputsTabProps> = ({ selectedDataset }) => {
  const dataset = DATASETS.find((d) => d.inputName === selectedDataset);

  if (dataset?.kind === "classification") {
    return <ClassificationOutput />;
  } else if (dataset?.kind === "regression") {
    return <div>Regression</div>;
  }
};

export default OutputsTab;
