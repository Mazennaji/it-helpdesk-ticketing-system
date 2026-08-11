using Backend.Data;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
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
        public NotificationService(ApplicationDbContext db, IHubContext<NotificationHub> hub)
        {
            _db = db;
            _hub = hub;
        }
        public async Task NotifyAsync(int userId, int? ticketId, string message)
        {
            var prefs = await _db.Users
                .Where(u => u.Id == userId)
                .Select(u => new { u.InAppNotifications, u.EmailNotifications })
                .FirstOrDefaultAsync();

            if (prefs != null && !prefs.InAppNotifications)
                return;

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
            string? referenceNo = null;
            if (ticketId.HasValue)
            {
                var ticket = await _db.Tickets.FindAsync(ticketId.Value);
                referenceNo = ticket?.ReferenceNo;
            }
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
    }
}