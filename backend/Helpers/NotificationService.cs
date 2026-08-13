using Backend.Data;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Helpers
{
    public interface INotificationService
    {
        Task NotifyAsync(int userId, int? ticketId, string message);
    }

    public class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _db;
        private readonly IHubContext<NotificationHub> _hub;
        private readonly IEmailSender _email;
        private readonly string _appBaseUrl;

        public NotificationService(
            ApplicationDbContext db,
            IHubContext<NotificationHub> hub,
            IEmailSender email,
            IOptions<EmailOptions> emailOptions,
            IConfiguration config)
        {
            _db = db;
            _hub = hub;
            _email = email;
            _appBaseUrl = (config["App:FrontendBaseUrl"] ?? "").TrimEnd('/');
        }

        public async Task NotifyAsync(int userId, int? ticketId, string message)
        {
            var user = await _db.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.InAppNotifications, u.EmailNotifications, u.Email, u.FullName })
                .FirstOrDefaultAsync();

            string? referenceNo = null;
            if (ticketId.HasValue)
            {
                var ticket = await _db.Tickets.FindAsync(ticketId.Value);
                referenceNo = ticket?.ReferenceNo;
            }

            if (user == null || user.InAppNotifications)
            {
                var notification = new Notification
                {
                    UserId = userId,
                    TicketId = ticketId,
                    Message = message,
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow,
                };
                _db.Notifications.Add(notification);
                await _db.SaveChangesAsync();

                var dto = new NotificationResponseDto
                {
                    NotificationId = notification.NotificationId,
                    TicketId = notification.TicketId,
                    TicketReferenceNo = referenceNo,
                    Message = notification.Message,
                    IsRead = notification.IsRead,
                    CreatedAt = notification.CreatedAt,
                };
                await _hub.Clients.Group($"user-{userId}").SendAsync("ReceiveNotification", dto);
            }

            if (user != null && user.EmailNotifications && !string.IsNullOrWhiteSpace(user.Email))
            {
                var ctaUrl = ticketId.HasValue && _appBaseUrl.Length > 0
                    ? $"{_appBaseUrl}/tickets/{ticketId.Value}"
                    : null;

                var subject = referenceNo != null
                    ? $"[{referenceNo}] {message}"
                    : message;

                var html = EmailTemplate.Build(
                    heading: message,
                    message: $"Hi {user.FullName},<br/><br/>{message}",
                    referenceNo: referenceNo,
                    ctaUrl: ctaUrl);

                await _email.SendAsync(user.Email, subject, html);
            }
        }
    }
}