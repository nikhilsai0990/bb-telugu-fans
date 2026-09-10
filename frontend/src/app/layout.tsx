import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.FRONTEND_URL || "http://localhost:9000"),
  title: "BB Telugu Fans — The Internet Home of Bigg Boss Telugu Fans",
  description:
    "The premier independent fan community for Bigg Boss Telugu. Real-time polls, contestant popularity rankings, latest news, memes, and fan discussions.",
  keywords: [
    "Bigg Boss Telugu",
    "BB Telugu Fans",
    "Bigg Boss Telugu voting",
    "BB Telugu polls",
    "Bigg Boss contestants",
    "BB Telugu memes",
    "Bigg Boss Telugu discussions",
  ],
  openGraph: {
    title: "BB Telugu Fans — The Internet Home of Bigg Boss Telugu Fans",
    description: "Real-time fan polls, rankings, and discussions for Bigg Boss Telugu.",
    images: ["/images/logo-bb10.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BB Telugu Fans — The Internet Home of Bigg Boss Telugu Fans",
    description: "Real-time fan polls, rankings, and discussions for Bigg Boss Telugu.",
    images: ["/images/logo-bb10.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-team-red selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}