"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import ModalCard from "@/components/common/ModalCard";
import Button from "@/components/ui/button/Button";
import Label from "@/components/form/Label";

interface ChangeLogModalProps {
  isOpen: boolean;
  title?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function ChangeLogModal({
  isOpen,
  title = "Reason for Change",
  loading = false,
  onClose,
  onConfirm,
}: ChangeLogModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    
    if (!reason.trim()) {
      setError("Reason is required.");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }

    setError("");
    onConfirm(reason);
    setReason("");
  };

  if (!isOpen) return null;
  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalCard title={title} oncloseModal={onClose}>
        <div className="space-y-4">
          <div>
            <Label>Enter reason for making changes</Label>
            <textarea
              className="w-full rounded border p-2"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Example: Corrected spelling mistake..."
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              size="sm"
              className="bg-gray-300 text-black"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              className="bg-blue-600 text-white"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? "Updating..." : "Confirm & Update"}
            </Button>
          </div>
        </div>
      </ModalCard>
    </Modal>
  );
}
