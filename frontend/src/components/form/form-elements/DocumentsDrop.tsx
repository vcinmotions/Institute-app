"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";

export const DOC_MAX_FILES = 10;
export const DOC_MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = { "image/png": [], "image/jpeg": [], "image/webp": [], "application/pdf": [] };

export const formatBytes = (n: number) => (n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

/**
 * Picks several documents (PNG, JPG, WEBP or PDF; up to 5 MB each). The chosen files are kept by the parent
 * and sent when the form is saved. `room` = how many more files the student may have.
 */
export default function DocumentsDrop({
  files,
  setFiles,
  room = DOC_MAX_FILES,
  disabled = false,
  title = "Documents",
  hint = "ID proof, marksheets, certificates - images or PDF, up to 5 MB each.",
}: {
  files: File[];
  setFiles: (f: File[]) => void;
  room?: number;
  disabled?: boolean;
  title?: string;
  hint?: string;
}) {
  const [error, setError] = useState("");
  const left = Math.max(0, room - files.length);

  const onDrop = (accepted: File[], rejected: { file: File }[]) => {
    setError("");
    const msgs: string[] = [];
    if (rejected.length) msgs.push(`${rejected.length} file(s) skipped: only PNG, JPG, WEBP or PDF.`);
    const tooBig = accepted.filter((f) => f.size > DOC_MAX_BYTES);
    if (tooBig.length) msgs.push(`${tooBig.map((f) => f.name).join(", ")}: larger than 5 MB.`);
    let ok = accepted.filter((f) => f.size <= DOC_MAX_BYTES);
    if (ok.length > left) {
      msgs.push(`Only ${left} more file(s) allowed (maximum ${DOC_MAX_FILES} per student).`);
      ok = ok.slice(0, left);
    }
    if (ok.length) setFiles([...files, ...ok]);
    if (msgs.length) setError(msgs.join(" "));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    disabled: disabled || left === 0,
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">{title}</h3>
        <span className="text-xs text-gray-500">{files.length} selected · {left} more allowed</span>
      </div>
      <div
        {...getRootProps()}
        className={`rounded-xl border border-dashed p-5 text-center transition ${
          left === 0 || disabled
            ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-60 dark:border-gray-800 dark:bg-gray-900"
            : isDragActive
              ? "cursor-pointer border-brand-500 bg-gray-100 dark:bg-gray-800"
              : "cursor-pointer border-gray-300 bg-gray-50 hover:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
        }`}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
          {left === 0 ? "Maximum number of documents reached" : isDragActive ? "Drop the files here" : "Drag & drop files here, or click to browse"}
        </p>
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-100 text-sm dark:divide-gray-800 dark:border-gray-800">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="min-w-0 truncate text-gray-700 dark:text-gray-300">
                {f.type === "application/pdf" ? "📄" : "🖼️"} {f.name}
                <span className="ml-2 text-xs text-gray-400">{formatBytes(f.size)}</span>
              </span>
              <button type="button" className="shrink-0 text-xs text-red-600 underline" onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
