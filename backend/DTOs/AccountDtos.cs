using System.ComponentModel.DataAnnotations;

namespace Backend.DTOs
{
    public class MyProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Department { get; set; }
        public string? PhoneNumber { get; set; }
        public bool EmailNotifications { get; set; }
        public bool InAppNotifications { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class UpdateProfileDto
    {
        [Required]
        [MaxLength(150)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Department { get; set; }

        [Phone]
        [MaxLength(30)]
        public string? PhoneNumber { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdatePreferencesDto
    {
        public bool EmailNotifications { get; set; }
        public bool InAppNotifications { get; set; }
    }
}