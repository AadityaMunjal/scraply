"use client";
import { useDemo } from "~/state/DemoContext";

const Navbar = () => {
  const { isDemoing, setIsDemoing } = useDemo();
  return (
    <div className="flex justify-between bg-zinc-800 text-white">
      <div className="flex">
        <img src="favicon.png" className="my-auto ml-4 h-8" alt="" />
        <div className="mx-4 py-4 pr-7 font-semibold">scraply</div>
      </div>
      <div className="flex">
        {/* <button
          className="relative mx-4 my-auto h-4/5 rounded-md bg-blue-500 px-4 hover:bg-blue-600"
          onClick={() => setIsDemoing(true)}
        >
          Demo
        </button> */}
      </div>
    </div>
  );
};

export default Navbar;
