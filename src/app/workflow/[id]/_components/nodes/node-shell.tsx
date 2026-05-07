"use client";

import type { ReactNode } from "react";
import {
  Info,
  LoaderCircle,
  Play,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

type ExecutionStatus =
  | "PENDING"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "SKIPPED"
  | undefined;

export const inputHandleClass =
  "!h-[18px] !w-[18px] !-left-[9px] !border-[3px] !border-white !bg-[#3b82f6] !shadow-[0_0_0_1.5px_rgba(59,130,246,0.25)]";

export const imageInputHandleClass =
  "!h-[18px] !w-[18px] !-left-[9px] !border-[3px] !border-white !bg-[#ec4899] !shadow-[0_0_0_1.5px_rgba(236,72,153,0.25)]";

export const outputHandleClass =
  "!h-[18px] !w-[18px] !-right-[9px] !border-[3px] !border-white !bg-[#3b82f6] !shadow-[0_0_0_1.5px_rgba(59,130,246,0.25)]";

export function getNodeStatusClass(status: ExecutionStatus) {
  if (status === "RUNNING") return "node-executing";
  if (status === "PENDING") return "node-pending";
  if (status === "COMPLETED") return "node-completed";
  if (status === "FAILED") return "node-failed";
  return "";
}

export function getNodeStatusTone(status: ExecutionStatus) {
  if (status === "COMPLETED") return "bg-emerald-400";
  if (status === "FAILED") return "bg-rose-400";
  if (status === "SKIPPED") return "bg-slate-400";
  return "bg-amber-400";
}

export function getNodeStatusLabel(status: ExecutionStatus) {
  if (status === "COMPLETED") return "Done";
  if (status === "FAILED") return "Failed";
  if (status === "SKIPPED") return "Skipped";
  if (status === "PENDING") return "Queued";
  if (status === "RUNNING") return "Running";
  return null;
}

function HeaderIconButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e7eaf0] bg-[#f8fafc] text-[#98a2b3] transition hover:border-[#d7dde7] hover:bg-white hover:text-[#475467]"
    >
      {children}
    </button>
  );
}

export function NodeShell({
  title,
  status,
  onRun,
  onDelete,
  isExecuting,
  children,
  actions,
  widthClass = "min-w-[420px]",
}: {
  title: string;
  status: ExecutionStatus;
  onRun?: () => void;
  onDelete?: () => void;
  isExecuting?: boolean;
  children: ReactNode;
  actions?: ReactNode;
  widthClass?: string;
}) {
  return (
    <div
      className={`${widthClass} relative rounded-[20px] border border-[#edf0f5] bg-white shadow-[0_14px_32px_rgba(16,24,40,0.08)] ${getNodeStatusClass(status)}`}
    >
      <div className="flex items-center gap-3 rounded-t-[20px] border-b border-[#edf0f5] bg-white px-7 py-5">
        <p className="min-w-0 flex-1 truncate text-lg font-semibold text-[#101828]">
          {title}
        </p>
        <div className="flex items-center gap-2.5">
          {actions}
          <HeaderIconButton title="Node info">
            <Info className="h-4 w-4" />
          </HeaderIconButton>
          
          {onRun ? (
            <button
              onClick={onRun}
              disabled={isExecuting}
              className={`flex h-10 items-center gap-2 rounded-xl border px-4 text-base font-medium transition disabled:opacity-40 ${
                status === "COMPLETED"
                  ? "border-[#9cddb0] bg-[#dff7e5] text-[#16a34a]"
                  : status === "FAILED"
                    ? "border-[#fca5a5] bg-[#fef2f2] text-[#dc2626]"
                    : status === "RUNNING"
                      ? "border-[#93c5fd] bg-[#eff6ff] text-[#2563eb]"
                      : status === "PENDING"
                        ? "border-[#fcd34d] bg-[#fffbeb] text-[#d97706]"
                        : "border-[#9cddb0] bg-[#dff7e5] text-[#16a34a] hover:bg-[#d3f1db]"
              }`}
              title="Run this node"
            >
              {status === "RUNNING" ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : status === "PENDING" ? (
                <Clock className="h-4 w-4" />
              ) : status === "COMPLETED" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status === "FAILED" ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {status === "RUNNING"
                ? "Running..."
                : status === "PENDING"
                  ? "Pending"
                  : status === "COMPLETED"
                    ? "Done"
                    : status === "FAILED"
                      ? "Failed"
                      : "Run"}
            </button>
          ) : null}
          {onDelete ? (
            <HeaderIconButton onClick={onDelete} title="Delete node">
              <Trash2 className="h-4 w-4" />
            </HeaderIconButton>
          ) : null}
        </div>
      </div>
      <div className="space-y-5 rounded-b-[20px] bg-white p-7">{children}</div>
    </div>
  );
}

export function HeaderAddButton({
  onClick,
  title,
}: {
  onClick?: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e7eaf0] bg-[#f8fafc] text-[#667085] transition hover:border-[#d7dde7] hover:bg-white hover:text-[#101828]"
    >
      <span className="text-lg leading-none">+</span>
    </button>
  );
}

export function SectionDivider() {
  return <div className="border-t border-[#edf0f5]" />;
}

export function SegmentedTabs({
  options,
  value,
  onChange,
}: {
  options: Array<{ label: string; value: string }>;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex rounded-[18px] border border-[#e4e7ec] bg-[#f5f7fa] p-1">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-[14px] px-4 py-3 text-base font-medium transition ${
              isActive
                ? "bg-[#182230] text-white shadow-[0_4px_10px_rgba(16,24,40,0.12)]"
                : "text-[#667085] hover:text-[#344054]"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function InlineSelect({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="nodrag h-12 w-full rounded-xl border border-[#e4e7ec] bg-[#f8fafc] px-4 text-base text-[#101828] outline-none transition focus:border-[#cdd5df]"
    >
      {children}
    </select>
  );
}

export function TextareaInput({
  value,
  onChange,
  placeholder,
  disabled,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`nodrag nowheel w-full resize-none rounded-xl border border-[#e4e7ec] bg-[#f8fafc] px-4 py-3.5 text-base text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#cdd5df] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    />
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`nodrag h-12 w-full rounded-xl border border-[#e4e7ec] bg-[#f8fafc] px-4 text-base text-[#101828] outline-none transition placeholder:text-[#98a2b3] focus:border-[#cdd5df] ${className}`}
    />
  );
}

export function KeyValueRow({
  label,
  children,
  after,
}: {
  label: ReactNode;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[1fr_minmax(0,1.6fr)_40px] items-center gap-3">
      <div className="text-base text-[#475467]">{label}</div>
      <div>{children}</div>
      <div className="flex justify-end">{after}</div>
    </div>
  );
}

export function SideAddButton() {
  return (
    <button className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#e4e7ec] bg-[#f8fafc] text-lg leading-none text-[#98a2b3] transition hover:bg-white hover:text-[#667085]">
      <span>+</span>
    </button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-base font-medium text-[#344054]">{children}</p>
  );
}

export function StatusPill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "connected";
  children: ReactNode;
}) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${
        tone === "connected"
          ? "bg-[#eefaf2] text-[#16a34a]"
          : "bg-[#f5f7fa] text-[#667085]"
      }`}
    >
      {tone === "connected" ? (
        <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
      ) : null}
      {children}
    </div>
  );
}

export function GhostActionButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-1.5 text-[#98a2b3] transition hover:bg-[#f5f7fa] hover:text-[#667085]"
    >
      {children}
    </button>
  );
}

export function FieldLabel({
  children,
  required,
  info,
}: {
  children: ReactNode;
  required?: boolean;
  info?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-base text-[#475467]">
      <label className="font-medium">
        {children}
        {required ? <span className="text-[#ef4444]">*</span> : null}
      </label>
      {info}
    </div>
  );
}

export function FieldBox({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[#e4e7ec] bg-[#f8fafc] px-4 py-3.5 text-base text-[#101828] ${className}`}
    >
      {children}
    </div>
  );
}

export function MiniInfoDot() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d0d5dd] text-xs text-[#98a2b3]">
      i
    </span>
  );
}
