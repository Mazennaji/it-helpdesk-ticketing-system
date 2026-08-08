using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/notifications")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public NotificationsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<NotificationResponseDto>>> GetAll()
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var notifications = await _db.Notifications
                .Include(n => n.Ticket)
                .Where(n => n.UserId == userId.Value)
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .Select(n => new NotificationResponseDto
                {
                    NotificationId = n.NotificationId,
                    TicketId = n.TicketId,
                    TicketReferenceNo = n.Ticket != null ? n.Ticket.ReferenceNo : null,
                    Message = n.Message,
                    IsRead = n.IsRead,
                    CreatedAt = n.CreatedAt,
                })
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkRead(int id)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var notification = await _db.Notifications.FindAsync(id);
            if (notification == null || notification.UserId != userId.Value) return NotFound();

            notification.IsRead = true;
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllRead()
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var unread = await _db.Notifications
                .Where(n => n.UserId == userId.Value && !n.IsRead)
                .ToListAsync();

            foreach (var n in unread) n.IsRead = true;
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}