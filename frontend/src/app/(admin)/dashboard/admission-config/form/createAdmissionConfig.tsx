"use client";

import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
// Assuming you have this component based on the reference UI


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
    <div>
      {/* Assuming PageBreadcrumb is available globally in your layout */}
      <PageBreadcrumb pageTitle="Admission Configuration" />

      <div className="form-container">
        <div className="flex flex-col gap-6">

          {/* Header & Alerts */}
          <div className="border-b pb-4 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-50 uppercase">
              Admission Form Settings
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1">
              Configure the sequence and formatting rules for student admission numbers.
            </p>
          </div>

          {/* Section 1: Format Details */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Format Details
            </h3>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

              <div>
                <Label>Prefix</Label>
                <Input
                  value={form.prefix}
                  tabIndex={1}
                  onChange={(e) => handleChange("prefix", e.target.value)}
                  placeholder="e.g. ABI"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label>Number Length *</Label>
                <Input
                  type="number"
                  value={form.numberLength}
                  tabIndex={2}
                  onChange={(e) => handleChange("numberLength", e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label>Suffix</Label>
                <Input
                  value={form.suffix}
                  tabIndex={3}
                  onChange={(e) => handleChange("suffix", e.target.value)}
                  placeholder="e.g. 2627"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <Label>Separator</Label>
                <Input
                  value={form.separator}
                  tabIndex={4}
                  onChange={(e) => handleChange("separator", e.target.value)}
                  placeholder="e.g. -"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

            </div>
          </div>

          {/* Section 2: Live Preview */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Live Preview
            </h3>
            <div className="flex items-center justify-center rounded-lg bg-white p-8 border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
              <p className="font-mono text-3xl font-bold tracking-widest text-gray-800 dark:text-gray-100">
                {previewNumber()}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
            <Button
              size="sm"
              tabIndex={5}
              variant="primary"
              className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
              onClick={handleSubmit}
            >
              Save Config
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}