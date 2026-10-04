import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Study Together — Your roadmap. Your pace. Your journey.", description: "Build a learning roadmap, track your daily study streak, and make progress alongside a friend." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body suppressHydrationWarning>{children}</body></html>; }
