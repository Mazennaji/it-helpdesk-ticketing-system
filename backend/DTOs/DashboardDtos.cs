namespace Backend.DTOs
{
    public class DashboardSummaryDto
    {
        public int Open { get; set; }
        public int InProgress { get; set; }
        public int Pending { get; set; }
        public int Resolved { get; set; }
        public int Closed { get; set; }
        public int Critical { get; set; }
        public int TotalOpenQueue { get; set; }
    }

    public class VolumePointDto
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class BreakdownItemDto
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}