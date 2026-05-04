"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { toast } from "sonner";
import { useGetPaymentReceiptConfig, useUpdatePaymentReceiptConfig } from "@/hooks/queries/useQueryFetchPaymentReceiptConfig";
import StudentCard from "@/components/common/StudentCard";

export default function PaymentReceiptConfigPage() {
    const { data, isLoading } = useGetPaymentReceiptConfig();
    const { mutate: updateConfig, isPending } = useUpdatePaymentReceiptConfig();

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
                prefix: data.prefix || "RCP",
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
                toast.success("Payment receipt config saved");
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
            },
            onError: () => {
                toast.error("Failed to save payment receipt config");
            },
        });
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <div>
            <PageBreadcrumb pageTitle="Payment Receipt Number Settings" />

            <StudentCard title="Payment Receipt Config">

                {alert && (
                    <Alert
                        variant="success"
                        title="Saved"
                        message="Payment receipt configuration updated successfully"
                        showLink={false}
                    />
                )}

                <div className="space-y-6">

                    <div>
                        <Label>Prefix</Label>
                        <Input
                            value={form.prefix}
                            onChange={(e) => handleChange("prefix", e.target.value)}
                            placeholder="RCP"
                        />
                    </div>

                    <div>
                        <Label>Number Length</Label>
                        <Input
                            type="number"
                            value={form.numberLength}
                            onChange={(e) =>
                                handleChange("numberLength", Number(e.target.value))
                            }
                        />
                    </div>

                    <div>
                        <Label>Separator</Label>
                        <Input
                            value={form.separator}
                            onChange={(e) => handleChange("separator", e.target.value)}
                            placeholder="-"
                        />
                    </div>

                    <div>
                        <Label>Suffix</Label>
                        <Input
                            value={form.suffix}
                            onChange={(e) => handleChange("suffix", e.target.value)}
                            placeholder="Optional"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.includeYear}
                            onChange={(e) =>
                                handleChange("includeYear", e.target.checked)
                            }
                        />
                        <Label>Include Year (e.g. 26)</Label>
                    </div>

                    <div>
                        <Label>Current Number</Label>
                        <Input
                            type="number"
                            value={form.currentNumber}
                            onChange={(e) =>
                                handleChange("currentNumber", Number(e.target.value))
                            }
                        />
                    </div>

                    {/* 🔥 LIVE PREVIEW */}
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500">Preview</p>
                        <h2 className="text-xl font-bold">{preview}</h2>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSubmit} disabled={isPending}>
                            Save Configuration
                        </Button>
                    </div>

                </div>
            </StudentCard>
        </div>
    );
}
