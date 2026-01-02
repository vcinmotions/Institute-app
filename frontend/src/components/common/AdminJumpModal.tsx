"use client";

import React, { useEffect, useState } from "react";
import { adminMasterRoutes } from "@/app/utils/MasterRoutes";
import { useRouter } from "next/navigation";

interface AdminRouteItem {
  label: string;
  list: string;
  create?: string;
}

interface JumpModalProps {
  type: "create" | "list" | "view";
  close: () => void;
  userRole: string[];
}

export default function AdminJumpModal({
  type,
  close,
  userRole,
}: JumpModalProps) {
  const router = useRouter();
  //const items = Object.values(adminMasterRoutes) as AdminRouteItem[];
  const items = Object.values(adminMasterRoutes).filter((item) =>
    item.roles.includes(userRole as any),
  ) as AdminRouteItem[];

  // Only include items that have a create route if type is "create"
  const filteredItems = items.filter(
    (item) => type !== "create" || item.create,
  );

  console.log("GET FILTERED JUMP MODAL DATA:", filteredItems);

  const [selected, setSelected] = useState(0);

  console.log("GET USER ROLES IN ADMIN JUMP MODAL:", userRole);

  // Map "view" → "list"
  const actualType: "list" | "create" = type === "view" ? "list" : type;

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => (s + 1) % filteredItems.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => (s - 1 + filteredItems.length) % filteredItems.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();

      const target =
        filteredItems[selected][actualType] ?? filteredItems[selected].list;

      router.push(target);
      close();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      close();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, actualType]);

  return (
    <div
      id="jump-modal"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50"
    >
      <div className="w-80 rounded bg-white p-5 shadow-xl">
        <h1 className="mb-3 text-xl font-bold">
          {type === "create"
            ? "Select Master to Create"
            : type === "list"
              ? "Select Master List"
              : "Select Master to View"}
        </h1>

        <ul>
          {filteredItems.map((item, i) => (
            <li
              key={item.label}
              className={`my-2 cursor-pointer rounded p-2 ${
                i === selected ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {item.label}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-xs text-gray-500">
          ↑ ↓ navigate • Enter select • Esc close
        </p>
      </div>
    </div>
  );
}
