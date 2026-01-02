export function focusNextInput(current: HTMLElement) {
  const form = current.closest("form") || document;
  const focusable = Array.from(
    form.querySelectorAll<HTMLElement>(
      'input, select, textarea, button, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute("disabled"));

  const index = focusable.indexOf(current);
  if (index > -1 && index + 1 < focusable.length) {
    focusable[index + 1].focus();
  }
}
