"use client";

import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { useComapnyStore } from "@/store/companyStore";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { RootState } from "@/store";
import { ArrowRightIcon } from "@/icons"; // you can use your own icon

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

// interface CompanyData {
//   name: string;
//   instituteName: string;
//   email: string;
//   password: string;
//   contact: string;
//   country: string;
//   state: string;
//   city: string;
//   zipCode: string;
// }

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
});

type CompanyData = z.infer<typeof CompanySchema>;

export default function Company() {
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
  });

  const [selectedLogo, setSelectedLogo] = useState<File | null>(null);
  const [selectedStamp, setSelectedStamp] = useState<File | null>(null);
  const [selectedSign, setSelectedSign] = useState<File | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const [errors, setErrors] = useState<Partial<CompanyData>>({});
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
      dispatch(setError(null)); // ✅ Clear error after 3 sec
    }, 3000);

    return () => clearTimeout(timer);
  }, [error, dispatch]);

  const certificateTemplates = Array.from({ length: 4 }, (_, i) => ({
    src: `/certificates/certificate-template-${i + 1}.png`,
    alt: `certificate-template-${i + 1}.png`,
  }));
  console.log("GET AUTH LOADING STATUS:", loading);

  // useEffect(() => {
  //         const handleKeyDown = (e: KeyboardEvent) => {
  //           if (e.key === "Escape") {
  //           e.preventDefault();
  //           redirect('/master-dashboard');
  //         }
  //         };

  //         window.addEventListener("keydown", handleKeyDown);
  //         return () => window.removeEventListener("keydown", handleKeyDown);
  //       }, []);

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
    setTimeout(() => setErrors({}), 3000);

    return Object.keys(newErrors).length === 0;
  };

  // Function to generate a password based on selected options
  const generatePassword = (length = 12): void => {
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const symbolChars = "@#$%&";
    //const symbolChars = "!@#$%^&*()_+[]{}|;:,.<>?";

    // Ensure at least one character from each type
    const getRandomChar = (chars: string) =>
      chars[Math.floor(Math.random() * chars.length)];

    let password = [
      getRandomChar(uppercaseChars),
      getRandomChar(lowercaseChars),
      getRandomChar(numberChars),
      getRandomChar(symbolChars),
    ];

    // Combine all characters
    const allChars =
      uppercaseChars + lowercaseChars + numberChars + symbolChars;

    // Fill the rest of the password
    for (let i = password.length; i < length; i++) {
      password.push(getRandomChar(allChars));
    }

    // Shuffle password so first 4 chars aren't predictable
    password = password.sort(() => Math.random() - 0.5);

    // Set password in state
    setNewCompany((prev) => ({ ...prev, password: password.join("") }));
  };

  const handleChange = (field: keyof CompanyData, value: string) => {
    if (field === "instituteName") {
      // const cleaned = value
      //   .toLowerCase()
      //   .replace(/[^a-z0-9]/gi, "")
      //   .substring(0, 20);

      setNewCompany((prev) => ({
        ...prev,
        name: value,
        instituteName: value,
      }));
      setField("name", value);
      setField("instituteName", value);
      return;
    }

    if (field === "password") {
      setNewCompany((prev) => ({
        ...prev,
        password: value.trim().toLowerCase(),
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

    setNewCompany((prev) => ({ ...prev, [field]: value }));
    setField(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setAlert({
        show: true,
        title: "Validation Error",
        message: "Please fill all fields.",
        variant: "error",
      });

      setTimeout(
        () => setAlert({ show: false, title: "", message: "", variant: "" }),
        3000,
      );
      return;
    }

    // Combine all data
    const admissionPayload = {
      name: newCompany.name,
      email: newCompany.email,
      contact: newCompany.contact,
      instituteName: newCompany.instituteName,
      password: newCompany.password,
      country: newCompany.country,
      state: newCompany.state,
      city: newCompany.city,
      zipCode: newCompany.zipCode,
      fullAddress: newCompany.fullAddress,

      logo: selectedLogo, // you'll need to track this in state
      stamp: selectedStamp, // you'll need to track this in state
      sign: selectedSign, // you'll need to track this in state
      certificateName: selectedCertificate, // you'll need to track this in state
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
        });

        setAlert({
          show: true,
          title: "Company Created Successfully",
          message: "New Company has been Successfully Created.",
          variant: "success",
        });
        reset();

        setTimeout(() => {
          router.back();
        }, 1000);
      },

      onError: () => {
        // You already handle error via redux + toast
        window.scrollTo({
          top: 0,
          left: 0, // Optional: scrolls to the leftmost position as well
          behavior: "smooth", // For smooth scrolling animation
        });
      },
    });
  };

  console.log("get all county data:", allCountries);
  console.log("get all state data:", state);
  console.log("get all city data:", city);
  console.log(
    "get all data:",
    newCompany,
    selectedCertificate,
    selectedLogo,
    selectedSign,
    selectedStamp,
  );
  console.log("get all data Company Store adat:", form);

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Company" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        {/* <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Profile
        </h3> */}

        {error && (
          <div className="mb-2 rounded-md border border-red-300 bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {alert.show && (
            <Alert
              variant={alert.variant as any}
              title={alert.title}
              message={alert.message}
              showLink={false}
            />
          )}

          <h2 className="border-b pb-6">Company Infomation</h2>

          <div className="grid grid-cols-2 gap-8 border-b pb-8">
            {/* AUTO-INSTITUTE NAME */}
            <div className="col-span-4 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1">
                <Label>Institute Name </Label>
                <Tooltip
                  content="Unique than other created company"
                  className="rounded bg-gray-200 text-[12px]"
                >
                  <span className="mb-1 cursor-pointer text-xl text-gray-600">
                    🛈
                  </span>
                </Tooltip>
              </div>
              <Input
                ref={firstInputRef}
                type="text"
                placeholder="Enter Institute Name"
                value={newCompany.instituteName}
                onChange={(e) => handleChange("instituteName", e.target.value)}
              />
              {errors.instituteName && (
                <p className="text-sm text-red-500">{errors.instituteName}</p>
              )}
            </div>

            {/* NAME */}
            <div className="col-span-4 md:col-span-2 lg:col-span-1">
              <Label>Display Name </Label>
              <Input
                type="text"
                placeholder="Enter Display Name"
                value={newCompany.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div className="col-span-4 md:col-span-2 lg:col-span-1">
              <Label>Username </Label>
              <Input
                type="text"
                placeholder="Enter Username"
                value={newCompany.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="relative col-span-4 md:col-span-2 lg:col-span-1">
              <Label>Password *</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter password"
                  value={newCompany.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pr-10" // add padding to the right so button doesn't overlap text
                />
                {/* <button
                  type="button"
                  onClick={() => generatePassword(12)}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full"
                >
                  <ArrowRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-200" />
                </button> */}
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {/* CONTACT */}
            <div className="col-span-4 md:col-span-2 lg:col-span-1">
              <Label>Contact </Label>
              <Input
                type="text"
                placeholder="Enter Contact"
                value={newCompany.contact}
                onChange={(e) => handleChange("contact", e.target.value)}
              />
              {errors.contact && (
                <p className="text-sm text-red-500">{errors.contact}</p>
              )}
            </div>
          </div>

          <h2 className="border-b pb-6">Address Infomation</h2>

          <div>
            <Label>Institute Full Address *</Label>
            <div className="relative">
              <TextArea
                rows={4}
                onChange={(value) => handleChange("fullAddress", value)}
                placeholder="Enter Full Address"
                value={newCompany.fullAddress}
                className="w-full rounded border border-gray-300 px-3 py-2 pb-0 text-sm text-black placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
              {errors.fullAddress && (
                <p className="text-sm text-red-500">{errors.fullAddress}</p>
              )}
            </div>
          </div>
          {/* COUNTRY */}
          <div>
            <Label>Select Country *</Label>
            <div className="relative">
              <Select
                options={allCountries.map((c) => ({
                  label: c.name,
                  value: c.isoCode,
                }))}
                placeholder="Select Country"
                onChange={(value) => handleChange("country", value)}
                defaultValue={newCompany.country}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.country && (
              <p className="text-sm text-red-500">{errors.country}</p>
            )}
          </div>

          {/* STATE */}
          <div>
            <Label>Select State *</Label>
            <div className="relative">
              <Select
                options={state.map((s) => ({
                  label: s.name,
                  value: s.isoCode,
                }))}
                placeholder="Select State"
                onChange={(value) => handleChange("state", value)}
                defaultValue={newCompany.state}
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                <ChevronDownIcon />
              </span>
            </div>
            {errors.state && (
              <p className="text-sm text-red-500">{errors.state}</p>
            )}
          </div>

          {/* CITY */}
          <div>
            <Label>City *</Label>
            <Select
              options={city.map((c) => ({
                label: c.name,
                value: c.name, // city name is fine
              }))}
              placeholder="Select City"
              onChange={(value) => handleChange("city", value)}
              defaultValue={newCompany.city}
            />
            {errors.city && (
              <p className="text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          {/* ZIPCODE */}
          <div>
            <Label>Zip Code </Label>
            <Input
              type="text"
              placeholder="Enter Zip Code"
              value={newCompany.zipCode}
              onChange={(e) => handleChange("zipCode", e.target.value)}
            />
            {errors.zipCode && (
              <p className="text-sm text-red-500">{errors.zipCode}</p>
            )}
          </div>

          {/* <h2 className="border-y py-6">Institute Infomation</h2>

          <div className="space-y-2">
      
            <div className="flex w-full gap-2">
              <div className="w-full">
                <DropzonBoxComponent
                  title="Institute Logo"
                  selectedFile={selectedLogo}
                  setSelectedFile={setSelectedLogo}
                />
              </div>

              <div className="w-full">
                <DropzonBoxComponent
                  title="Institute Stamp"
                  selectedFile={selectedStamp}
                  setSelectedFile={setSelectedStamp}
                />
              </div>
            </div>

            <div className="w-full pb-3">
              <DropzonBoxComponent
                title="Institute Sign"
                selectedFile={selectedSign}
                setSelectedFile={setSelectedSign}
              />
            </div>

            <h2 className="border-y py-6">Institute Certificate</h2>

            <div className="grid grid-cols-4 gap-4">
              {certificateTemplates.map((item, i) => (
                <div
                  key={i}
                  className={`cursor-pointer rounded-lg border p-1 transition ${selectedCertificate === item.alt ? "border-blue-600 shadow-md" : "border-gray-300"}`}
                  onClick={() => setSelectedCertificate(item.alt)}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="h-auto w-full rounded"
                  />
                </div>
              ))}
            </div>
          </div> */}

          {/* BUTTONS */}
          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              disabled={loading === true}
              onClick={handleResetForm}
            >
              Clear
            </Button>
            <Button disabled={loading === true} onClick={handleSubmit}>
              {loading === true ? "Creating..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
