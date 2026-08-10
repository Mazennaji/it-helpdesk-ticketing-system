namespace Backend.Services
{
    public class OpenAiOptions
    {
        public string ApiKey { get; set; } = string.Empty;

        public string BaseUrl { get; set; } = "https://api.openai.com/v1";

        public string ClassifierModel { get; set; } = "gpt-4.1-nano";

        public string AssistantModel { get; set; } = "gpt-4.1-mini";

        public int MaxOutputTokens { get; set; } = 700;
    }
}