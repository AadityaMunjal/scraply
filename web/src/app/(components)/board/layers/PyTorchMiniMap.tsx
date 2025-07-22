import React, { useState, useEffect, useRef } from "react";
import { useBoardStore } from "~/state/boardStore";
import {
  generatePyTorchModel,
  generateModelSummary,
} from "~/util/pytorch-generator";
import { MdCode, MdContentCopy, MdCheck } from "react-icons/md";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PyTorchMiniMapProps {
  canvasRef?: React.RefObject<HTMLDivElement>;
}

const PyTorchMiniMap: React.FC<PyTorchMiniMapProps> = ({ canvasRef }) => {
  const { canvasBlocks } = useBoardStore();
  const [copied, setCopied] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const minimapRef = useRef<HTMLDivElement>(null);

  const pytorchCode = generatePyTorchModel(canvasBlocks);
  const modelSummary = generateModelSummary(canvasBlocks);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pytorchCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isEmpty = canvasBlocks.length === 0;

  // Track canvas scroll position
  useEffect(() => {
    if (!canvasRef?.current) return;

    const canvas = canvasRef.current;

    const handleScroll = () => {
      const scrollTop = canvas.scrollTop;
      const scrollHeight = canvas.scrollHeight;
      const clientHeight = canvas.clientHeight;

      const maxScroll = scrollHeight - clientHeight;
      const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setScrollPercentage(Math.min(Math.max(percentage, 0), 100));
    };

    handleScroll();

    canvas.addEventListener("scroll", handleScroll);

    const resizeObserver = new ResizeObserver(handleScroll);
    resizeObserver.observe(canvas);

    return () => {
      canvas.removeEventListener("scroll", handleScroll);
      resizeObserver.disconnect();
    };
  }, [canvasRef, canvasBlocks.length]);

  useEffect(() => {
    if (!minimapRef.current) return;

    const minimap = minimapRef.current;
    const preElement = minimap.querySelector("pre");
    if (!preElement) return;

    const minimapHeight = minimap.clientHeight;
    const contentHeight = preElement.scrollHeight;
    const maxTranslate = Math.max(0, contentHeight - minimapHeight);

    if (maxTranslate > 0) {
      const translateY = -(scrollPercentage / 100) * maxTranslate;
      preElement.style.transform = `translateY(${translateY}px)`;
      preElement.style.transition = "transform 0.1s ease-out";
    } else {
      preElement.style.transform = "translateY(0px)";
    }
  }, [scrollPercentage, pytorchCode]);

  return (
    <div className="flex h-full w-64 flex-col rounded-md p-2 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-zinc-600/50 hover:bg-zinc-800/70">
      {/* Header */}
      <div className="mb-1.5 flex items-center justify-between">
        <h3 className="text-xs font-medium text-zinc-600">PyTorch</h3>
        <div>
          {!isEmpty && (
            <button
              onClick={handleCopy}
              className="rounded bg-zinc-800/50 p-0.5 text-gray-500 transition-colors hover:bg-zinc-700/70 hover:text-gray-300"
              title="Copy PyTorch Code"
            >
              {copied ? (
                <MdCheck size={10} className="text-green-400/80" />
              ) : (
                <MdContentCopy size={10} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative min-h-0 flex-1">
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-600">
            <MdCode size={16} className="mb-1 opacity-40" />
            <p className="text-xs opacity-60">Add layers</p>
          </div>
        ) : (
          <div className="relative h-full">
            <div
              ref={minimapRef}
              className="h-full overflow-hidden rounded bg-zinc-950/30 p-1.5"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                overflow: "hidden",
              }}
            >
              <SyntaxHighlighter
                language="python"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  padding: 0,
                  background: "transparent",
                  fontSize: "10px",
                  lineHeight: "1.2",
                }}
                codeTagProps={{
                  style: {
                    fontSize: "12px",
                    lineHeight: "1.2",
                    fontFamily:
                      'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    textWrap: "wrap",
                  },
                }}
              >
                {pytorchCode}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>

      {/* Layer count indicator */}
      {!isEmpty && (
        <div className="mt-1.5 border-t border-zinc-700/30 pt-1.5">
          <div className="text-xs text-gray-500 opacity-70">
            {canvasBlocks.length} layer{canvasBlocks.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
};

export default PyTorchMiniMap;
