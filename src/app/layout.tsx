import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "GLOS STUDIO STAFF PORTAL",
  description: "Beauty Staff Adventure - attendance & monitoring as a retro pixel game.",
};

export const viewport: Viewport = {
  themeColor: "#0a0520",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="scanlines min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
