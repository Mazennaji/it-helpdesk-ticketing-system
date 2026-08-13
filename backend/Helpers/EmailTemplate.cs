namespace Backend.Helpers
{
    public static class EmailTemplate
    {
        public static string Build(string heading, string message, string? referenceNo, string? ctaUrl)
        {
            var refLine = string.IsNullOrWhiteSpace(referenceNo)
                ? ""
                : $"<p style=\"margin:0 0 8px;color:#64748b;font-size:13px;font-family:monospace;\">Ticket {referenceNo}</p>";

            var cta = string.IsNullOrWhiteSpace(ctaUrl)
                ? ""
                : $@"<a href=""{ctaUrl}"" style=""display:inline-block;margin-top:20px;background:#0B1F3A;color:#ffffff;
                     text-decoration:none;font-size:14px;font-weight:600;padding:11px 22px;border-radius:8px;"">
                     View ticket</a>";

            return $@"<!DOCTYPE html>
<html>
<body style=""margin:0;padding:0;background:#f1f5f9;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#f1f5f9;padding:32px 0;"">
    <tr><td align=""center"">
      <table role=""presentation"" width=""520"" cellpadding=""0"" cellspacing=""0""
             style=""background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;box-shadow:0 8px 30px -12px rgba(0,0,0,0.15);"">
        <tr><td style=""background:#0B1F3A;padding:20px 28px;"">
          <span style=""color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.02em;"">HelpDesk <span style=""color:#3B82F6;"">Pro</span></span>
        </td></tr>
        <tr><td style=""padding:28px;"">
          {refLine}
          <h1 style=""margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:600;"">{heading}</h1>
          <p style=""margin:0;color:#475569;font-size:14px;line-height:1.6;"">{message}</p>
          {cta}
        </td></tr>
        <tr><td style=""padding:18px 28px;border-top:1px solid #e2e8f0;"">
          <p style=""margin:0;color:#94a3b8;font-size:12px;"">
            You're receiving this because email notifications are on for your HelpDesk Pro account.
            You can turn them off in Settings &rarr; Preferences.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>";
        }
    }
}