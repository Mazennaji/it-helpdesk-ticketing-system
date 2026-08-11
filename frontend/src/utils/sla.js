const TARGETS = { Critical: 4, High: 8, Medium: 24, Low: 72 };
const DEFAULT_TARGET = 24;
const CLOSED = ["Resolved", "Closed"];

export function targetHoursFor(priority) {
  return TARGETS[priority] ?? DEFAULT_TARGET;
}

export function evaluateSla(ticket) {
  const target = targetHoursFor(ticket.priority);
  const created = new Date(ticket.createdAt);
  const dueAt = new Date(created.getTime() + target * 3600 * 1000);
  const isResolved = CLOSED.includes(ticket.status);

  if (isResolved) {
    const completed = new Date(ticket.resolvedAt || ticket.updatedAt || ticket.createdAt);
    return {
      state: completed <= dueAt ? "Met" : "Missed",
      dueAt,
      targetHours: target,
      hoursRemaining: 0,
      isResolved: true,
    };
  }

  const remaining = (dueAt.getTime() - Date.now()) / (3600 * 1000);
  let state;
  if (remaining <= 0) state = "Breached";
  else if (remaining <= target * 0.25) state = "DueSoon";
  else state = "OnTrack";

  return {
    state,
    dueAt,
    targetHours: target,
    hoursRemaining: Math.round(remaining * 10) / 10,
    isResolved: false,
  };
}

export function formatRemaining(hours) {
  if (hours <= 0) return "overdue";
  if (hours < 1) return `${Math.round(hours * 60)}m left`;
  if (hours < 24) return `${Math.round(hours)}h left`;
  return `${Math.round(hours / 24)}d left`;
}

export const SLA_STYLES = {
  Breached: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Breached" },
  DueSoon: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B", label: "Due soon" },
  OnTrack: { bg: "#ECFDF5", text: "#047857", dot: "#10B981", label: "On track" },
  Met: { bg: "#F1F5F9", text: "#475569", dot: "#94A3B8", label: "Met" },
  Missed: { bg: "#FEE2E2", text: "#B91C1C", dot: "#EF4444", label: "Missed" },
};