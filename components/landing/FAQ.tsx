"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const faqs = [
  {
    q: "How do prediction markets work on Quantum wager?",
    a: "Prediction markets allow users to buy and sell positions based on potential outcomes. Prices reflect the collective belief of participants about the probability of an event happening.",
  },
  {
    q: "What happens to my money when I place a bet?",
    a: "Your funds are locked into the smart contract until the market resolves. If your prediction is correct, you’ll receive your winnings automatically.",
  },
  {
    q: "How are market outcomes determined?",
    a: "Outcomes are decided using verified data sources and decentralized oracles to ensure fairness and transparency.",
  },
  {
    q: "Can I sell my position before the market closes?",
    a: "Yes, you can trade your position with other participants in the market before it resolves.",
  },
  {
    q: "What fees does Quantum wager charge?",
    a: "Quantum Wager charges a small transaction fee on trades and winnings to maintain the platform.",
  },
  {
    q: "Is my wallet safe on Quantum wager?",
    a: "Yes, your wallet is never controlled by Quantum Wager. All funds remain in your custody and interact only with audited smart contracts.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative  py-20 overflow-hidden">
      {/* background gradient glow */}
      <div className="absolute  " />

      <div className="relative max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* FAQ left side */}
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">
            Frequently asked questions
          </h2>
          <p className="text-gray-400 mb-8">
            Everything you need to know about prediction markets and how{" "}
            <i>Quantum wager</i> works.
          </p>

          <div className="space-y-4">
            {faqs.map((item, index) => (
              <div
                key={index}
                className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggle(index)}
                >
                  <span className="text-white font-medium">{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </div>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-gray-400 text-sm">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Right side cube image */}
        <div className="flex justify-center">
          <Image
            src="/Container.png" // make sure this file is in public/ folder
            alt="3D Cube Illustration"
            width={500}
            height={500}
            className="drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]"
          />
        </div>
      </div>
    </section>
  );
}
