import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Meridian - AI Content Studio",
  description: "Turn an idea, article, or rough script into a complete video production package."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
