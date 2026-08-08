namespace Backend.DTOs
{
    public class AttachmentResponseDto
    {
        public int AttachmentId { get; set; }
        public int TicketId { get; set; }
        public string FileName { get; set; } = string.Empty;
        public int FileSizeKb { get; set; }
        public string UploadedByName { get; set; } = string.Empty;
        public DateTime UploadedAt { get; set; }
    }
}