"use client";
import { AiOutlineStar } from "react-icons/ai";

const Navbar = () => {
  return (
    <div className="flex justify-between bg-zinc-800 text-white">
      <div className="flex">
        <img src="favicon.png" className="my-auto ml-4 h-8" alt="" />
        <div className="mx-4 py-4 pr-7 font-semibold">scraply</div>
      </div>
      <div className="flex">
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
