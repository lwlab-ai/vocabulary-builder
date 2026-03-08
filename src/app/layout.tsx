import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vocabulary Builder",
  description: "Learn new vocabulary words one at a time",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50">
        <header className="border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-xl font-semibold tracking-tight">Vocabulary Builder</h1>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
