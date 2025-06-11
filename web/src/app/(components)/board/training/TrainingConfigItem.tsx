import { RiResetLeftFill as ResetIcon } from "react-icons/ri";

interface TrainingConfigItemProps {
  title: string;
  onReset?: () => void;
  children: React.ReactNode;
}

const TrainingConfigItem: React.FC<TrainingConfigItemProps> = ({
  title,
  onReset,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="my-1 flex w-full justify-between rounded-lg bg-zinc-800 p-4 text-base">
        <div className="flex items-center">{title}</div>
        <div>{children}</div>
      </div>
      <button className="ml-2" onClick={onReset}>
        <ResetIcon className="text-zinc-600" />
      </button>
    </div>
  );
};

export default TrainingConfigItem;
