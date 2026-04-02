"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  PanelLeftClose, 
  PanelLeftOpen, 
  LayoutGrid, 
  Search, 
  TrendingUp, 
  User 
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: <LayoutGrid size={20} />, href: "/dashboard" },
  { name: "SIP analytics", icon: <TrendingUp size={20} />, href: "/sips" },
  { name: "Fund search", icon: <Search size={20} />, href: "/search" },
];

export default function Sidebar({ expanded, setExpanded }: { expanded: boolean; setExpanded: (expanded: boolean) => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`hidden h-screen flex-col justify-between rounded-3xl border-2 border-[color:var(--accent)] bg-[color:var(--surface)] p-4 shadow-sm transition-all duration-300 ease-in-out lg:flex ${
        expanded ? "w-64" : "w-20"
      }`}
    >
      <div>
        <div className={`flex items-center pb-6 ${expanded ? "justify-between" : "justify-center"}`}>
          <Link href="/">
            <h2
              className={`overflow-hidden text-xl font-bold text-primary transition-all duration-300 hover:text-[color:var(--accent)] ${
                expanded ? "w-32 opacity-100" : "w-0 opacity-0"
              }`}
            >
              RootWealth
            </h2>
          </Link>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center rounded-lg p-2 text-muted transition-colors hover:bg-[color:var(--card)] hover:text-primary focus:outline-none"
            aria-label={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {expanded ? <PanelLeftClose size={22} /> : <PanelLeftOpen size={22} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                pathname === item.href
                  ? "bg-[color:var(--accent)] text-adaptive-accent" 
                  : "text-muted hover:bg-[color:var(--card)] hover:text-primary"
              } ${expanded ? "justify-start" : "justify-center"}`}
              >
              <span className="flex items-center justify-center">{item.icon}</span>
              <span className={`transition-all duration-300 ${expanded ? "block opacity-100" : "hidden opacity-0"}`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-[color:var(--surface)] pt-4">
        {/* Comment safely placed outside the tag */}
        <Link
          href="/login"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/login"
              ? "bg-[color:var(--accent)] text-adaptive-accent"
              : "text-muted hover:bg-[color:var(--card)] hover:text-primary"
          } ${expanded ? "justify-start" : "justify-center"}`}
        >
          <span className="flex items-center justify-center"><User size={20} /></span>
          <span className={`transition-all duration-300 ${expanded ? "block opacity-100" : "hidden opacity-0"}`}>
            Log Out
          </span>
        </Link>
      </div>
    </aside>
  );
}