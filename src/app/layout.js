import "./app.css";

export const metadata = {
  title: "Vela | The fastest email client and experience",
  description: "Vela is a fast, modern email client spearheading UI and AI in email. Experience the fastest email workflow.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Vela | The fastest email client and experience",
    description: "Vela is a fast, modern email client spearheading UI and AI in email.",
    url: "https://vela.nafen.sbs",
    siteName: "Vela",
    locale: "en_US",
    type: "website",
  },
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
