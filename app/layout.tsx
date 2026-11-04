import type { Metadata } from "next";
import { TEAM_CONFIG } from "./team-config";
import "./globals.css";

export const metadata: Metadata = {
  title: `${TEAM_CONFIG.teamName} - DevOps Showcase`,
  description: `${TEAM_CONFIG.slogan} | Desplegado con Jenkins CI y AWS Amplify`,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#faf9f8] text-slate-800 antialiased selection:bg-pink-100 selection:text-pink-900">
        {children}
      </body>
    </html>
  );
}
