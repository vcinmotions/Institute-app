// app/not-found.tsx  OR  components/Glitch404.tsx
"use client";
import React from "react";
import "../../app/styles/glitch.css"; // 👈 We'll define styles below

const Glitch404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <div className="glitch text-[8rem] font-extrabold" data-text="[404]">
        [404]
      </div>
    </div>
  );
};

export default Glitch404;
