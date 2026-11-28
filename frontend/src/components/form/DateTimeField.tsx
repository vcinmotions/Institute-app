"use client";

import React from "react";
import Input from "@/components/form/input/InputField";
import TimePicker from "@/components/form/TimePicker";

/**
 * Date + time in one row, replacing <input type="datetime-local">.
 * Value: "YYYY-MM-DDTHH:mm" (the same string datetime-local gave), "" when empty.
 * The date uses the normal calendar field; the time uses the TimePicker.
 */
type Props = {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  size?: "md" | "sm";
};

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function DateTimeField({ value = "", onChange, disabled = false, id, className = "", size = "md" }: Props) {
  const [date = "", time = ""] = String(value).split("T");
  const cleanTime = time.slice(0, 5);

  const setDate = (d: string) => onChange(d ? `${d}T${cleanTime || "09:00"}` : "");
  const setTime = (t: string) => onChange(t ? `${date || today()}T${t}` : date ? `${date}T00:00` : "");

  return (
    <div className={`flex w-full flex-col gap-2 sm:flex-row ${className}`}>
      <div className="min-w-0 flex-1">
        <Input id={id} type="date" value={date} disabled={disabled} onChange={(e) => setDate(e.target.value)} className={size === "sm" ? "!h-8 !text-xs" : ""} />
      </div>
      <div className="sm:w-44">
        <TimePicker value={cleanTime} onChange={setTime} disabled={disabled} size={size} aria-label="Time" />
      </div>
    </div>
  );
}
