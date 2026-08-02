/**
 * Who sees the Admin link.
 *
 * The navbars used to gate it on `kyc_level >= 3`, but the profile endpoint
 * hardcodes `kyc_level: 0` (server/users.ts) — so the link could never render
 * for anyone and the admin surface was reachable only by typing the URL.
 *
 * This is NAVIGATION ONLY. Every privileged action is still authorised
 * server-side by ADMIN_RESOLUTION_KEY; listing a wallet here grants no power,
 * it just stops hiding the page from the operator who runs the deployment.
 */
export const ADMIN_WALLETS: string[] = (
  process.env.NEXT_PUBLIC_ADMIN_WALLETS ?? ""
)
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean);

export function isAdminWallet(address?: string | null): boolean {
  if (!address) return false;
  return ADMIN_WALLETS.includes(address);
}
