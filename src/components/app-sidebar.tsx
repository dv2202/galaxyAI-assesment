"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BookOpen,
  CircleDot,
  Gift,
  Grid2x2,
  ImageIcon,
  Layers3,
  LifeBuoy,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  Star,
  Video,
  Zap,
} from "lucide-react";

const primaryItems = [
  { label: "All Tools", icon: Grid2x2, badge: "5933", href: "/dashboard" },
  { label: "Platform", icon: Layers3, href: "/dashboard" },
  { label: "API Docs", icon: BookOpen, href: "/dashboard" },
  { label: "Free Credits", icon: Star, href: "/dashboard" },
  { label: "Become an Affiliate", icon: Gift, href: "/dashboard" },
  { label: "Feature Requests", icon: LifeBuoy, href: "/dashboard" },
];

const unfairAdvantageItems = [
  { label: "Prompt Library", icon: BookOpen, href: "/dashboard" },
  { label: "Learn with Galaxy", icon: Zap, href: "/dashboard" },
  { label: "Ad Library", icon: Star, href: "/dashboard" },
];

const historyItems = [
  { label: "Image Library", icon: ImageIcon, href: "/dashboard" },
  { label: "Video Library", icon: Video, href: "/dashboard", disabled: true },
];

function SidebarLink({
  href,
  label,
  badge,
  icon: Icon,
  active,
  disabled,
}: {
  href: string;
  label: string;
  badge?: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
}) {
  const baseClass = active
    ? "border-[#d8d5cb] bg-white text-[#171717] shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
    : "border-transparent text-[#5f5a53] hover:border-[#e7e2d8] hover:bg-white/80";
  const disabledClass = disabled ? "opacity-45 pointer-events-none" : "";

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl border px-3 py-3 transition-all ${baseClass} ${disabledClass}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden text-[15px] font-medium sm:block">{label}</span>
      {badge ? (
        <span className="ml-auto hidden rounded-full bg-[#f3e8ff] px-2 py-1 text-xs font-semibold text-[#7c3aed] sm:block">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/workflow/");

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[88px] flex-col border-r border-[#ddd8cd] bg-[#f6f4ef] sm:w-[290px]">
      <div className="flex items-center justify-between px-4 py-5 sm:px-5">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-[#111111] text-white shadow-[0_12px_24px_rgba(17,17,17,0.22)]"
          aria-label="Go to dashboard"
        >
          <CircleDot className="h-6 w-6" />
        </button>
        <button
          type="button"
          className="hidden rounded-xl border border-[#ddd8cd] bg-white p-2 text-[#8a8479] shadow-[0_8px_20px_rgba(15,23,42,0.06)] sm:block"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <div className="px-2 pb-4 sm:px-3">
        <div className="flex items-center gap-2 rounded-2xl border border-[#ddd8cd] bg-white px-3 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
          <Search className="h-4 w-4 text-[#a29c91]" />
          <span className="hidden flex-1 text-left text-[15px] text-[#a29c91] sm:block">
            Quick search...
          </span>
          <span className="hidden text-xs font-semibold text-[#c1bbaf] sm:block">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 sm:px-3">
        <div className="space-y-1.5">
          {primaryItems.map((item) => (
            <SidebarLink
              key={item.label}
              href={item.href}
              label={item.label}
              badge={item.badge}
              icon={item.icon}
              active={item.label === "All Tools" ? dashboardActive : false}
            />
          ))}
        </div>

        <div className="mt-8">
          <p className="hidden px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a29c91] sm:block">
            Unfair Advantage
          </p>
          <div className="mt-3 space-y-1.5">
            {unfairAdvantageItems.map((item) => (
              <SidebarLink
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <p className="hidden px-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#a29c91] sm:block">
            Generation History
          </p>
          <div className="mt-3 space-y-1.5">
            {historyItems.map((item) => (
              <SidebarLink
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                disabled={item.disabled}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[#ddd8cd] px-2 py-4 sm:px-3">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#9827ff)] px-4 py-4 text-sm font-semibold text-white shadow-[0_20px_32px_rgba(124,58,237,0.35)]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:block">Claim Offer</span>
        </button>

        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ddd8cd] bg-white px-4 py-3 text-sm font-medium text-[#57524b] shadow-[0_10px_20px_rgba(15,23,42,0.05)]"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:block">Settings</span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl px-2 py-2 sm:justify-start">
          <UserButton />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#171717]">Account</p>
            <p className="text-xs text-[#8e887d]">Workspace access</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
