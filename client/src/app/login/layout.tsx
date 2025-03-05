import { Toaster } from "sonner";
import type { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Toaster richColors position="top-right" />
      {children}
    </>
  );
}

