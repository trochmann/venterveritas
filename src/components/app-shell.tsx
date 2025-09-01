"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, Settings, Home, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils"; // Falls du den Helper aus dem Setup-Dokument hast

interface AppShellProps {
  children: React.ReactNode;
  logo?: React.ReactNode;
}

export default function AppShell({ children, logo }: AppShellProps) {
  const [open, setOpen] = useState(false);

  function handleNav() {
    setOpen(false);
  }

  const NavItems = (
    <nav className="mt-2 space-y-1">
      <Link href="/" onClick={handleNav} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-muted">
        <Home className="h-5 w-5" /> <span>Dashboard</span>
      </Link>
      <Link href="/lebensmittel" onClick={handleNav} className="flex items-center gap-2 rounded px-3 py-2 hover:bg-muted">
        <User className="h-5 w-5" /> <span>Lebensmittel</span>
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile: Burger */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted md:hidden"
            aria-label="Menü öffnen"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {/* Logo */}
          <div className="font-bold leading-none">{logo ?? <span>VenterVeritas</span>}</div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 hover:bg-muted" aria-label="Einstellungen">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Desktop */}
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 border-r md:block">
          <div className="flex h-full flex-col p-3">
            <div className="text-xs uppercase text-muted-foreground px-3 pb-2">Menü</div>
            {NavItems}
            <div className="mt-auto pt-4 border-t">
              <button className="mt-2 flex w-full items-center gap-2 rounded px-3 py-2 hover:bg-muted">
                <LogOut className="h-5 w-5" /> <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        {/* Overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            open ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setOpen(false)}
        />
        {/* Panel */}
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-72 max-w-[85%] border-r bg-background shadow-lg transition-transform",
            open ? "translate-x-0" : "-translate-x-full"
          )}
          role="dialog"
          aria-label="Mobiles Menü"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="font-semibold">Menü</div>
            <button className="rounded-md p-2 hover:bg-muted" onClick={() => setOpen(false)} aria-label="Menü schließen">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-3">
            {NavItems}
            <div className="mt-4 border-t pt-4">
              <button className="flex w-full items-center gap-2 rounded px-3 py-2 hover:bg-muted">
                <LogOut className="h-5 w-5" /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}