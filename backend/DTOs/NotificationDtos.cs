namespace Backend.DTOs
{
    public class NotificationResponseDto
    {
        public int NotificationId { get; set; }
        public int? TicketId { get; set; }
        public string? TicketReferenceNo { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}