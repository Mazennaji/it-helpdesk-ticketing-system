using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Backend.Services;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public interface IEmailSender
    {
        Task SendAsync(string toEmail, string subject, string htmlBody);
    }

    public class ResendEmailSender : IEmailSender
    {
        private readonly HttpClient _http;
        private readonly EmailOptions _options;
        private readonly ILogger<ResendEmailSender> _logger;

        public ResendEmailSender(
            HttpClient http,
            IOptions<EmailOptions> options,
            ILogger<ResendEmailSender> logger)
        {
            _http = http;
            _options = options.Value;
            _logger = logger;

            _http.BaseAddress = new Uri("https://api.resend.com/");
            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                _http.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", _options.ApiKey);
            }
        }

        public async Task SendAsync(string toEmail, string subject, string htmlBody)
        {
            if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.ApiKey))
            {
                _logger.LogInformation("Email disabled or no API key; skipping email to {To}", toEmail);
                return;
            }
            if (string.IsNullOrWhiteSpace(toEmail))
                return;

            var payload = new
            {
                from = _options.FromAddress,
                to = new[] { toEmail },
                subject,
                html = htmlBody,
            };

            var json = JsonSerializer.Serialize(payload);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            try
            {
                var resp = await _http.PostAsync("emails", content);
                if (!resp.IsSuccessStatusCode)
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    _logger.LogWarning("Resend send failed ({Status}) to {To}: {Body}",
                        resp.StatusCode, toEmail, body);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending email to {To}", toEmail);
            }
        }
    }
}