import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Study Together — Learning, in motion", description: "A shared space for independent learning journeys." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body suppressHydrationWarning>{children}</body></html>; }
