import "./app.css";

export const metadata = {
  title: "Vela | The fastest email experience",
  description: "A fast, modern email client powered by Appwrite and Vela Intelligence",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#f2f2f1] text-[#1e1e1e] antialiased font-[Inter] text-[14px]">
        {children}
      </body>
    </html>
  );
}
