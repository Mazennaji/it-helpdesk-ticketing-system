using Backend.Data;
using Backend.Models;

namespace Backend.Helpers
{
    public interface IActivityLogService
    {
        Task LogAsync(int userId, int? ticketId, string action);
    }

    public class ActivityLogService : IActivityLogService
    {
        private readonly ApplicationDbContext _db;

        public ActivityLogService(ApplicationDbContext db)
        {
            _db = db;
        }

        public async Task LogAsync(int userId, int? ticketId, string action)
        {
            _db.ActivityLogs.Add(new ActivityLog
            {
                UserId = userId,
                TicketId = ticketId,
                Action = action,
                CreatedAt = DateTime.UtcNow,
            });
            await _db.SaveChangesAsync();
        }
    }
}