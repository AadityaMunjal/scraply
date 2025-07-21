"use client";
import { AiOutlineStar } from "react-icons/ai";
import { useServerStatus } from "~/hooks/useServerStatus";

const Navbar = () => {
  const { statusColor, statusText, checkHealth } = useServerStatus();

  return (
    <div className="flex justify-between bg-zinc-800 text-white">
      <div className="flex">
        <img src="favicon.png" className="my-auto ml-4 h-8" alt="" />
        <div className="mx-4 py-4 pr-7 font-semibold">scraply</div>
      </div>
      <div className="flex items-center">
        <div
          className="mx-4 flex cursor-pointer items-center gap-2 rounded px-2 py-1 transition-colors duration-200 hover:bg-zinc-700"
          onClick={checkHealth}
          title="Click to refresh server status"
        >
          <div className={`h-2 w-2 rounded-full ${statusColor}`}></div>
          <span className="text-xs text-gray-400">{statusText}</span>
        </div>

        <a
          href="https://github.com/the-AMA-team/scraply"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-4 my-auto flex h-4/5 items-center gap-2 rounded-md bg-zinc-700 px-4 py-2 transition-colors duration-200 hover:bg-zinc-600"
        >
          <AiOutlineStar className="h-4 w-4" />
          <span className="text-sm font-medium">Star on GitHub</span>
        </a>
      </div>
    </div>
  );
};

export default Navbar;
