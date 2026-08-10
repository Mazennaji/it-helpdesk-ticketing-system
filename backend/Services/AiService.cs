using System.Text;
using System.Text.Json;
using Backend.Data;
using Backend.DTOs;
using Backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Services
{
    public interface IAiService
    {
        Task<ClassifySuggestionDto> ClassifyAsync(ClassifyRequestDto request);
        Task<string> DraftReplyAsync(Ticket ticket, string? instruction);
        Task<ChatResponseDto> ChatAsync(List<ChatMessageDto> messages);
    }

    public class AiService : IAiService
    {
        private readonly HttpClient _http;
        private readonly OpenAiOptions _opts;
        private readonly ApplicationDbContext _db;

        private static readonly JsonSerializerOptions JsonOpts =
            new(JsonSerializerDefaults.Web);

        public AiService(
            HttpClient http,
            IOptions<OpenAiOptions> opts,
            ApplicationDbContext db)
        {
            _http = http;
            _opts = opts.Value;
            _db = db;

            _http.BaseAddress = new Uri(_opts.BaseUrl.TrimEnd('/') + "/");
            _http.DefaultRequestHeaders.Authorization =
                new System.Net.Http.Headers.AuthenticationHeaderValue(
                    "Bearer", _opts.ApiKey);
        }

        public async Task<ClassifySuggestionDto> ClassifyAsync(ClassifyRequestDto request)
        {
            var categories = await _db.Categories
                .Select(c => new { c.CategoryId, c.Name })
                .ToListAsync();
            var priorities = await _db.Priorities
                .OrderBy(p => p.SortOrder)
                .Select(p => new { p.PriorityId, p.Name })
                .ToListAsync();

            var catNames = string.Join(", ", categories.Select(c => c.Name));
            var priNames = string.Join(", ", priorities.Select(p => p.Name));

            var system =
                "You are a triage assistant for an IT help desk. " +
                "Read the ticket and choose the single best category and priority. " +
                "You MUST pick category from exactly this list: " + catNames + ". " +
                "You MUST pick priority from exactly this list: " + priNames + ". " +
                "Judge priority by business impact and urgency: outages or security " +
                "issues affecting many users are Critical; single-user blockers are High; " +
                "routine requests are Low or Medium. " +
                "Respond ONLY with compact JSON, no markdown, of the form: " +
                "{\"category\":\"...\",\"priority\":\"...\",\"confidence\":0.0,\"reasoning\":\"one short sentence\"}";

            var userText =
                (string.IsNullOrWhiteSpace(request.Title) ? "" : $"Title: {request.Title}\n") +
                $"Description: {request.Description}";

            var raw = await CompleteAsync(
                _opts.ClassifierModel, system, userText, forceJson: true);

            var suggestion = SafeParseClassification(raw);

            var cat = categories.FirstOrDefault(c =>
                string.Equals(c.Name, suggestion.Category, StringComparison.OrdinalIgnoreCase));
            var pri = priorities.FirstOrDefault(p =>
                string.Equals(p.Name, suggestion.Priority, StringComparison.OrdinalIgnoreCase));

            suggestion.Category = cat?.Name;
            suggestion.CategoryId = cat?.CategoryId;
            suggestion.Priority = pri?.Name;
            suggestion.PriorityId = pri?.PriorityId;
            return suggestion;
        }

        public async Task<string> DraftReplyAsync(Ticket ticket, string? instruction)
        {
            var system =
                "You are an experienced IT support agent drafting a reply to an end user. " +
                "Be clear, friendly, and concrete. Give numbered troubleshooting steps " +
                "when appropriate. Ask for specific missing details if needed. " +
                "Do not invent account-specific facts. Keep it concise and professional. " +
                "Write only the reply body, ready to send.";

            var sb = new StringBuilder();
            sb.AppendLine($"Ticket subject: {ticket.Title}");
            sb.AppendLine($"Description: {ticket.Description}");
            if (!string.IsNullOrWhiteSpace(instruction))
                sb.AppendLine($"Agent instruction for this draft: {instruction}");

            return await CompleteAsync(
                _opts.AssistantModel, system, sb.ToString(), forceJson: false);
        }

        public async Task<ChatResponseDto> ChatAsync(List<ChatMessageDto> messages)
        {
            var system =
                "You are a friendly IT self-service assistant for employees. " +
                "Help them resolve common issues (password resets, VPN, email, " +
                "printers, software installs) with simple step-by-step guidance. " +
                "If the problem needs a technician, hardware repair, or elevated access, " +
                "tell them to open a ticket and end your reply with the exact token " +
                "[SUGGEST_TICKET] on its own line. Never ask for passwords.";

            var apiMessages = new List<object>
            {
                new { role = "system", content = system }
            };
            foreach (var m in messages)
            {
                var role = m.Role == "assistant" ? "assistant" : "user";
                apiMessages.Add(new { role, content = m.Content });
            }

            var raw = await SendChatAsync(_opts.AssistantModel, apiMessages, forceJson: false);

            var suggests = raw.Contains("[SUGGEST_TICKET]", StringComparison.OrdinalIgnoreCase);
            var clean = raw.Replace("[SUGGEST_TICKET]", "").Trim();

            return new ChatResponseDto { Reply = clean, SuggestsTicket = suggests };
        }

        private Task<string> CompleteAsync(
            string model, string system, string user, bool forceJson)
        {
            var messages = new List<object>
            {
                new { role = "system", content = system },
                new { role = "user", content = user },
            };
            return SendChatAsync(model, messages, forceJson);
        }

        private async Task<string> SendChatAsync(
            string model, List<object> messages, bool forceJson)
        {
            var payload = new Dictionary<string, object?>
            {
                ["model"] = model,
                ["messages"] = messages,
                ["max_tokens"] = _opts.MaxOutputTokens,
                ["temperature"] = 0.3,
            };
            if (forceJson)
                payload["response_format"] = new { type = "json_object" };

            var body = new StringContent(
                JsonSerializer.Serialize(payload, JsonOpts),
                Encoding.UTF8, "application/json");

            using var resp = await _http.PostAsync("chat/completions", body);
            var json = await resp.Content.ReadAsStringAsync();

            if (!resp.IsSuccessStatusCode)
                throw new HttpRequestException(
                    $"OpenAI request failed ({(int)resp.StatusCode}): {json}");

            using var doc = JsonDocument.Parse(json);
            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            return content?.Trim() ?? string.Empty;
        }

        private static ClassifySuggestionDto SafeParseClassification(string raw)
        {
            try
            {
                var cleaned = raw.Trim();
                if (cleaned.StartsWith("```"))
                    cleaned = cleaned.Trim('`').Replace("json", "", StringComparison.OrdinalIgnoreCase).Trim();

                using var doc = JsonDocument.Parse(cleaned);
                var root = doc.RootElement;
                return new ClassifySuggestionDto
                {
                    Category = root.TryGetProperty("category", out var c) ? c.GetString() : null,
                    Priority = root.TryGetProperty("priority", out var p) ? p.GetString() : null,
                    Confidence = root.TryGetProperty("confidence", out var conf)
                        && conf.TryGetDouble(out var cd) ? cd : 0.0,
                    Reasoning = root.TryGetProperty("reasoning", out var r) ? r.GetString() : null,
                };
            }
            catch
            {
                return new ClassifySuggestionDto { Confidence = 0.0 };
            }
        }
    }
}