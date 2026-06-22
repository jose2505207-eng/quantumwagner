/**
 * Shared loading spinner + address helper.
 *
 * These previously lived as named exports on `app/portfolio/page.tsx`, which
 * Next.js disallows (a route file may only export the page + route config).
 * Moved here so they can be imported anywhere safely.
 */

export const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export function shortenAddress(addr: string) {
  if (!addr) return "Unknown";
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}
