"use client";
import React, { useEffect, useRef, useState } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/alert/Alert";
import { Tooltip } from "@heroui/tooltip";
import { useCreateCompany } from "@/hooks/useCreateCompany";
import { IState, ICity, ICountry, Country, State, City } from "country-state-city";
import { ChevronDownIcon } from "@/icons";
import Select from "../Select";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

interface DefaultInputsProps {
  onCloseModal: () => void;
}

interface CompanyData {
  name: string;
  instituteName: string;
  email: string;
  password: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  zipCode: string;
  position: string;
}

export default function CompanyForm({ onCloseModal }: DefaultInputsProps) {
  const [newCompany, setNewCompany] = useState<CompanyData>({
    name: "",
    instituteName: "",
    email: "",
    password: "",
    contact: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    position: "",
  });

  const [errors, setErrors] = useState<Partial<CompanyData>>({});
  const [alert, setAlert] = useState({
    show: false,
    title: "",
    message: "",
    variant: "",
  });
  const [state, setState] = useState<IState[]>([]);
  const [city, setCity] = useState<ICity[]>([]);
  const loading = useSelector((state: RootState) => state.auth.loading);

  const allCountries: ICountry[] = Country.getAllCountries();

  const firstInputRef = useRef<HTMLInputElement>(null);

  console.log("GET AUTH LOADING STATUS:", loading);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  const { mutate: createCompany } = useCreateCompany();

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

  const handleChange = (field: keyof CompanyData, value: string) => {
    if (field === "name") {
      const cleaned = value
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, "")
        .substring(0, 20);

      setNewCompany((prev) => ({
        ...prev,
        name: value,
        instituteName: cleaned,
      }));
      return;
    }

    if (field === "password") {
      setNewCompany((prev) => ({
        ...prev,
        password: value.trim().toLowerCase(),
      }));
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

    createCompany(newCompany, {
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
        position: "",
      });

      setAlert({
        show: true,
        title: "Company Created Successfully",
        message: "New Company has been Successfully Created.",
        variant: "success",
      });

      setTimeout(() => {
        onCloseModal();
      }, 3000);
    },

    onError: () => {
      // You already handle error via redux + toast
    },
  });
  };

  console.log("get all county data:", allCountries);
  console.log("get all state data:", state);
  console.log("get all city data:", city);
  console.log("get all data:", newCompany);
  return (
    <ModalCard title="Add New Company" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        {alert.show && (
          <Alert
            variant={alert.variant as any}
            title={alert.title}
            message={alert.message}
            showLink={false}
          />
        )}

        {/* NAME */}
        <div>
          <Label>Display Name *</Label>
          <Input
            ref={firstInputRef}
            type="text"
            placeholder="Ex. Soki Institute"
            value={newCompany.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* AUTO-INSTITUTE NAME */}
        <div>
          <div className="flex items-center gap-1">
            <Label>Institute Name</Label>
            <Tooltip
              content="Single-word name only"
              className="rounded bg-gray-600 text-[12px]"
            >
              <span className="mb-1 cursor-pointer text-xl text-gray-600">
                🛈
              </span>
            </Tooltip>
          </div>
          <Input
            type="text"
            placeholder="Institute Name"
            value={newCompany.instituteName}
            onChange={(e) => handleChange("instituteName", e.target.value)}
          />
          {errors.instituteName && (
            <p className="text-sm text-red-500">{errors.instituteName}</p>
          )}
        </div>

        {/* EMAIL */}
        <div>
          <Label>Email</Label>
          <Input
            type="text"
            placeholder="example@soki.com"
            value={newCompany.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div>
          <Label>Password</Label>
          <Input
            type="text"
            placeholder="Enter password"
            value={newCompany.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {/* CONTACT */}
        <div>
          <Label>Contact</Label>
          <Input
            type="text"
            placeholder="9898989898"
            value={newCompany.contact}
            onChange={(e) => handleChange("contact", e.target.value)}
          />
          {errors.contact && (
            <p className="text-sm text-red-500">{errors.contact}</p>
          )}
        </div>

        {/* COUNTRY */}
        <div>
          <Label>Select Country</Label>
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
          <Label>Select State</Label>
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
          {errors.country && (
            <p className="text-sm text-red-500">{errors.country}</p>
          )}
        </div>

        {/* CITY */}
        <div>
          <Label>City</Label>
          <Select
            options={city.map((c) => ({
              label: c.name,
              value: c.name, // city name is fine
            }))}
            placeholder="Select City"
            onChange={(value) => handleChange("city", value)}
            defaultValue={newCompany.city}
          />
          {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
        </div>

        {/* ZIPCODE */}
        <div>
          <Label>Zip Code</Label>
          <Input
            type="text"
            placeholder="Ex. 400024"
            value={newCompany.zipCode}
            onChange={(e) => handleChange("zipCode", e.target.value)}
          />
          {errors.zipCode && (
            <p className="text-sm text-red-500">{errors.zipCode}</p>
          )}
        </div>

        {/* POSITION */}
        <div>
          <Label>Position</Label>
          <Input
            type="text"
            placeholder="Team Manager"
            value={newCompany.position}
            onChange={(e) => handleChange("position", e.target.value)}
          />
          {errors.position && (
            <p className="text-sm text-red-500">{errors.position}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCloseModal}>
            Close
          </Button>
          <Button disabled={loading === true} onClick={handleSubmit}>{loading === true ? "Creating..." : "Save"}</Button>
        </div>
      </div>
    </ModalCard>
  );
}
