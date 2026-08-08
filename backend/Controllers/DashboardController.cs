using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public DashboardController(ApplicationDbContext db)
        {
            _db = db;
        }

        private IQueryable<Models.Ticket> ScopedTickets()
        {
            var userId = User.GetUserId();
            var query = _db.Tickets.AsQueryable();
            if (!User.IsInAnyRole(StaffRoles) && userId != null)
                query = query.Where(t => t.CreatedBy == userId.Value);
            return query;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            var tickets = ScopedTickets()
                .Include(t => t.Status)
                .Include(t => t.Priority);

            var open = await tickets.CountAsync(t => t.Status!.Name == "Open");
            var inProgress = await tickets.CountAsync(t => t.Status!.Name == "In Progress");
            var pending = await tickets.CountAsync(t => t.Status!.Name == "Pending");
            var resolved = await tickets.CountAsync(t => t.Status!.Name == "Resolved");
            var closed = await tickets.CountAsync(t => t.Status!.Name == "Closed");
            var critical = await tickets.CountAsync(t => t.Priority!.Name == "Critical" && t.Status!.Name != "Closed");

            return Ok(new DashboardSummaryDto
            {
                Open = open,
                InProgress = inProgress,
                Pending = pending,
                Resolved = resolved,
                Closed = closed,
                Critical = critical,
                TotalOpenQueue = open + inProgress + pending,
            });
        }

        [HttpGet("volume-trend")]
        public async Task<ActionResult<List<VolumePointDto>>> GetVolumeTrend([FromQuery] int days = 30)
        {
            var since = DateTime.UtcNow.Date.AddDays(-(days - 1));

            var raw = await ScopedTickets()
                .Where(t => t.CreatedAt >= since)
                .GroupBy(t => t.CreatedAt.Date)
                .Select(g => new { Date = g.Key, Count = g.Count() })
                .ToListAsync();

            var lookup = raw.ToDictionary(r => r.Date, r => r.Count);
            var result = new List<VolumePointDto>();
            for (var day = since; day <= DateTime.UtcNow.Date; day = day.AddDays(1))
            {
                result.Add(new VolumePointDto
                {
                    Date = day.ToString("MMM d"),
                    Count = lookup.TryGetValue(day, out var c) ? c : 0,
                });
            }

            return Ok(result);
        }

        [HttpGet("by-category")]
        public async Task<ActionResult<List<BreakdownItemDto>>> GetByCategory()
        {
            var result = await ScopedTickets()
                .Include(t => t.Category)
                .GroupBy(t => t.Category!.Name)
                .Select(g => new BreakdownItemDto { Label = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("by-priority")]
        public async Task<ActionResult<List<BreakdownItemDto>>> GetByPriority()
        {
            var result = await ScopedTickets()
                .Include(t => t.Priority)
                .GroupBy(t => t.Priority!.Name)
                .Select(g => new BreakdownItemDto { Label = g.Key, Count = g.Count() })
                .ToListAsync();

            return Ok(result);
        }
    }
}