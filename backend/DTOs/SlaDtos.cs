namespace Backend.DTOs
{
    public class SlaDto
    {
        public string DueAt { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public double HoursRemaining { get; set; }
        public int TargetHours { get; set; }
    }

    public class SlaSummaryDto
    {
        public int Breached { get; set; }
        public int DueSoon { get; set; }
        public int OnTrack { get; set; }
        public int MetThisPeriod { get; set; }
        public int MissedThisPeriod { get; set; }
        public double CompliancePercent { get; set; }
    }
}