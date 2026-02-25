// modalManager.ts

let openModalCount = 0;

export function lockBodyScroll() {
  openModalCount++;

  if (openModalCount === 1) {
    document.body.style.overflow = "hidden";
  }
}

export function unlockBodyScroll() {
  openModalCount--;

  if (openModalCount <= 0) {
    document.body.style.overflow = "";
    openModalCount = 0;
  }
}