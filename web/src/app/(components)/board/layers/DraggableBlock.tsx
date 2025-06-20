"use client";
import { useDraggable } from "@dnd-kit/core";
import { PARAM_CONFIG } from "~/util/layerConfig";

interface DraggableBlockProps {
  id: string;
  label: string;
  color: string;
  inputNeurons?: number;
  outputNeurons?: number;
  otherParams?: Record<string, number>;
}

const DraggableBlock = ({
  id,
  label,
  color,
  inputNeurons,
  outputNeurons,
  otherParams,
}: DraggableBlockProps) => {
  const {
    active,
    attributes: _,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : "",
        backgroundColor: color,
      }}
      {...listeners}
      // {...attributes}
      className={`m-4 cursor-grab rounded-lg px-4 py-3 text-center text-white ${
        active?.id == id && "opacity-0"
      }`}
    >
      <div className="mb-1 flex items-start justify-between">
        <div className="text-lg font-medium">{label}</div>

        {otherParams && Object.keys(otherParams).length > 0 && (
          <div className="ml-3 flex flex-col items-end gap-1.5 text-xs">
            {Object.entries(otherParams).map(([key, value]) => {
              const config = PARAM_CONFIG[key] || { shortLabel: key };
              return (
                <div
                  key={key}
                  className="group relative"
                  title={`${config.shortLabel}: ${value}`}
                >
                  <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs text-white">
                    {value}
                  </span>
                  <span className="pointer-events-none absolute right-full top-0 mr-1 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {config.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {inputNeurons !== undefined && outputNeurons !== undefined && (
        <div className="text-xs opacity-80">
          {inputNeurons} → {outputNeurons}
        </div>
      )}
    </div>
  );
};

export default DraggableBlock;
