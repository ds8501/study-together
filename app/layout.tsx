import type { Metadata } from "next";
import { APP_NAME, APP_TAGLINE } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = { title: `${APP_NAME} — ${APP_TAGLINE}`, description: "Build a learning roadmap, track your daily study streak, and make progress alongside a friend." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body suppressHydrationWarning>{children}</body></html>; }
