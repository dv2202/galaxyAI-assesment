"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  AudioLines,
  BookOpen,
  CircleDot,
  Gift,
  Grid2x2,
  ImageIcon,
  Layers3,
  LifeBuoy,
  Search,
  Settings,
  SquareLibrary,
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

const historyItems: Array<{
  label: string;
  icon: ComponentType<{ className?: string }>;
  href: string;
  disabled?: boolean;
}> = [
  { label: "Image Library", icon: ImageIcon, href: "/dashboard" },
  { label: "Video Library", icon: Video, href: "/dashboard" },
  { label: "Audio Library", icon: AudioLines, href: "/dashboard" },
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
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${baseClass} ${disabledClass}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden text-[14px] font-medium sm:block">{label}</span>
      {badge ? (
        <span className="ml-auto hidden rounded-full bg-[#f3e8ff] px-2 py-0.5 text-[11px] font-semibold text-[#7c3aed] sm:block">
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[88px] flex-col border-r border-[#e8e8e8] bg-[#fbfbfb] sm:w-[300px]">
      <div className="flex items-center justify-between px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-white"
          aria-label="Go to dashboard"
        >
          <CircleDot className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="hidden rounded-xl p-2 text-[#5f6368] sm:block"
          aria-label="Collapse sidebar"
        >
          <SquareLibrary className="h-5 w-5" />
        </button>
      </div>

      <div className="px-2 pb-4 sm:px-3">
        <div className="flex items-center gap-2 rounded-[18px] border border-[#e5e7eb] bg-white px-4 py-2.5 shadow-[0_6px_18px_rgba(17,24,39,0.08)]">
          <Search className="h-4 w-4 text-[#b0b4bb]" />
          <span className="hidden flex-1 text-left text-[14px] text-[#8d929a] sm:block">
            Quick search...
          </span>
          <span className="hidden text-xs font-semibold text-[#c1c5cb] sm:block">
            ⌘K
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 sm:px-3">
        <div className="space-y-1">
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

        <div className="mt-10">
          <div className="hidden items-center justify-between px-3 sm:flex">
            <p className="text-[13px] font-semibold text-[#a5a7ac]">
              Unfair Advantage
            </p>
            <span className="text-[#a5a7ac]">⌃</span>
          </div>
          <div className="mt-3 space-y-1">
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

        <div className="mt-10">
          <div className="hidden items-center justify-between px-3 sm:flex">
            <p className="text-[13px] font-semibold text-[#a5a7ac]">
              Generation History
            </p>
            <span className="text-[#a5a7ac]">⌃</span>
          </div>
          <div className="mt-3 space-y-1">
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

        <div className="mt-10">
          <div className="hidden items-center justify-between px-3 sm:flex">
            <p className="text-[13px] font-semibold text-[#c0c3c8]">Favorites</p>
            <span className="text-[#c0c3c8]">⌃</span>
          </div>
          <div className="mt-3 hidden rounded-xl px-3 py-2 text-[15px] text-[#d1d3d7] sm:flex sm:items-center sm:gap-3">
            <BookOpen className="h-4 w-4" />
            Saved Prompts
          </div>
        </div>
      </div>

      <div className="border-t border-[#ececec] px-3 py-4">
        <button
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#d9dce3] bg-white px-4 py-2.5 text-[14px] font-medium text-[#5d6470] shadow-[0_4px_14px_rgba(17,24,39,0.05)]"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:block">Settings</span>
        </button>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,#6158e5,#5c57d6)] px-4 py-3.5 text-[15px] font-semibold text-white shadow-[0_16px_32px_rgba(92,87,214,0.28)]"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:block">Claim Offer</span>
        </button>

        <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl border-t border-[#ececec] px-2 pt-5 sm:justify-start">
          <UserButton />
          <div className="hidden sm:block">
            <p className="text-[14px] font-semibold text-[#171717]">
              Devansh Vishwakarma
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
