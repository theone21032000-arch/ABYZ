import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import "../styles.css";
import "./next.css";

export const metadata: Metadata = {
  title: "ABYZ — Think clearly. Build intentionally.",
  description: "A workspace for clear software thinking."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>
        <ClerkProvider
          appearance={{
            // Clerk v7/v6 uses theme, while accepting baseTheme for compatibility
            theme: dark,
            baseTheme: dark,
            variables: {
              colorPrimary: "#8B5CF6",
              colorBackground: "#0D1017",
              colorForeground: "#F1F5F9",
              colorInput: "#121722",
              colorInputForeground: "#F1F5F9",
              colorText: "#F1F5F9",
              colorInputBackground: "#121722",
            },
            elements: {
              card: {
                backgroundColor: "#0D1017",
                border: "1px solid #293244",
                color: "#F1F5F9",
              },
              userButtonPopoverCard: {
                backgroundColor: "#0D1017",
                border: "1px solid #293244",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
              },
              userButtonPopoverActionButton: {
                color: "#F1F5F9",
                "&:hover": {
                  backgroundColor: "#181F2D",
                },
              },
              userButtonPopoverActionButtonText: {
                color: "#F1F5F9",
              },
              userButtonPopoverActionButtonIcon: {
                color: "#94A3B8",
              },
              userButtonPopoverFooter: {
                borderTop: "1px solid #293244",
                backgroundColor: "#0D1017",
              },
              userPreviewMainIdentifier: {
                color: "#F1F5F9",
              },
              userPreviewSecondaryIdentifier: {
                color: "#94A3B8",
              },
            },
          } as any}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
