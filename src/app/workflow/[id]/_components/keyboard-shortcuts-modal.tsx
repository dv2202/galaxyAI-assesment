"use client";

import { X } from "lucide-react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-md border border-[#e0dbd1] bg-[#f6f3ed] px-1.5 text-[11px] font-medium text-[#5a554d]">
      {children}
    </kbd>
  );
}

function Row({ label, keys }: { label: string; keys: React.ReactNode[] }) {
  return (
    <div className="flex items-center justify-between border-b border-[#f0ebe1] py-3 last:border-b-0">
      <span className="text-sm text-[#3a3630]">{label}</span>
      <div className="flex items-center gap-1">{keys}</div>
    </div>
  );
}

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative max-h-[80vh] w-full max-w-md overflow-y-auto rounded-[22px] border border-[#e0dbd1] bg-white p-6 shadow-[0_24px_80px_rgba(15,23,42,0.15)]">
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#171717]">
              Keyboard Shortcuts
            </h2>
            <p className="mt-0.5 text-sm text-[#8d867a]">
              Quickly navigate and create with these shortcuts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 transition-colors hover:bg-[#f3efe7]"
          >
            <X className="h-4 w-4 text-[#7d766c]" />
          </button>
        </div>

        <div className="mt-4">
          <h3 className="mb-1 text-sm font-semibold text-[#171717]">General</h3>
          <Row label="Undo" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="z">Z</Kbd>]} />
          <Row label="Redo" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="s">Shift</Kbd>, <Kbd key="z">Z</Kbd>]} />
          <Row label="Select all" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="a">A</Kbd>]} />
          <Row label="Deselect all" keys={[<Kbd key="e">Esc</Kbd>]} />
          <Row label="Pan canvas" keys={[<Kbd key="sp">Space</Kbd>, <Kbd key="d">Drag</Kbd>]} />
          <Row label="Zoom in" keys={[<Kbd key="p">+</Kbd>]} />
          <Row label="Zoom out" keys={[<Kbd key="mi">&minus;</Kbd>]} />
          <Row label="Fit view" keys={[<Kbd key="f">F</Kbd>]} />
          <Row label="Toggle select mode" keys={[<Kbd key="s">S</Kbd>]} />
          <Row label="Auto-arrange" keys={[<Kbd key="sh">Shift</Kbd>, <Kbd key="a">A</Kbd>]} />
        </div>

        <div className="mt-5">
          <h3 className="mb-1 text-sm font-semibold text-[#171717]">
            Node Operations
          </h3>
          <Row label="Copy" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="c">C</Kbd>]} />
          <Row label="Paste" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="v">V</Kbd>]} />
          <Row label="Duplicate" keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="d">D</Kbd>]} />
          <Row label="Delete" keys={[<Kbd key="del">Delete</Kbd>]} />
        </div>
      </div>
    </div>
  );
}
