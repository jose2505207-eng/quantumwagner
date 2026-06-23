// Legacy alias for /api/auth/verify-wallet (the existing frontend calls this).
import { POST as verifyWallet } from "../verify-wallet/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = verifyWallet;
