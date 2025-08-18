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
      <div className="my-1 flex w-full justify-between rounded-xl bg-zinc-800 p-3 text-base">
        <div className="flex items-center text-base">{title}</div>
        <div>{children}</div>
      </div>
      <button className="ml-2 p-1.5" onClick={onReset}>
        <ResetIcon className="h-5 w-5 text-zinc-600" />
      </button>
    </div>
  );
};

export default TrainingConfigItem;
