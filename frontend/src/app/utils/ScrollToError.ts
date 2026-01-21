import { useRef } from "react";

export const useScrollToError = () => {
  const inputRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToError = (errs: Record<string, string>) => {
    const firstErrorKey = Object.keys(errs)[0];
    if (!firstErrorKey) return;

    const element = inputRefs.current[firstErrorKey];
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const input = element.querySelector(
      "input, textarea, select"
    ) as HTMLElement | null;

    input?.focus();
  };

  return { inputRefs, scrollToError };
};
