import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Unbounded } from "next/font/google";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neovrit Admin",
  description: "Neovrit mission brief dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#06080C] text-[#EEF2FF]">
        <ClerkProvider>
          <div className="min-h-screen bg-[#06080C] text-[#EEF2FF]">
            {children}
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}
