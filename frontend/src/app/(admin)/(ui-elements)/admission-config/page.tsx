"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { toast } from "sonner";
import { useGetAdmissionConfig, useUpdateAdmissionConfig } from "@/hooks/queries/useQueryFetchAdmissionConfig";

export default function AdmissionConfigPage() {
    const { data, isLoading } = useGetAdmissionConfig();
    const { mutate: updateConfig, isPending } = useUpdateAdmissionConfig();

    const [form, setForm] = useState({
        prefix: "",
        suffix: "",
        separator: "-",
        numberLength: 4,
        includeYear: false,
        currentNumber: 1,
    });

    const [preview, setPreview] = useState("");
    const [alert, setAlert] = useState(false);

    // ✅ Load existing config OR default
    useEffect(() => {
        if (data) {
            setForm({
                prefix: data.prefix || "ADM",
                suffix: data.suffix || "",
                separator: data.separator || "-",
                numberLength: data.numberLength || 4,
                includeYear: data.includeYear || false,
                currentNumber: data.currentNumber || 1,
            });
        }
    }, [data]);

    // ✅ Generate preview
    useEffect(() => {
        const padded = String(form.currentNumber).padStart(
            form.numberLength,
            "0"
        );

        const year = form.includeYear
            ? new Date().getFullYear().toString().slice(-2)
            : "";

        let result = form.prefix;

        if (form.prefix) result += form.separator;

        result += padded;

        if (year) result += form.separator + year;

        if (form.suffix) result += form.separator + form.suffix;

        setPreview(result);
    }, [form]);

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSubmit = () => {
        updateConfig(form, {
            onSuccess: () => {
                toast.success("Admission config saved");
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
            },
            onError: () => {
                toast.error("Failed to save config");
            },
        });
    };

    if (isLoading) return <div className="p-6 text-gray-500">Loading configuration...</div>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Admission Settings" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3 shadow-sm">
                <div className="flex flex-col gap-6">

                    {/* Header & Alerts */}
                    <div className="border-b pb-4 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">
                            Admission Config
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Define the automated sequence and format for new student admission numbers.
                        </p>
                    </div>

                    {alert && (
                        <Alert
                            variant="success"
                            title="Saved"
                            message="Configuration updated successfully"
                            showLink={false}
                        />
                    )}

                    {/* Section 1: Format Details */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Format Details
                        </h3>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <Label>Prefix</Label>
                                <Input
                                    value={form.prefix}
                                    tabIndex={1}
                                    onChange={(e) => handleChange("prefix", e.target.value)}
                                    placeholder="ADM"
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <Label>Number Length *</Label>
                                <Input
                                    type="number"
                                    value={form.numberLength}
                                    tabIndex={2}
                                    onChange={(e) => handleChange("numberLength", Number(e.target.value))}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <Label>Separator</Label>
                                <Input
                                    value={form.separator}
                                    tabIndex={3}
                                    onChange={(e) => handleChange("separator", e.target.value)}
                                    placeholder="-"
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <Label>Suffix</Label>
                                <Input
                                    value={form.suffix}
                                    tabIndex={4}
                                    onChange={(e) => handleChange("suffix", e.target.value)}
                                    placeholder="Optional"
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <Label>Current Number</Label>
                                <Input
                                    type="number"
                                    value={form.currentNumber}
                                    tabIndex={5}
                                    onChange={(e) => handleChange("currentNumber", Number(e.target.value))}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="flex flex-col justify-center pt-2">
                                <Label className="invisible hidden md:block">Include Year</Label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="includeYear"
                                        tabIndex={6}
                                        checked={form.includeYear}
                                        onChange={(e) => handleChange("includeYear", e.target.checked)}
                                        className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-900 dark:ring-offset-gray-900 cursor-pointer"
                                    />
                                    <Label htmlFor="includeYear" className="!mb-0 cursor-pointer select-none">
                                        Include Year (e.g. 26)
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Live Preview */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                            Live Preview
                        </h3>
                        <div className="flex flex-col items-center justify-center rounded-lg bg-white p-8 border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Generated Format</p>
                            <p className="font-mono text-3xl font-bold tracking-widest text-gray-800 dark:text-gray-100">
                                {preview}
                            </p>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                        <Button
                            size="sm"
                            tabIndex={7}
                            variant="primary"
                            disabled={isPending}
                            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-500"
                            onClick={handleSubmit}
                        >
                            {isPending ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}