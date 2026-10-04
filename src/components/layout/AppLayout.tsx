import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Skip navigation — invisible until focused, critical for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-neutral-200 bg-white shadow-sm z-10">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-20 lg:pb-0 scroll-smooth">
        <main id="main-content" tabIndex={-1} className="min-h-full outline-none">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-bottom">
        <MobileNav />
      </div>
    </div>
  );
}
