import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Methods from "./methods";

export function useUserTokens() {
  const { getUserAllTokens } = Methods();
  const [tokens, setTokens] = useState<
    Awaited<ReturnType<typeof getUserAllTokens>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!wallet?.publicKey) return;
    let cancelled = false;

    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retry loop for program initialization
        let attempts = 0;
        while (attempts < 10) {
          try {
            const acc = await getUserAllTokens();
            if (!cancelled) setTokens(acc || []);
            break;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("Progrma not found")) {
              attempts++;
              console.log(`⏳ Retrying getUserAllTokens (${attempts}/10)`);
              await new Promise((res) => setTimeout(res, 1000));
              continue;
            }
            throw err;
          }
        }
      } catch (err) {
        console.error("Failed to fetch tokens:", err);
        toast.error("Could not load tokens");
        setError("Failed to load tokens");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTokens();
    return () => {
      cancelled = true;
    };
  }, [wallet?.publicKey]);

  return { tokens, loading, error };
}
