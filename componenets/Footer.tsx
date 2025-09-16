"use client"
import { useRouter } from "next/navigation";

const Footer = () => {
  const router = useRouter();

  return (
    <footer className="bg-black text-gray-400 py-10 px-6 md:px-20 border-t border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Section */}
        <div>
          <h2 className="text-white text-lg font-semibold">Quantum Wager</h2>
          <p className="mt-2 text-sm">
            The prediction market for internet culture.
            Bet on meme coin futures with confidence.
          </p>
        </div>

        {/* Middle Section */}
        <div>
          <h3 className="text-white text-sm font-semibold uppercase">Product</h3>
          <ul className="mt-3 space-y-2 text-sm ">
            <li onClick={() => { router.push("/markets") }} className="hover:text-white hover:cursor-pointer">Markets</li>

            <li onClick={() => { router.push("/leaderboard") }} className="hover:text-white hover:cursor-pointer">Leaderboard</li>

            <li onClick={() => { router.push("/portfolio") }} className="hover:text-white hover:cursor-pointer" > Portfolio</li>

          </ul>
        </div>

        {/* Right Section */}
        <div>
          <h3 className="text-white text-sm font-semibold uppercase">Legal & Support</h3>
          <ul className="mt-3 space-y-2 text-sm">

            <li onClick={() => { router.push("/info/terms_of_services") }} className="hover:text-white hover:cursor-pointer">Terms of Service</li>

            <li onClick={() => { router.push("/info/privacy_policy") }} className="hover:text-white hover:cursor-pointer">Privacy Policy</li>

            <li onClick={() => { router.push("/info/support") }} className="hover:text-white hover:cursor-pointer">Support</li>

          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
        <p>© 2025 Quantum Wager. All rights reserved.</p>
        <p className="mt-1">Built for the crypto community • Trade responsibly</p>
      </div>
    </footer>
  );
};

export default Footer;
