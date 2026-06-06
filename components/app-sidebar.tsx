"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, Home, PlusCircle, Settings, WalletCards } from "lucide-react";

import { Brand } from "@/components/brand";

const links = [
  { href: "/app", label: "Dashboard", icon: Home },
  { href: "/app/projects/new", label: "New project", icon: PlusCircle },
  { href: "/app/billing", label: "Billing", icon: WalletCards },
  { href: "/app/settings", label: "Settings", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Brand />
      <div className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;

          return (
            <Link className={`sidebar-link ${active ? "active" : ""}`} href={link.href} key={link.href}>
              <span style={{ alignItems: "center", display: "inline-flex", gap: 10 }}>
                <Icon size={17} />
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="notice" style={{ marginTop: 28 }}>
        <FolderKanban size={16} /> Log in to save projects in Supabase. If you continue without a session,
        Meridian uses local demo storage.
      </div>
    </aside>
  );
}
