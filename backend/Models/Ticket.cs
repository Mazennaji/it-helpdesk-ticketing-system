using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Ticket
    {
        public int TicketId { get; set; }

        [Required, StringLength(20)]
        public string ReferenceNo { get; set; } = string.Empty;

        [Required, StringLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CategoryId { get; set; }
        [ForeignKey(nameof(CategoryId))]
        public Category? Category { get; set; }

        public int PriorityId { get; set; }
        [ForeignKey(nameof(PriorityId))]
        public Priority? Priority { get; set; }

        public int StatusId { get; set; }
        [ForeignKey(nameof(StatusId))]
        public Status? Status { get; set; }

        public int CreatedBy { get; set; }
        [ForeignKey(nameof(CreatedBy))]
        public ApplicationUser? Creator { get; set; }

        public int? AssignedTo { get; set; }
        [ForeignKey(nameof(AssignedTo))]
        public ApplicationUser? Assignee { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }
    }
}