import { Inter, Space_Grotesk, Newsreader, JetBrains_Mono } from "next/font/google";

export const heading = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-heading",
});

export const base = Inter({
    subsets: ["latin"],
    variable: "--font-base",
});

// Luxury design system additions (used only under [data-theme="luxury"]).
export const newsreader = Newsreader({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-newsreader",
});

export const jetbrainsMono = JetBrains_Mono({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-jetbrains",
});
