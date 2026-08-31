"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/cost-estimation", label: "Cost Estimation" },
  { href: "/rate-master", label: "Rate Master" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        background: "rgba(245,240,232,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: "var(--border)",
      }}
    >
      <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2.5 group" aria-label="EcoBuild AI home">
          <span
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-sm group-hover:scale-105 transition-transform duration-200"
            style={{ background: "linear-gradient(135deg, var(--green-mid), var(--green-deep))" }}
            aria-hidden="true"
          >
            🌿
          </span>
          <span className="flex flex-col leading-tight">
            <span
              className="text-base font-800 tracking-tight"
              style={{ color: "var(--green-deep)", fontWeight: 800 }}
            >
              EcoBuild AI
            </span>
            <span className="text-xs" style={{ color: "var(--green-muted)", fontWeight: 500 }}>
              Tamil Nadu Construction Costs
            </span>
          </span>
        </Link>

        {/* ── Nav links ── */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "text-white shadow-sm"
                    : "hover:text-[var(--green-deep)]"
                }`}
                style={
                  isActive
                    ? { background: "var(--green-deep)", color: "white" }
                    : { color: "var(--text-body)" }
                }
                aria-current={isActive ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
