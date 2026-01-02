// components/common/ConfirmDeleteModal.tsx
"use client";

import React from "react";
import ModalCard from "./ModalCard"; // your existing modal
import Button from "../ui/button/Button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item?",
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  return (
    <ModalCard title={title} oncloseModal={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </ModalCard>
  );
}
