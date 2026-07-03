"use client";

import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { useComapnyStore } from "@/store/companyStore";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState } from "@/store";

import Button from "@/components/ui/button/Button";
import {
    City,
    Country,
    ICity,
    ICountry,
    IState,
    State,
} from "country-state-city";
import { z } from "zod";
import { useCreateCompany } from "@/hooks/useCreateCompany";
import { Tooltip } from "@heroui/react";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";
import { useRouter } from "next/navigation";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import TextArea from "@/components/form/input/TextArea";
import { toast } from "sonner";
import { setError } from "@/store/slices/authSlice";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import { countries } from "@/components/common/CountriesCode";
import { normalizeEmail, titleCase } from "@/app/utils/Normalize";
import { useScrollToError } from "@/app/utils/ScrollToError";

const CompanySchema = z.object({
    name: z.string().min(1, "Display Name is required"),
    instituteName: z.string().min(1, "Institute Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    contact: z
        .string()
        .min(10, "Contact must be 10 digits")
        .regex(/^[0-9]+$/, "Contact must be numeric"),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    fullAddress: z.string().min(1, "Address is required"),
    zipCode: z
        .string()
        .min(5, "Zipcode must be at least 5 digits")
        .regex(/^[0-9]+$/, "Zipcode must be numeric"),
    financialStartDate: z.string().min(1, "Financial Year is required"),
    financialEndDate: z.string().min(1, "Financial Year is required"),
});

type CompanyData = z.infer<typeof CompanySchema>;
type FormErrors = Partial<Record<keyof CompanyData, string>>;

export default function CompanyForm() {
    const [newCompany, setNewCompany] = useState<CompanyData>({
        name: "",
        instituteName: "",
        email: "",
        password: "",
        contact: "",
        country: "IN",
        state: "",
        city: "",
        zipCode: "",
        fullAddress: "",
        financialStartDate: "",
        financialEndDate: "",
    });

    const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
    const [selectedStamp, setSelectedStamp] = useState<File | null>(null);
    const [selectedSign, setSelectedSign] = useState<File | null>(null);
    const [selectedCertificate, setSelectedCertificate] = useState<string | null>(null);

    const router = useRouter();
    const { inputRefs, scrollToError } = useScrollToError();

    const [errors, setErrors] = useState<FormErrors>({});
    const [alert, setAlert] = useState({
        show: false,
        title: "",
        message: "",
        variant: "",
    });

    const { form, reset, setField } = useComapnyStore();
    const [state, setState] = useState<IState[]>([]);
    const [city, setCity] = useState<ICity[]>([]);
    const loading = useSelector((state: RootState) => state.auth.loading);

    const allCountries: ICountry[] = Country.getAllCountries();

    const firstInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const error = useSelector((state: RootState) => state.auth.error);

    useEffect(() => {
        if (!error) return;

        toast.error(error);

        const timer = setTimeout(() => {
            dispatch(setError(null));
        }, 3000);

        return () => clearTimeout(timer);
    }, [error, dispatch]);

    const certificateTemplates = Array.from({ length: 4 }, (_, i) => ({
        src: `/certificates/certificate-template-${i + 1}.png`,
        alt: `certificate-template-${i + 1}.png`,
    }));

    useEffect(() => {
        if (form) {
            setNewCompany((prev) => ({
                ...prev,
                name: form.name ?? "",
                instituteName: form.instituteName ?? "",
                email: form.email ?? "",
                password: form.password ?? "",
                contact: form.contact ?? "",
                country: form.country ?? "IN",
                state: form.state ?? "",
                city: form.city ?? "",
                zipCode: form.zipCode ?? "",
                fullAddress: form.fullAddress ?? "",
            }));
        }
    }, []);

    const handleResetForm = () => {
        reset();
        setNewCompany({
            name: "",
            instituteName: "",
            email: "",
            password: "",
            contact: "",
            country: "",
            state: "",
            city: "",
            zipCode: "",
            fullAddress: "",
            financialStartDate: "",
            financialEndDate: "",
        });
    };

    useEffect(() => {
        firstInputRef.current?.focus();
    }, []);

    const { mutate: createCompany } = useCreateCompany();

    useEffect(() => {
        if (newCompany.country) {
            setState(State.getStatesOfCountry("IN"));
            const cities = City.getCitiesOfState("IN", "MH");
            setCity(cities);
        }
    }, []);

    const validate = () => {
        const newErrors: Partial<CompanyData> = {};

        Object.entries(newCompany).forEach(([key, value]) => {
            if (!String(value).trim()) {
                newErrors[key as keyof CompanyData] = `${key} is required`;
            }
        });

        setErrors(newErrors);
        setTimeout(() => setErrors({}), 2000);

        return {
            isValid: Object.keys(newErrors).length === 0,
            errors: newErrors,
        };
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            !/[0-9]/.test(e.key) &&
            e.key !== "+" &&
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight" &&
            e.key !== "Tab"
        ) {
            e.preventDefault();
        }
    };

    const handlePhoneNumberChange = (phoneNumber: string, code: string) => {
        const formattedNumber = code + phoneNumber;

        setNewCompany((prev) => ({
            ...prev,
            contact: formattedNumber,
        }));

        setField("contact", formattedNumber);

        if (phoneNumber.length === 10) {
            setErrors((prev) => ({ ...prev, contact: "" }));
        } else {
            setErrors((prev) => ({
                ...prev,
                contact: "Phone number must be 10 digits",
            }));
        }
    };

    const generatePassword = (length = 12): void => {
        const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
        const numberChars = "0123456789";
        const symbolChars = "@#$%&";

        const getRandomChar = (chars: string) =>
            chars[Math.floor(Math.random() * chars.length)];

        let password = [
            getRandomChar(uppercaseChars),
            getRandomChar(lowercaseChars),
            getRandomChar(numberChars),
            getRandomChar(symbolChars),
        ];

        const allChars =
            uppercaseChars + lowercaseChars + numberChars + symbolChars;

        for (let i = password.length; i < length; i++) {
            password.push(getRandomChar(allChars));
        }

        password = password.sort(() => Math.random() - 0.5);

        setNewCompany((prev) => ({ ...prev, password: password.join("") }));
    };

    const capitalizeWords = (text: string) =>
        text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

    const handleChange = (field: keyof CompanyData, value: string) => {
        if (field === "instituteName") {
            const cleaned = value.toLowerCase();
            const displayName = capitalizeWords(value);

            setNewCompany((prev) => ({
                ...prev,
                name: displayName,
                instituteName: cleaned,
            }));
            setField("instituteName", cleaned);
            setField("name", displayName);
            return;
        }

        if (field === "name") {
            const displayName = capitalizeWords(value);

            setNewCompany((prev) => ({
                ...prev,
                name: displayName,
            }));

            setField("name", displayName);
            return;
        }

        if (field === "email") {
            const cleaned = value.toLowerCase();

            setNewCompany((prev) => ({
                ...prev,
                email: cleaned,
            }));
            setField("email", cleaned);
            return;
        }

        if (field === "password") {
            setNewCompany((prev) => ({
                ...prev,
                password: value,
            }));

            setField("password", value);
            return;
        }

        if (field === "country") {
            setNewCompany((prev) => ({
                ...prev,
                country: value,
                state: "",
                city: "",
            }));

            setState(State.getStatesOfCountry(value));
            setField("country", value);
            setCity([]);
            return;
        }

        if (field === "state") {
            const countryIso = newCompany.country;

            setNewCompany((prev) => ({
                ...prev,
                state: value,
                city: "",
            }));
            setField("state", value);
            const cities = City.getCitiesOfState(countryIso, value);
            setCity(cities);

            return;
        }

        if (field === "city") {
            setNewCompany((prev) => ({
                ...prev,
                city: value,
            }));
            setField("city", value);
            return;
        }

        // --- NEW LOGIC FOR AUTOMATIC FINANCIAL END DATE ---
        if (field === "financialStartDate") {
            let calculatedEndDate = "";
            
            if (value) {
                const startDate = new Date(value);
                if (!isNaN(startDate.getTime())) {
                    // Advance 1 full year, and subtract 1 day (e.g., 2026-04-01 to 2027-03-31)
                    const endDate = new Date(startDate);
                    endDate.setFullYear(startDate.getFullYear() + 1);
                    endDate.setDate(startDate.getDate() - 1);
                    
                    // Format to 'YYYY-MM-DD'
                    calculatedEndDate = endDate.toISOString().split("T")[0];
                }
            }

            setNewCompany((prev) => ({
                ...prev,
                financialStartDate: value,
                financialEndDate: calculatedEndDate,
            }));
            
            setField("financialStartDate", value);
            setField("financialEndDate", calculatedEndDate);
            
            setErrors((prev) => ({ ...prev, financialStartDate: "", financialEndDate: "" }));
            return;
        }

        setNewCompany((prev) => ({ ...prev, [field]: value }));
        setField(field, value);
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async () => {
        const { isValid, errors: validationErrors } = validate();

        if (!isValid) {
            setAlert({
                show: true,
                title: "Validation Error",
                message: "Please enter required fields.",
                variant: "error",
            });

            scrollToError(validationErrors);

            setTimeout(() => {
                setAlert({ show: false, title: "", message: "", variant: "" });
            }, 2000);

            return;
        }

        const token = sessionStorage.getItem("token");
        if (!token) {
            setAlert({
                show: true,
                title: "Unauthorized",
                message: "Token not found. Please log in again.",
                variant: "error",
            });

            window.scrollTo({ top: 0, behavior: "smooth" });

            setTimeout(() => {
                setAlert({ show: false, title: "", message: "", variant: "" });
            }, 2000);

            return;
        }

        const financialYear = `${new Date(newCompany.financialStartDate).getFullYear()}-${new Date(newCompany.financialEndDate).getFullYear()}`;

        const admissionPayload = {
            name: titleCase(newCompany.name).trim(),
            email: normalizeEmail(newCompany.email).trim(),
            contact: newCompany.contact,
            instituteName: newCompany.instituteName.trim(),
            password: newCompany.password.trim(),
            country: newCompany.country,

            financialYear,
            financialStartDate: newCompany.financialStartDate,
            financialEndDate: newCompany.financialEndDate,

            state: newCompany.state,
            city: newCompany.city,
            zipCode: newCompany.zipCode,
            fullAddress: newCompany.fullAddress,

            logo: selectedLogo,
            stamp: selectedStamp,
            sign: selectedSign,
            certificateName: selectedCertificate,
        };

        createCompany(admissionPayload, {
            onSuccess: () => {
                setNewCompany({
                    name: "",
                    instituteName: "",
                    email: "",
                    password: "",
                    contact: "",
                    country: "",
                    state: "",
                    city: "",
                    zipCode: "",
                    fullAddress: "",
                    financialStartDate: "",
                    financialEndDate: "",
                });

                window.scrollTo({ top: 0, behavior: "smooth" });

                setAlert({
                    show: true,
                    title: "Company Created",
                    message: "New Company has been Successfully Created.",
                    variant: "success",
                });
                reset();

                setTimeout(() => {
                    router.back();
                }, 1000);
            },

            onError: () => {
                window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
            },
        });
    };

    return (
        <div>
            <PageBreadcrumb pageTitle="Create Company" />

            <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/3 shadow-sm">
                <div className="flex flex-col gap-6">

                    {/* Header & Alerts */}
                    <div className="border-b pb-4 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-50">Company Information</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fill in the details below to register a new company.</p>
                    </div>

                    {error && <Alert variant={"error"} title={""} message={error} showLink={false} />}
                    {alert.show && (
                        <Alert
                            variant={alert.title === "Company Created" ? "success" : "error"}
                            title={alert.title}
                            message={alert.message}
                            showLink={false}
                        />
                    )}

                    {/* Section 1: Institute & Account Details */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Institute &amp; Account Details</h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <div ref={(el) => { inputRefs.current.name = el; }}>
                                <div className="flex items-center gap-1">
                                    <Label>Institute Name *</Label>
                                    <Tooltip
                                        content="Unique than other created company"
                                        className="rounded bg-gray-200 text-[12px]"
                                    >
                                        <span className="mb-1 cursor-pointer text-xl text-gray-600">🛈</span>
                                    </Tooltip>
                                </div>
                                <Input
                                    ref={firstInputRef}
                                    type="text"
                                    tabIndex={1}
                                    placeholder="Enter Institute Name"
                                    value={titleCase(newCompany.instituteName)}
                                    onChange={(e) => handleChange("instituteName", e.target.value)}
                                />
                                {errors.instituteName && <p className="mt-1 text-sm text-red-500">{errors.instituteName}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.displayName = el; }}>
                                <Label>Display Name *</Label>
                                <Input
                                    type="text"
                                    tabIndex={2}
                                    placeholder="Enter Display Name"
                                    value={titleCase(newCompany.name)}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.email = el; }}>
                                <Label>Username *</Label>
                                <Input
                                    type="text"
                                    tabIndex={3}
                                    placeholder="Enter Username"
                                    value={normalizeEmail(newCompany.email)}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                />
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.password = el; }}>
                                <Label>Password *</Label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        tabIndex={4}
                                        placeholder="Enter password"
                                        value={newCompany.password}
                                        onChange={(e) => handleChange("password", e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.contact = el; }}>
                                <Label>Contact *</Label>
                                <PhoneInput
                                    selectPosition="start"
                                    countries={countries}
                                    tabIndex={5}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter Contact"
                                    onChange={handlePhoneNumberChange}
                                />
                                {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.financialStartDate = el; }}>
                                <Label>Financial Start Date *</Label>
                                <Input
                                    type="date"
                                    tabIndex={6}
                                    value={newCompany.financialStartDate}
                                    onChange={(e) => handleChange("financialStartDate", e.target.value)}
                                />
                                {errors.financialStartDate && <p className="mt-1 text-sm text-red-500">{errors.financialStartDate}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.financialEndDate = el; }}>
                                <Label>Financial End Date *</Label>
                                <Input
                                    type="date"
                                    tabIndex={7}
                                    value={newCompany.financialEndDate}
                                    readOnly // Prevents direct mutation since it's pre-calculated now
                                    className="bg-gray-100 cursor-not-allowed dark:bg-gray-800"
                                    placeholder="Auto-calculated"
                                />
                                {errors.financialEndDate && <p className="mt-1 text-sm text-red-500">{errors.financialEndDate}</p>}
                            </div>

                        </div>
                    </div>

                    {/* Section 2: Address Information */}
                    <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-5 dark:border-gray-800 dark:bg-gray-900/50">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Address Information</h3>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <div className="lg:col-span-3" ref={(el) => { inputRefs.current.fullAddress = el; }}>
                                <Label>Institute Full Address *</Label>
                                <TextArea
                                    rows={4}
                                    onChange={(value) => handleChange("fullAddress", value)}
                                    placeholder="Enter Full Address"
                                    value={newCompany.fullAddress}
                                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                                />
                                {errors.fullAddress && <p className="mt-1 text-sm text-red-500">{errors.fullAddress}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.country = el; }}>
                                <Label>Select Country *</Label>
                                <div className="relative">
                                    <Select
                                        options={allCountries.map((c) => ({ label: c.name, value: c.isoCode }))}
                                        placeholder="Select Country"
                                        onChange={(value) => handleChange("country", value)}
                                        defaultValue={newCompany.country}
                                    />
                                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                                {errors.country && <p className="mt-1 text-sm text-red-500">{errors.country}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.statelocation = el; }}>
                                <Label>Select State *</Label>
                                <div className="relative">
                                    <Select
                                        options={state.map((s) => ({ label: s.name, value: s.isoCode }))}
                                        placeholder="Select State"
                                        onChange={(value) => handleChange("state", value)}
                                        defaultValue={newCompany.state}
                                    />
                                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                                        <ChevronDownIcon />
                                    </span>
                                </div>
                                {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.city = el; }}>
                                <Label>City *</Label>
                                <Select
                                    options={city.map((c) => ({ label: c.name, value: c.name }))}
                                    placeholder="Select City"
                                    onChange={(value) => handleChange("city", value)}
                                    defaultValue={newCompany.city}
                                />
                                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                            </div>

                            <div ref={(el) => { inputRefs.current.zipCode = el; }}>
                                <Label>Zip Code *</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Enter Zip Code"
                                    value={newCompany.zipCode}
                                    onChange={(e) => handleChange("zipCode", e.target.value)}
                                />
                                {errors.zipCode && <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>}
                            </div>

                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                        <Button
                            disabled={loading === true}
                            size="sm"
                            tabIndex={8}
                            variant="primary"
                            className="min-w-[120px] rounded bg-gray-900 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:bg-brand-600 dark:hover:bg-brand-500"
                            onClick={handleSubmit}
                        >
                            {loading === true ? "Creating..." : "Save Company"}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}