"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Hide layout (navbar/sidebar) on specific pages like login/register
  const hideLayout = ["/", "/login", "/register"].includes(pathname);
  const showSidebar =
    !hideLayout && pathname !== "/login" && pathname !== "/register";

  // For pages that should have no layout (landing, login, register)
  if (hideLayout) {
    return <>{children}</>;
  }

  // For dashboard and other pages that need navbar + sidebar
  return (
    <>
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 p-6 ${showSidebar ? "ml-64" : ""}`}>
          {children}
        </main>
      </div>
    </>
  );
}
