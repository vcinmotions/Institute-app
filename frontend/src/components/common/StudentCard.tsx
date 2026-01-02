import React, { useState } from "react";
import Button from "../ui/button/Button";
import DefaultInputs from "../form/form-elements/DefaultInputs";
import Badge from "../ui/badge/Badge";

interface StudentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  onCreateClick?: () => void; // <-- Add this
}

const StudentCard: React.FC<StudentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  onCreateClick,
}) => {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {/* Card Header */}
      <div className="flex justify-between items-center px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {title}
        </h3>
         {/* <Button size="sm" className="rounded bg-gray-900 px-4 py-2 text-white text-sm hover:bg-gray-700 transition" onClick={onCreateClick}>Create</Button>  */}
        {desc && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default StudentCard;
