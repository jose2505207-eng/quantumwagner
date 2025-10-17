"use client";

import { Market } from "@/components/market/types";
import { BACKEND_URL } from "@/config";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import toast from "react-hot-toast";

export function useMarkets() {
  const { setMarkets } = useMarketStore();

  const fetchMarkets = async ():Promise<void> => {
    try {
      const res = await axios.get<{success:boolean,markets:Market[]}>(`${BACKEND_URL}/api/admin/markets`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (res.data.success) {
        setMarkets(res.data.markets);
      }
    } catch (err) {
      toast.error(`Failed to fetch markets ${err}`);
    }
  };

  return { fetchMarkets };
}
