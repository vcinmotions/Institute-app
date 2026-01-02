"use client";
import React, { useState, useEffect, useRef } from "react";
import Label from "../Label";
import Input from "../input/InputField";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";

interface DefaultInputsProps {
  onCloseModal: () => void;
  encryptedPassword: any;
}

interface EncryptedPassowrdData {
  password: string;
}

export default function ShowEncryptedPassword({
  onCloseModal,
  encryptedPassword,
}: DefaultInputsProps) {
  const [newEnquiry, setNewEnquiry] = useState<EncryptedPassowrdData>({
    password: "",
  });
  console.log("GEt enquiry data to edit Enquiry:", encryptedPassword);

  console.log("GET ENQUIRY FORM DATA", newEnquiry);

  return (
    <ModalCard title="Secret Password" oncloseModal={onCloseModal}>
      <div className="space-y-6">
        <div>
          <Label>Password</Label>
          <Input
            type="text"
            placeholder="Info Demo"
            readOnly
            value={encryptedPassword}
            tabIndex={1}
            success
          />
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm" variant="outline" onClick={onCloseModal}>
            Close
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
