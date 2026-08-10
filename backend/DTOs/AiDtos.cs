using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class ClassifyRequestDto
    {
        [Required]
        public string Description { get; set; } = string.Empty;

        public string? Title { get; set; }
    }

    public class ClassifySuggestionDto
    {
        public string? Category { get; set; }
        public int? CategoryId { get; set; }
        public string? Priority { get; set; }
        public int? PriorityId { get; set; }
        public double Confidence { get; set; }
        public string? Reasoning { get; set; }
    }

    public class DraftReplyRequestDto
    {
        [Required]
        public int TicketId { get; set; }
        public string? Instruction { get; set; }
    }

    public class DraftReplyResponseDto
    {
        public string Reply { get; set; } = string.Empty;
    }

    public class ChatMessageDto
    {
        public string Role { get; set; } = "user";
        public string Content { get; set; } = string.Empty;
    }

    public class ChatRequestDto
    {
        [Required]
        public List<ChatMessageDto> Messages { get; set; } = new();
    }

    public class ChatResponseDto
    {
        public string Reply { get; set; } = string.Empty;
        public bool SuggestsTicket { get; set; }
    }
}