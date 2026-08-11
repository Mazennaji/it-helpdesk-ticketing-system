using Backend.Models;

namespace Backend.Services
{
    public enum SlaState
    {
        OnTrack,
        DueSoon,
        Breached,
        Met,
        Missed
    }

    public class SlaInfo
    {
        public DateTime DueAt { get; set; }
        public SlaState State { get; set; }
        public double HoursRemaining { get; set; }
        public int TargetHours { get; set; }
        public bool IsResolved { get; set; }
    }

    public interface ISlaService
    {
        SlaInfo Evaluate(Ticket ticket);
        int TargetHoursFor(string? priorityName);
    }

    public class SlaService : ISlaService
    {
        private static readonly Dictionary<string, int> TargetsByPriority = new(StringComparer.OrdinalIgnoreCase)
        {
            ["Critical"] = 4,
            ["High"] = 8,
            ["Medium"] = 24,
            ["Low"] = 72,
        };

        private const int DefaultTargetHours = 24;

        private static readonly string[] ClosedStatuses = { "Resolved", "Closed" };

        public int TargetHoursFor(string? priorityName)
        {
            if (priorityName != null && TargetsByPriority.TryGetValue(priorityName, out var h))
                return h;
            return DefaultTargetHours;
        }

        public SlaInfo Evaluate(Ticket ticket)
        {
            var target = TargetHoursFor(ticket.Priority?.Name);
            var dueAt = ticket.CreatedAt.AddHours(target);
            var statusName = ticket.Status?.Name;
            var isResolved = statusName != null && ClosedStatuses.Contains(statusName, StringComparer.OrdinalIgnoreCase);

            var info = new SlaInfo
            {
                DueAt = dueAt,
                TargetHours = target,
                IsResolved = isResolved,
            };

            if (isResolved)
            {
                var completedAt = ticket.ResolvedAt ?? ticket.UpdatedAt;
                info.State = completedAt <= dueAt ? SlaState.Met : SlaState.Missed;
                info.HoursRemaining = 0;
                return info;
            }

            var remaining = (dueAt - DateTime.UtcNow).TotalHours;
            info.HoursRemaining = Math.Round(remaining, 1);

            if (remaining <= 0)
                info.State = SlaState.Breached;
            else if (remaining <= target * 0.25)
                info.State = SlaState.DueSoon;
            else
                info.State = SlaState.OnTrack;

            return info;
        }
    }
}