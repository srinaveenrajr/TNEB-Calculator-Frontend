import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Rootlayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Navbar />
      <main className="flex-1 w-full mt-[100px]">
        <Outlet />
      </main>
    </div>
  );
};

export default Rootlayout;
