"use client";

import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import ModalCard from "@/components/common/ModalCard";
import Alert from "@/components/ui/alert/Alert";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import SetupModalCard from "@/components/common/SetupModal";
import {
  City,
  Country,
  ICity,
  ICountry,
  IState,
  State,
} from "country-state-city";
import { z } from "zod";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

const CompanySchema = z.object({
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

export default function AddressSetupPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);
    const [newCompany, setNewCompany] = useState<CompanyData>({
      country: "IN",
      state: "",
      city: "",
      zipCode: "",
      fullAddress: "",
    });
      const [state, setState] = useState<IState[]>([]);
      const [city, setCity] = useState<ICity[]>([]);
        const [errors, setErrors] = useState<Partial<CompanyData>>({});
        const allCountries: ICountry[] = Country.getAllCountries();
      

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

    useEffect(() => {
      if (newCompany.country) {
        setState(State.getStatesOfCountry("IN"));
        const cities = City.getCitiesOfState("IN", "MH");
        setCity(cities);
      }
    }, []);

  const handleChange = (field: keyof CompanyData, value: string) => {

    if (field === "country") {
      setNewCompany((prev) => ({
        ...prev,
        country: value,
        state: "",
        city: "",
      }));

      setState(State.getStatesOfCountry(value));
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
      const cities = City.getCitiesOfState(countryIso, value);
      setCity(cities);

      return;
    }

    if (field === "city") {
      setNewCompany((prev) => ({
        ...prev,
        city: value,
      }));
      return;
    }

    setNewCompany((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const raw = window.localStorage.getItem("email");
    const email = raw ? JSON.parse(raw)?.email : "";

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());

     // Combine all data
    const payload = {
      email: email,
      country: newCompany.country,
      state: newCompany.state,
      city: newCompany.city,
      zipCode: newCompany.zipCode,
      fullAddress: newCompany.fullAddress,
    };

    try {
      const res = await fetch("http://localhost:5001/api/setup/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMsg("✅ Setup completed. Restarting app...");
      setTimeout(() => {
        if (typeof window !== "undefined" && "electronAPI" in window) {
          // @ts-ignore
          window.electronAPI.restartApp();
        }
      }, 1000);
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  }

  console.log("ADDRESS INFO DATA:", newCompany);

  return (
    <SetupModalCard title="Initial Setup">
      <div className="space-y-6">
        {msg && (
          <Alert
            variant={msg.startsWith("✅") ? "success" : "error"}
            title={msg.startsWith("✅") ? "Success" : "Error"}
            message={msg.replace(/^✅|❌/g, "").trim()}
            showLink={false}
          />
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          <div>
            <Label>Institute Full Address *</Label>
            <div className="relative">
              <TextArea
                rows={4}
                ref={firstInputRef}
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
                value={newCompany.country}
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
                value={newCompany.state}
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
              value={newCompany.city}
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

          <div className="mt-4 flex justify-end gap-3">
            {/* <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => {}}
            >
              Cancel
            </Button> */}
            <Button size="sm" disabled={loading}>
              {loading ? "Setting up..." : "Create System"}
            </Button>
          </div>
        </form>
      </div>
    </SetupModalCard>
  );
}
