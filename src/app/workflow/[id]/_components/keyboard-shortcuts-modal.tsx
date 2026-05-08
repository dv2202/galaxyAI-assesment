"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-[10px] border border-[#e3e7ee] bg-white px-2 text-[11px] font-semibold text-[#4b5563] shadow-[0_1px_2px_rgba(17,24,39,0.06)]">
      {children}
    </kbd>
  );
}

function ShortcutKeys({ keys }: { keys: ReactNode[] }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center gap-1.5">
          {index > 0 ? (
            <span className="text-[10px] font-semibold text-[#9ca3af]">
              +
            </span>
          ) : null}
          {key}
        </div>
      ))}
    </div>
  );
}

function Row({
  label,
  keys,
  description,
}: {
  label: string;
  keys: ReactNode[];
  description?: string;
}) {
  return (
    <div className="grid gap-3 rounded-[18px] border border-[#e9edf3] bg-white px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#182230]">{label}</p>
        {description ? (
          <p className="mt-0.5 text-xs text-[#6b7280]">{description}</p>
        ) : null}
      </div>
      <ShortcutKeys keys={keys} />
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[#e7e8ec] bg-[#f8fafc] p-3.5">
      <div className="mb-3 px-1">
        <h3 className="text-sm font-semibold text-[#182230]">{title}</h3>
        <p className="mt-0.5 text-xs text-[#6b7280]">{subtitle}</p>
      </div>
      <div className="space-y-2.5">{children}</div>
    </section>
  );
}

export function KeyboardShortcutsModal({
  open,
  onClose,
}: KeyboardShortcutsModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex h-[min(720px,calc(100vh-32px))] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-[#e7e8ec] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.16)]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="keyboard-shortcuts-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e9edf3] px-5 py-5 sm:px-6">
          <div>
            <span className="inline-flex rounded-full border border-[#e3e7ee] bg-[#f8fafc] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6b7280]">
              Canvas Help
            </span>
            <h2
              id="keyboard-shortcuts-title"
              className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#182230]"
            >
              Keyboard Shortcuts
            </h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-[#6b7280]">
              A quick reference for moving faster around the workflow canvas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close keyboard shortcuts"
            className="rounded-xl border border-transparent p-2 text-[#6b7280] transition hover:border-[#e3e7ee] hover:bg-[#f8fafc] hover:text-[#182230]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="grid gap-4">
            <Section
              title="General"
              subtitle="Viewport movement, selection, and layout controls."
            >
              <Row
                label="Undo"
                description="Step back one change on the canvas."
                keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="z">Z</Kbd>]}
              />
              <Row
                label="Redo"
                description="Restore the last undone action."
                keys={[
                  <Kbd key="m">&#8984;</Kbd>,
                  <Kbd key="s">Shift</Kbd>,
                  <Kbd key="z">Z</Kbd>,
                ]}
              />
              <Row
                label="Select all"
                description="Highlight every node in the current workflow."
                keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="a">A</Kbd>]}
              />
              <Row
                label="Deselect all"
                description="Clear the current node selection."
                keys={[<Kbd key="e">Esc</Kbd>]}
              />
              <Row
                label="Pan canvas"
                description="Hold the canvas and drag your view."
                keys={[<Kbd key="sp">Space</Kbd>, <Kbd key="d">Drag</Kbd>]}
              />
              <Row
                label="Zoom in"
                description="Increase canvas zoom."
                keys={[<Kbd key="p">+</Kbd>]}
              />
              <Row
                label="Zoom out"
                description="Decrease canvas zoom."
                keys={[<Kbd key="mi">&minus;</Kbd>]}
              />
              <Row
                label="Fit view"
                description="Center and frame the current graph."
                keys={[<Kbd key="f">F</Kbd>]}
              />
              <Row
                label="Toggle select mode"
                description="Switch between panning and selection mode."
                keys={[<Kbd key="s">S</Kbd>]}
              />
              <Row
                label="Auto-arrange"
                description="Reflow the workflow into a clean left-to-right layout."
                keys={[<Kbd key="sh">Shift</Kbd>, <Kbd key="a">A</Kbd>]}
              />
            </Section>

            <Section
              title="Node Operations"
              subtitle="The main actions available for selected nodes."
            >
              <Row
                label="Copy"
                description="Store the selected nodes in memory."
                keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="c">C</Kbd>]}
              />
              <Row
                label="Paste"
                description="Insert copied nodes with a small offset."
                keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="v">V</Kbd>]}
              />
              <Row
                label="Duplicate"
                description="Clone the selected nodes in place."
                keys={[<Kbd key="m">&#8984;</Kbd>, <Kbd key="d">D</Kbd>]}
              />
              <Row
                label="Delete"
                description="Remove the selected nodes when allowed."
                keys={[<Kbd key="del">Delete</Kbd>]}
              />
            </Section>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#e9edf3] px-5 py-4 text-xs text-[#6b7280] sm:px-6">
          <span>Use `Esc` anytime to close this sheet or clear selection.</span>
          <span className="hidden font-medium text-[#4b5563] sm:inline">
            Mac and Windows modifiers are both supported.
          </span>
        </div>
      </div>
    </div>
  );
}
