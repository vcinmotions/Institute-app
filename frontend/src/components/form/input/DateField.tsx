"use client";
import React from "react";
import Input from "./InputField";

/**
 * Date picker (native calendar popup, icon inside the field) for forms that keep
 * their date state as "DD-MM-YYYY" strings. The state/API format is unchanged;
 * only the input is now a real picker instead of free text.
 */
const dmyToIso = (v?: string) => {
  const m = /^(\d{2})[-/](\d{2})[-/](\d{4})$/.exec(v ?? "");
  return m ? `${m[3]}-${m[2]}-${m[1]}` : /^\d{4}-\d{2}-\d{2}$/.test(v ?? "") ? (v as string) : "";
};
const isoToDmy = (v: string) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
};

type Props = Omit<React.ComponentProps<typeof Input>, "type" | "value" | "onChange"> & {
  value?: string;
  /** Receives the new value as DD-MM-YYYY ("" when cleared). */
  onChange: (dmy: string) => void;
};

export default function DateField({ value, onChange, ...rest }: Props) {
  return (
    <Input
      {...rest}
      type="date"
      value={dmyToIso(value)}
      onChange={(e) => onChange(isoToDmy(e.target.value))}
    />
  );
}
