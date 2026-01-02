"use client";

import React, { useEffect, useState } from "react";
import { masterRoutes } from "@/app/utils/MasterRoutes";
import { useRouter } from "next/navigation";
import { escBus } from "@/app/utils/escBus";

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

export default function JumpModal({ type, close, userRole }: JumpModalProps) {
  const router = useRouter();
  //const items = Object.values(masterRoutes) as AdminRouteItem[];

  console.log("GET MASER ROUTES IN JUMP MODAL DATA:", masterRoutes);
  console.log("GET TYPE IN JUMP MODAL DATA:", type);
  const items = Object.values(masterRoutes).filter((item) =>
    item.roles.includes(userRole as any),
  ) as AdminRouteItem[];
  const [selected, setSelected] = useState(0);
  console.log("GET ITEMS JUMP MODAL DATA:", items);
  console.log("GET VALUES JUMP MODAL DATA:", Object.values(items));
  console.log("GET VALUES JUMP MODAL DATA:", Object.keys(masterRoutes));

  // Only include items that have a create route if type is "create"
  const filteredItems = items.filter(
    (item) => type !== "create" || item.create,
  );

  console.log("GET FILTERED JUMP MODAL DATA:", filteredItems);

  // Map "view" → "list"
  const actualType: "list" | "create" = type === "view" ? "list" : type;

  useEffect(() => {
    if (type) {
      escBus.modalHandled = true;
      console.log("GET ESCBUS HANDLE IN JuMP MODAL OPEN:", escBus.modalHandled);
    }
  }, [type]);

  // const handleKey = (e: KeyboardEvent) => {
  //   if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement).tagName)) return;

  //   if (e.key === "ArrowDown") {
  //     e.preventDefault();
  //     setSelected((s) => (s + 1) % items.length);
  //   }
  //   if (e.key === "ArrowUp") {
  //     e.preventDefault();
  //     setSelected((s) => (s - 1 + items.length) % items.length);
  //   }
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     const item = items[selected];
  //     router.push(item[actualType]);
  //     close();
  //   }
  //   if (e.key === "Escape") {
  //     e.preventDefault();
  //     close();
  //   }
  // };

  const handleJumoModal = () => {
    const target =
      filteredItems[selected][actualType] ?? filteredItems[selected].list;

    router.push(target);
  };

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
      escBus.modalHandled = false;
      close();
    }
    // if (e.key === "Escape") {
    //   e.preventDefault();
    //   close();
    // }

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50">
      <div className="w-[400px] rounded bg-white p-5 shadow-xl">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {type === "create"
            ? "Select Master to Create"
            : type === "list"
              ? "Select Master List"
              : "Select Master to View"}
        </h3>

        <ul>
          {filteredItems.map((item, i) => (
            <li
              onClick={handleJumoModal}
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
