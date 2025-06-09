"use client";

interface OutputsTabProps {
  trainingResHistoryState: [any[], React.Dispatch<React.SetStateAction<any[]>>];
}

const OutputsTab: React.FC<OutputsTabProps> = ({ trainingResHistoryState }) => {
  const [trainingResHistory, setTrainingResHistory] = trainingResHistoryState;
  return (
    <div className="mt-4 h-1/2 rounded-xl ring ring-zinc-700">
      <div className="text-sm">
        {trainingResHistory.length !== 0 ? (
          trainingResHistory.map((trainingRes, idx) => {
            return (
              <div
                key={idx}
                className={`my-2 rounded-lg bg-zinc-800 p-1 px-2 py-1`}
              >
                <div>#{trainingResHistory.length - idx}</div>
                {Object.keys(trainingRes).map((key) => {
                  return (
                    <div key={key} className="flex justify-between">
                      <div>{key}</div>
                      <div className="flex">
                        {idx !== trainingResHistory.length - 1 &&
                          (() => {
                            const diff = Math.round(
                              trainingRes[key] -
                                trainingResHistory[idx + 1][key],
                            );
                            return diff < 0 ? (
                              <div className="text-zinc-500">
                                (<span className="text-red-600">{diff}</span>)
                              </div>
                            ) : (
                              <div className="text-zinc-500">
                                (<span className="text-green-600">+{diff}</span>
                                )
                              </div>
                            );
                          })()}
                        <div className="ml-1">
                          {Math.round(trainingRes[key])}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        ) : (
          <div className="text-center">No training results yet.</div>
        )}
      </div>
    </div>
  );
};

export default OutputsTab;
