import "./app.css";

export const metadata = {
  metadataBase: new URL("https://getvela.email"),
  title: "Vela | The Fastest AI Email Client",
  description: "Vela is a fast, modern AI email client spearheading UI and artificial intelligence in email. Experience the fastest email workflow.",
  keywords: ["vela", "ai email client", "email client", "AI email", "fast email client"],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Vela | The Fastest AI Email Client",
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
    title: "Vela | The Fastest AI Email Client",
    description: "Vela is a fast, modern AI email client spearheading UI and artificial intelligence in email.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  themeColor: "#2b323b",
  colorScheme: "light",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#eceae6] text-[#1e1e1e] antialiased font-[Inter] text-[14px]">
        {children}
      </body>
    </html>
  );
}
