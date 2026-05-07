"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
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
  collapsed,
}: {
  href: string;
  label: string;
  badge?: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  disabled?: boolean;
  collapsed?: boolean;
}) {
  const baseClass = active
    ? "border-[#d8d5cb] bg-white text-[#171717] shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
    : "border-transparent text-[#5f5a53] hover:border-[#e7e2d8] hover:bg-white/80";
  const disabledClass = disabled ? "opacity-45 pointer-events-none" : "";

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg border px-2.5 py-2 transition-all ${collapsed ? "justify-center" : ""} ${baseClass} ${disabledClass}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className={`${collapsed ? "hidden" : "hidden sm:block"} text-[13px] font-medium`}>
        {label}
      </span>
      {badge ? (
        <span className={`${collapsed ? "hidden" : "hidden sm:block"} ml-auto rounded-full bg-[#f3e8ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#7c3aed]`}>
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  console.log("user", user);
  const dashboardActive =
    pathname === "/dashboard" || pathname.startsWith("/workflow/");

  return (
    <>
      {collapsed ? (
        <button
          type="button"
          onClick={onToggleCollapse}
          className="fixed left-3 top-3 z-50 hidden h-9 w-9 items-center justify-center rounded-xl border border-[#e5e7eb] bg-white text-[#5d6470] shadow-sm transition hover:bg-[#fafafa] hover:text-[#111] sm:flex"
          aria-label="Expand sidebar"
        >
          <SquareLibrary className="h-4 w-4" />
        </button>
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[#e8e8e8] bg-[#fbfbfb] transition-[width,opacity] duration-300 ${
          collapsed
            ? "w-0 overflow-hidden border-r-0 opacity-0"
            : "w-[88px] opacity-100 sm:w-[256px]"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111] text-white"
          aria-label="Go to dashboard"
        >
          <CircleDot className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-[#5f6368] sm:block"
          aria-label="Collapse sidebar"
        >
          <SquareLibrary className="h-4 w-4" />
        </button>
        </div>

        <div className="px-2 pb-3 sm:px-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm">
          <Search className="h-3.5 w-3.5 text-[#b0b4bb]" />
            <span className="hidden flex-1 text-left text-[13px] text-[#8d929a] sm:block">
            Quick search...
            </span>
            <span className="hidden text-[11px] font-semibold text-[#c1c5cb] sm:block">
            ⌘K
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3 sm:px-3">
          <div className="space-y-0.5">
            {primaryItems.map((item) => (
              <SidebarLink
                key={item.label}
                href={item.href}
                label={item.label}
                badge={item.badge}
                icon={item.icon}
                active={item.label === "All Tools" ? dashboardActive : false}
                collapsed={collapsed}
              />
            ))}
          </div>

          <div className="mt-7">
            <div className="hidden items-center justify-between px-2.5 sm:flex">
              <p className="text-[12px] font-semibold text-[#a5a7ac]">
                Unfair Advantage
              </p>
              <span className="text-sm text-[#a5a7ac]">⌃</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {unfairAdvantageItems.map((item) => (
                <SidebarLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="hidden items-center justify-between px-2.5 sm:flex">
              <p className="text-[12px] font-semibold text-[#a5a7ac]">
                Generation History
              </p>
              <span className="text-sm text-[#a5a7ac]">⌃</span>
            </div>
            <div className="mt-2 space-y-0.5">
              {historyItems.map((item) => (
                <SidebarLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  disabled={item.disabled}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="hidden items-center justify-between px-2.5 sm:flex">
              <p className="text-[12px] font-semibold text-[#c0c3c8]">Favorites</p>
              <span className="text-sm text-[#c0c3c8]">⌃</span>
            </div>
            <div className="mt-2 hidden rounded-lg px-2.5 py-1.5 text-[13px] text-[#d1d3d7] sm:flex sm:items-center sm:gap-2.5">
              <BookOpen className="h-3.5 w-3.5" />
              Saved Prompts
            </div>
          </div>
        </div>

        <div className="border-t border-[#ececec] px-3 py-3">
          <button
            type="button"
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#d9dce3] bg-white px-3 py-2 text-[13px] font-medium text-[#5d6470] shadow-sm"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Settings</span>
          </button>

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111] px-3 py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_rgba(17,17,17,0.16)] transition hover:bg-[#222]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:block">Claim Offer</span>
          </button>

          <div className="mt-4 flex items-center justify-center gap-2.5 rounded-xl border-t border-[#ececec] px-2 pt-4 sm:justify-start">
            <UserButton />
            <div className="hidden sm:block">
              <p className="text-[13px] font-semibold text-[#171717]">
                {user?.fullName || user?.firstName || "User"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
