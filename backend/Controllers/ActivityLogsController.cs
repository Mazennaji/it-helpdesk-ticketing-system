using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/tickets/{ticketId}/activity")]
    [Authorize]
    public class ActivityLogsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public ActivityLogsController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public async Task<ActionResult<List<ActivityLogResponseDto>>> GetAll(int ticketId)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) return NotFound();

            if (!User.IsInAnyRole(StaffRoles) && ticket.CreatedBy != userId.Value)
                return Forbid();

            var logs = await _db.ActivityLogs
                .Include(a => a.User)
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new ActivityLogResponseDto
                {
                    LogId = a.LogId,
                    TicketId = a.TicketId,
                    UserId = a.UserId,
                    UserName = a.User!.FullName,
                    Action = a.Action,
                    CreatedAt = a.CreatedAt,
                })
                .ToListAsync();

            return Ok(logs);
        }
    }
}