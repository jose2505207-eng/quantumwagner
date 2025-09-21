"use client"
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const Footer = () => {
  const router = useRouter();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-black text-gray-400 py-10 px-6 md:px-20 border-t border-gray-800"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white text-lg font-semibold">Quantum Wager</h2>
          <p className="mt-2 text-sm">
            The prediction market for internet culture.
            Bet on meme coin futures with confidence.
          </p>
        </motion.div>

        {/* Middle Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-white text-sm font-semibold uppercase">Product</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: "Markets", path: "/markets" },
              { label: "Leaderboard", path: "/leaderboard" },
              { label: "Portfolio", path: "/portfolio" }
            ].map((item, i) => (
              <motion.li
                key={i}
                onClick={() => router.push(item.path)}
                whileHover={{ color: "#fff" }}
                className="hover:cursor-pointer"
              >
                {item.label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-white text-sm font-semibold uppercase">Legal & Support</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: "Terms of Service", path: "/info/terms_of_services" },
              { label: "Privacy Policy", path: "/info/privacy_policy" },
              { label: "Support", path: "/info/support" }
            ].map((item, i) => (
              <motion.li
                key={i}
                onClick={() => router.push(item.path)}
                whileHover={{ color: "#fff" }}
                className="hover:cursor-pointer"
              >
                {item.label}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500"
      >
        <p>© 2025 Quantum Wager. All rights reserved.</p>
        <p className="mt-1">
          Built for the crypto community • Trade responsibly
        </p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
