"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Background } from "@/components/background";

interface InfoPageProps {
  title: string;
  /** Rendered under the title, e.g. "Last updated: 3 August 2026". */
  updated?: string;
  intro?: string;
  children: React.ReactNode;
}

/**
 * Shared shell for the footer's static pages (Terms, Privacy, Support). These
 * were previously one-word stubs that rendered no layout at all, so they read
 * as broken pages.
 */
export function InfoPage({ title, updated, intro, children }: InfoPageProps) {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <Background />

      <div className="relative z-10 container mx-auto px-4 py-24 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors group mb-8"
        >
          <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span>Back to home</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-3">
            {title}
          </h1>
          {updated && (
            <p className="text-sm text-muted-foreground mb-6">{updated}</p>
          )}
          {intro && (
            <p className="text-lg text-white/70 leading-relaxed mb-10">
              {intro}
            </p>
          )}

          <div className="space-y-10">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}

export function InfoSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold text-white">{heading}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-white/60 [&_a]:text-primary [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}

/** Prominent, deliberately un-missable callout. */
export function InfoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm leading-relaxed text-yellow-100/80">
      {children}
    </div>
  );
}
