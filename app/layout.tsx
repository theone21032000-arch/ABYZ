import type { Metadata } from "next";
import "../styles.css";
import "./next.css";

export const metadata: Metadata = {
  title: "ABYZ — Think clearly. Build intentionally.",
  description: "A workspace for clear software thinking."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
