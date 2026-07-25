import "./globals.css";

export const metadata = {
  title: "Collaburo",
  description: "Venue workflow builder and booking intake.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
