using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Category
    {
        public int CategoryId { get; set; }

        [Required, StringLength(50)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }

    public class Priority
    {
        public int PriorityId { get; set; }

        [Required, StringLength(20)]
        public string Name { get; set; } = string.Empty;

        public int SortOrder { get; set; }

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }

    public class Status
    {
        public int StatusId { get; set; }

        [Required, StringLength(20)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}