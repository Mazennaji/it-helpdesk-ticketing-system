namespace Backend.DTOs
{
    public class CreateCommentDto
    {
        public string CommentText { get; set; } = string.Empty;
        public bool IsInternal { get; set; }
    }

    public class CommentResponseDto
    {
        public int CommentId { get; set; }
        public int TicketId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string CommentText { get; set; } = string.Empty;
        public bool IsInternal { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class ActivityLogResponseDto
    {
        public int LogId { get; set; }
        public int? TicketId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class AssignTicketDto
    {
        public int? AgentId { get; set; }
    }

    public class EscalateTicketDto
    {
        public string? Reason { get; set; }
    }
}