/** Small helpers. (Copy-email and the iframe focus ring move here when the pages that use them are migrated.) */
export function initMisc() {
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
}
