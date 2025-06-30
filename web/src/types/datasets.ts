export type Dataset = {
  label: string;
  inputName: string;
  kind: "regression" | "classification";
  shape: [number, number];
};
