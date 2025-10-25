"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";
import "nprogress/nprogress.css";

export default function RouteProgress() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
