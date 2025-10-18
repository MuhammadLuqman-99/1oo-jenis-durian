import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "100 Jenis Durian - Premium Malaysian Durian Supplier",
  description: "Discover over 100 varieties of premium Malaysian durian. Fresh, authentic, and delivered with care. Experience the king of fruits like never before.",
  keywords: ["durian", "musang king", "d24", "black thorn", "malaysian durian", "premium durian", "durian delivery"],
  authors: [{ name: "100 Jenis Durian" }],
  openGraph: {
    title: "100 Jenis Durian - Premium Malaysian Durian",
    description: "Discover over 100 varieties of premium Malaysian durian",
    type: "website",
    locale: "en_MY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
