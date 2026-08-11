const STAGES = ["Open", "In Progress", "Pending", "Resolved", "Closed"];

const STAGE_COLORS = {
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Pending: "#8B5CF6",
  Resolved: "#10B981",
  Closed: "#64748B",
};

export default function StatusTimeline({ currentStatus }) {
  const currentIndex = STAGES.indexOf(currentStatus);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="flex items-center">
      {STAGES.map((stage, i) => {
        const done = i < safeIndex;
        const active = i === safeIndex;
        const color = STAGE_COLORS[stage];

        return (
          <div key={stage} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors"
                style={
                  done
                    ? { backgroundColor: color, borderColor: color, color: "#fff" }
                    : active
                    ? { backgroundColor: "#fff", borderColor: color, color }
                    : { backgroundColor: "#fff", borderColor: "#CBD5E1", color: "#94A3B8" }
                }
              >
                {done ? "\u2713" : i + 1}
              </div>
              <span
                className={`mt-1.5 text-xs whitespace-nowrap ${
                  done || active ? "font-medium" : "text-slate-400"
                }`}
                style={done || active ? { color: active ? color : "#334155" } : undefined}
              >
                {stage}
              </span>
            </div>
            {i < STAGES.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 -mt-5 rounded-full transition-colors"
                style={{ backgroundColor: i < safeIndex ? STAGE_COLORS[STAGES[i]] : "#E2E8F0" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}