"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";

export default function AdmissionConfigForm() {
  const [form, setForm] = useState({
    prefix: "",
    suffix: "",
    separator: "-",
    numberLength: "4",
  });

  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("token") : null;

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admission-config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (data) {
        setForm({
          prefix: data.prefix || "",
          suffix: data.suffix || "",
          separator: data.separator || "-",
          numberLength: String(data.numberLength || 4),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const previewNumber = () => {
    const num = "1".padStart(Number(form.numberLength), "0");

    const parts = [];
    if (form.prefix) parts.push(form.prefix);
    parts.push(num);
    if (form.suffix) parts.push(form.suffix);

    return parts.join(form.separator);
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("/api/admission-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      toast.success("Config saved successfully");
    } catch {
      toast.error("Failed to save config");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border">
      <h2 className="text-lg font-semibold mb-4">
        Admission Number Settings
      </h2>

      <div className="space-y-4">
        <div>
          <Label>Prefix</Label>
          <Input
            value={form.prefix}
            onChange={(e) => handleChange("prefix", e.target.value)}
            placeholder="e.g. ABI"
          />
        </div>

        <div>
          <Label>Number Length</Label>
          <Input
            type="number"
            value={form.numberLength}
            onChange={(e) =>
              handleChange("numberLength", e.target.value)
            }
          />
        </div>

        <div>
          <Label>Suffix</Label>
          <Input
            value={form.suffix}
            onChange={(e) => handleChange("suffix", e.target.value)}
            placeholder="e.g. 2627"
          />
        </div>

        <div>
          <Label>Separator</Label>
          <Input
            value={form.separator}
            onChange={(e) => handleChange("separator", e.target.value)}
          />
        </div>

        <div className="bg-gray-100 p-3 rounded">
          <p className="text-sm">Preview:</p>
          <p className="font-bold text-lg">{previewNumber()}</p>
        </div>

        <Button onClick={handleSubmit}>Save Config</Button>
      </div>
    </div>
  );
}