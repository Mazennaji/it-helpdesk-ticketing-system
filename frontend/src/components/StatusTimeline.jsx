const STAGES = ["Open", "In Progress", "Resolved", "Closed"];

export default function StatusTimeline({ currentStatus }) {
  const isPending = currentStatus === "Pending";
  const currentIndex = isPending ? 1 : STAGES.indexOf(currentStatus);

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i < currentIndex || (i === currentIndex && !isPending);
        const active = i === currentIndex;
        const showPendingBadge = isPending && i === 1;

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 ${
                  done
                    ? "bg-[#0B1F3A] border-[#0B1F3A] text-white"
                    : active
                    ? "bg-white border-blue-500 text-blue-600"
                    : "bg-white border-slate-300 text-slate-400"
                }`}
              >
                {done ? "\u2713" : i + 1}
              </div>
              <span
                className={`mt-1.5 text-xs whitespace-nowrap ${
                  done || active ? "text-slate-700 font-medium" : "text-slate-400"
                }`}
              >
                {showPendingBadge ? "Pending" : stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 -mt-5 ${
                  i < currentIndex ? "bg-[#0B1F3A]" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}