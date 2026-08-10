using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class KnowledgeArticle
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(100)]
        public string Category { get; set; } = "General";

        [MaxLength(500)]
        public string Summary { get; set; } = string.Empty;

        public string Body { get; set; } = string.Empty;

        public bool IsPublished { get; set; } = true;

        public string? AuthorId { get; set; }
        public ApplicationUser? Author { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}