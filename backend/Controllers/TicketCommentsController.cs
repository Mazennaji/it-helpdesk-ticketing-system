using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId}/comments")]
    [Authorize]
    public class TicketCommentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IActivityLogService _activityLog;
        private readonly INotificationService _notifications;

        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public TicketCommentsController(
            ApplicationDbContext db,
            IActivityLogService activityLog,
            INotificationService notifications)
        {
            _db = db;
            _activityLog = activityLog;
            _notifications = notifications;
        }

        [HttpGet]
        public async Task<ActionResult<List<CommentResponseDto>>> GetAll(int ticketId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value)
                return Forbid();

            var query = _db.TicketComments
                .Include(c => c.User)
                .Where(c => c.TicketId == ticketId);

            if (!isStaff)
                query = query.Where(c => !c.IsInternal);

            var comments = await query
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentResponseDto
                {
                    CommentId = c.CommentId,
                    TicketId = c.TicketId,
                    UserId = c.UserId,
                    UserName = c.User!.FullName,
                    CommentText = c.CommentText,
                    IsInternal = c.IsInternal,
                    CreatedAt = c.CreatedAt,
                })
                .ToListAsync();

            return Ok(comments);
        }

        [HttpPost]
        public async Task<ActionResult<CommentResponseDto>> Create(int ticketId, CreateCommentDto dto)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value)
                return Forbid();

            if (string.IsNullOrWhiteSpace(dto.CommentText))
                return BadRequest(new { message = "Comment text is required." });

            var comment = new TicketComment
            {
                TicketId = ticketId,
                UserId = userId.Value,
                CommentText = dto.CommentText,
                IsInternal = isStaff && dto.IsInternal,
                CreatedAt = DateTime.UtcNow,
            };

            _db.TicketComments.Add(comment);
            await _db.SaveChangesAsync();

            await _activityLog.LogAsync(userId.Value, ticketId,
                comment.IsInternal ? "Added an internal note" : "Added a comment");

            if (!comment.IsInternal)
            {
                if (isStaff && ticket.CreatedBy != userId.Value)
                {
                    await _notifications.NotifyAsync(ticket.CreatedBy, ticketId,
                        $"New reply on ticket {ticket.ReferenceNo}");
                }
                else if (!isStaff && ticket.AssignedTo.HasValue && ticket.AssignedTo.Value != userId.Value)
                {
                    await _notifications.NotifyAsync(ticket.AssignedTo.Value, ticketId,
                        $"New comment on ticket {ticket.ReferenceNo}");
                }
            }

            var user = await _db.Users.FindAsync(userId.Value);
            return Ok(new CommentResponseDto
            {
                CommentId = comment.CommentId,
                TicketId = comment.TicketId,
                UserId = comment.UserId,
                UserName = user?.FullName ?? "",
                CommentText = comment.CommentText,
                IsInternal = comment.IsInternal,
                CreatedAt = comment.CreatedAt,
            });
        }
    }
}