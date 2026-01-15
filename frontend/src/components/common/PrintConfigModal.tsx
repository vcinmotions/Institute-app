"use client";
import React, { useState } from "react";
import ModalCard from "./ModalCard";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

interface PrintConfig {
  showLogo: boolean;
  showStudentPhoto: boolean;
  showStamp: boolean;
  showDeclaration: boolean;
  studentSign: boolean;
  letterHead: boolean;
}

interface Props {
  initialConfig: PrintConfig;
  onSave: (config: PrintConfig) => void;
  onClose: () => void;
}

const PrintConfigModal: React.FC<Props> = ({
  initialConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<PrintConfig>(initialConfig);

  console.log("GET INITIALIZE PRINT CONFIGURE DATA:", config);
  // ✅ Handle checkbox
  const handleToggle = (key: string, checked: boolean) => {
    setConfig((prev) => ({ ...prev, [key]: checked }));
  };

  return (
    <ModalCard title="Configure Print Settings" oncloseModal={onClose}>
      <div className="flex flex-col gap-4 p-4">
        {Object.entries(config).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between gap-2">
            {key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())}
            {/* <input
              type="checkbox"
              tabIndex={1}
              checked={value}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, [key]: e.target.checked }))
              }
            /> */}
            <Checkbox
              checked={value}
              onChange={(checked) => handleToggle(key, checked)}
            />
          </label>
        ))}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded bg-gray-500 px-4 py-2 text-gray-600"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
          size="sm"
             variant="primary"  className="rounded bg-gray-300 px-4 py-2 text-sm text-black transition hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-900"
            onClick={() => onSave(config)}
          >
            Save
          </Button>
        </div>
      </div>
    </ModalCard>
  );
};

export default PrintConfigModal;
