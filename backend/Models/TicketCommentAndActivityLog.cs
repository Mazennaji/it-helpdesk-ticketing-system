using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class TicketComment
    {
        public int CommentId { get; set; }

        public int TicketId { get; set; }
        [ForeignKey(nameof(TicketId))]
        public Ticket? Ticket { get; set; }

        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        [Required]
        public string CommentText { get; set; } = string.Empty;

        public bool IsInternal { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class ActivityLog
    {
        public int LogId { get; set; }

        public int UserId { get; set; }
        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        public int? TicketId { get; set; }
        [ForeignKey(nameof(TicketId))]
        public Ticket? Ticket { get; set; }

        [Required, StringLength(255)]
        public string Action { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}