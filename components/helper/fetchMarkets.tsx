"use client";

import { Market } from "@/app/types";
import { useMarketStore } from "@/store/adminMarketStore";
import axios from "axios";
import toast from "react-hot-toast";

export function useMarkets() {
  const { setMarkets } = useMarketStore();

  const fetchMarkets = async ():Promise<void> => {
    try {
      const res = await axios.get<{success:boolean,markets:Market[]}>("http://localhost:8000/api/admin/markets", {
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
