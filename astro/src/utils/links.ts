/** Attributes for a link that opens in a new tab (PDFs and other sites). */
export function linkAttrs(link: { external?: boolean }) {
  return link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
}
