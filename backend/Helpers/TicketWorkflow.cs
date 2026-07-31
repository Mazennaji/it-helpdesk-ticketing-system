namespace Backend.Helpers
{
    public static class TicketWorkflow
    {
        private static readonly Dictionary<string, string[]> Transitions = new()
        {
            ["Open"] = new[] { "In Progress", "Closed" },
            ["In Progress"] = new[] { "Pending", "Resolved", "Closed" },
            ["Pending"] = new[] { "In Progress", "Closed" },
            ["Resolved"] = new[] { "Closed", "In Progress" },
            ["Closed"] = new[] { "In Progress" },
        };

        public static bool IsValidTransition(string currentStatusName, string nextStatusName)
        {
            if (currentStatusName == nextStatusName) return true;
            return Transitions.TryGetValue(currentStatusName, out var allowed)
                   && allowed.Contains(nextStatusName);
        }
    }
}