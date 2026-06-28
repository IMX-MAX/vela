import "./app.css";
import { headers } from "next/headers";
import { Geist } from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://getvela.email"),
  title: "Vela | The Fastest AI Email Client for Modern Workflows",
  description: "Vela is a fast, modern AI email client spearheading UI and artificial intelligence in email. Experience the fastest email workflow.",
  keywords: ["vela", "ai email client", "email client", "AI email", "fast email client", "inbox"],
  alternates: {
    canonical: "https://getvela.email",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Vela | The Fastest AI Email Client for Modern Workflows",
    description: "Vela is a fast, modern AI email client spearheading UI and artificial intelligence in email.",
    url: "https://getvela.email",
    siteName: "Vela",
    images: [
      {
        url: "/og-image.png",
        alt: "Vela - The Fastest AI Email Client",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vela | The Fastest AI Email Client for Modern Workflows",
    description: "Vela is a fast, modern AI email client spearheading UI and artificial intelligence in email.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#2b323b",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  const nonce = headers().get("x-nonce") || "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Vela",
    "url": "https://getvela.email",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vela Email",
      "url": "https://getvela.email",
      "logo": "https://getvela.email/logo.png"
    }
  };

  return (
    <html lang="en" className={geist.className}>
      <head>
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-black antialiased text-[14px]">
        {children}
      </body>
    </html>
  );
}
