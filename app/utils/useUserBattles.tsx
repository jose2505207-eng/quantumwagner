import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Methods from "./methods";

export function useUserBattles() {
  const { getUserBattles } = Methods();
  const [battles, setBattles] = useState<
    Awaited<ReturnType<typeof getUserBattles>>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wallet = useAnchorWallet();

  useEffect(() => {
    if (!wallet?.publicKey) return;
    let cancelled = false;

    const fetchBattles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retry loop for program initialization
        let attempts = 0;
        while (attempts < 10) {
          try {
            const acc = await getUserBattles();
            if (!cancelled) setBattles(acc || []);
            break;
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("Progrma not found")) {
              attempts++;
              console.log(`⏳ Retrying getUserAllbattles (${attempts}/10)`);
              await new Promise((res) => setTimeout(res, 1000));
              continue;
            }
            throw err;
          }
        }
      } catch (err) {
        console.error("Failed to fetch battles:", err);
        toast.error("Could not load battles");
        setError("Failed to load battles");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBattles();
    return () => {
      cancelled = true;
    };
  }, [wallet?.publicKey]);

  return { battles, loading, error };
}
