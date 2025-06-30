"use client";
import { useDraggable } from "@dnd-kit/core";
import { PARAM_CONFIG } from "~/util/layerConfig";
import { hasParams } from "~/types/index";

interface DraggableBlockProps {
  id: string;
  label: string;
  color: string;
  params?: Record<string, number>;
}

const DraggableBlock = ({ id, label, color, params }: DraggableBlockProps) => {
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
      className={`m-4 cursor-grab rounded-md px-4 py-3 text-center text-white ${
        active?.id == id && "opacity-0"
      }`}
    >
      <div className="text-lg font-medium text-white">{label}</div>

      {params && Object.keys(params).length > 0 && (
        <div className="mb-1 mt-1 flex justify-center gap-1.5 text-xs">
          {Object.entries(params)
            .filter(
              ([key]) => key !== "inputNeurons" && key !== "outputNeurons",
            )
            .map(([key, value]) => {
              const config = PARAM_CONFIG[key] || { shortLabel: key };
              // Format dimension values as "1D" or "2D"
              const displayValue = key === "dimension" ? `${value}D` : value;
              return (
                <div
                  key={key}
                  className="group relative"
                  title={`${config.shortLabel}: ${displayValue}`}
                >
                  <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs text-white">
                    {displayValue}
                  </span>
                  {/* Show parameter name on hover */}
                  <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 translate-y-12 whitespace-nowrap rounded bg-gray-800 px-2 py-0.5 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {config.shortLabel}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default DraggableBlock;
