using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class TicketAttachment
    {
        [Key]
        public int AttachmentId { get; set; }

        public int TicketId { get; set; }
        [ForeignKey(nameof(TicketId))]
        public Ticket? Ticket { get; set; }

        public int UploadedBy { get; set; }
        [ForeignKey(nameof(UploadedBy))]
        public ApplicationUser? Uploader { get; set; }

        [Required, StringLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required, StringLength(500)]
        public string FilePath { get; set; } = string.Empty;

        public int FileSizeKb { get; set; }

        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    }
}