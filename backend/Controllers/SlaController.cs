using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/sla")]
    [Authorize]
    public class SlaController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly ISlaService _sla;
        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public SlaController(ApplicationDbContext db, ISlaService sla)
        {
            _db = db;
            _sla = sla;
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
        public async Task<ActionResult<SlaSummaryDto>> GetSummary()
        {
            var tickets = await ScopedTickets()
                .Include(t => t.Priority)
                .Include(t => t.Status)
                .ToListAsync();

            int breached = 0, dueSoon = 0, onTrack = 0, met = 0, missed = 0;

            foreach (var t in tickets)
            {
                var info = _sla.Evaluate(t);
                switch (info.State)
                {
                    case SlaState.Breached: breached++; break;
                    case SlaState.DueSoon: dueSoon++; break;
                    case SlaState.OnTrack: onTrack++; break;
                    case SlaState.Met: met++; break;
                    case SlaState.Missed: missed++; break;
                }
            }

            var totalCompleted = met + missed;
            var compliance = totalCompleted == 0 ? 100.0 : Math.Round((double)met / totalCompleted * 100, 1);

            return Ok(new SlaSummaryDto
            {
                Breached = breached,
                DueSoon = dueSoon,
                OnTrack = onTrack,
                MetThisPeriod = met,
                MissedThisPeriod = missed,
                CompliancePercent = compliance,
            });
        }
    }
}