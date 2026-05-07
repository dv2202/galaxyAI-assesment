export default function WorkflowLoading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#e5e7eb] border-t-[#111]" />
        </div>
        <p className="text-[14px] font-medium text-[#6b7280]">
          Loading workflow…
        </p>
      </div>
    </div>
  );
}
