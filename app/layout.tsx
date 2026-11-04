import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevOps Release Hub - Demo Project",
  description: "CI/CD Workshop Instructor Demo - Jenkins CI and AWS Amplify Hosting SSR",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[#fafafa] text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  );
}
