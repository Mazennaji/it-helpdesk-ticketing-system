namespace Backend.Services
{
    public class EmailOptions
    {
        public string ApiKey { get; set; } = string.Empty;
        public string FromAddress { get; set; } = "HelpDesk Pro <onboarding@resend.dev>";
        public bool Enabled { get; set; } = true;
    }
}