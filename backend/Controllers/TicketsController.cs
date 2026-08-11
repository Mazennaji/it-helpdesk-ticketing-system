using Backend.Data;
using Backend.DTOs;
using Backend.Helpers;
using Backend.Models;
using Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IActivityLogService _activityLog;
        private readonly INotificationService _notifications;
        private readonly ISlaService _sla;

        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public TicketsController(
            ApplicationDbContext db,
            IActivityLogService activityLog,
            INotificationService notifications,
            ISlaService sla)
        {
            _db = db;
            _activityLog = activityLog;
            _notifications = notifications;
            _sla = sla;
        }

        [HttpPost]
        public async Task<ActionResult<TicketDetailDto>> Create(CreateTicketDto dto)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var categoryExists = await _db.Categories.AnyAsync(c => c.CategoryId == dto.CategoryId);
            var priorityExists = await _db.Priorities.AnyAsync(p => p.PriorityId == dto.PriorityId);
            if (!categoryExists || !priorityExists)
                return BadRequest(new { message = "Invalid category or priority." });

            var openStatus = await _db.Statuses.FirstOrDefaultAsync(s => s.Name == "Open");
            if (openStatus == null) return StatusCode(500, new { message = "Open status is not seeded." });

            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                PriorityId = dto.PriorityId,
                StatusId = openStatus.StatusId,
                CreatedBy = userId.Value,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                ReferenceNo = "PENDING",
            };

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();

            ticket.ReferenceNo = $"TCK-{1000 + ticket.TicketId}";
            await _db.SaveChangesAsync();

            await _activityLog.LogAsync(userId.Value, ticket.TicketId, $"Created ticket {ticket.ReferenceNo}");

            var result = await GetDetailDto(ticket.TicketId);
            return CreatedAtAction(nameof(GetById), new { id = ticket.TicketId }, result);
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<TicketListItemDto>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? priorityId = null,
            [FromQuery] int? statusId = null,
            [FromQuery] string? search = null,
            [FromQuery] bool assignedToMe = false)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var query = _db.Tickets
                .Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.Status)
                .Include(t => t.Creator)
                .Include(t => t.Assignee)
                .AsQueryable();

            if (!User.IsInAnyRole(StaffRoles))
                query = query.Where(t => t.CreatedBy == userId.Value);

            if (assignedToMe)
                query = query.Where(t => t.AssignedTo == userId.Value);

            if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
            if (priorityId.HasValue) query = query.Where(t => t.PriorityId == priorityId.Value);
            if (statusId.HasValue) query = query.Where(t => t.StatusId == statusId.Value);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Title.Contains(search) || t.ReferenceNo.Contains(search));

            var totalCount = await query.CountAsync();

            var rows = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.TicketId,
                    t.ReferenceNo,
                    t.Title,
                    Category = t.Category!.Name,
                    Priority = t.Priority!.Name,
                    Status = t.Status!.Name,
                    CreatedByName = t.Creator!.FullName,
                    AssignedToName = t.Assignee != null ? t.Assignee.FullName : null,
                    t.CreatedAt,
                    t.UpdatedAt,
                    t.ResolvedAt,
                })
                .ToListAsync();

            var items = rows.Select(t => new TicketListItemDto
            {
                TicketId = t.TicketId,
                ReferenceNo = t.ReferenceNo,
                Title = t.Title,
                Category = t.Category,
                Priority = t.Priority,
                Status = t.Status,
                CreatedByName = t.CreatedByName,
                AssignedToName = t.AssignedToName,
                CreatedAt = t.CreatedAt,
                Sla = _sla.Evaluate(t.Priority, t.Status, t.CreatedAt, t.ResolvedAt, t.UpdatedAt).ToDto(),
            }).ToList();

            return Ok(new PagedResult<TicketListItemDto>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TicketDetailDto>> GetById(int id)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            if (!User.IsInAnyRole(StaffRoles) && ticket.CreatedBy != userId.Value)
                return Forbid();

            var result = await GetDetailDto(id);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<TicketDetailDto>> Update(int id, UpdateTicketDto dto)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.Include(t => t.Status).FirstOrDefaultAsync(t => t.TicketId == id);
            if (ticket == null) return NotFound();

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value)
                return Forbid();

            if (!isStaff && dto.StatusId != ticket.StatusId)
                return Forbid();
            if (!isStaff && dto.AssignedTo != ticket.AssignedTo)
                return Forbid();

            if (dto.StatusId != ticket.StatusId)
            {
                var currentStatus = ticket.Status!.Name;
                var nextStatus = await _db.Statuses.FindAsync(dto.StatusId);
                if (nextStatus == null) return BadRequest(new { message = "Invalid status." });

                if (!TicketWorkflow.IsValidTransition(currentStatus, nextStatus.Name))
                {
                    return BadRequest(new
                    {
                        message = $"Cannot move a ticket from '{currentStatus}' directly to '{nextStatus.Name}'."
                    });
                }

                await _activityLog.LogAsync(userId.Value, ticket.TicketId,
                    $"Changed status from {currentStatus} to {nextStatus.Name}");

                if (ticket.CreatedBy != userId.Value)
                {
                    await _notifications.NotifyAsync(ticket.CreatedBy, ticket.TicketId,
                        $"Ticket {ticket.ReferenceNo} status changed to {nextStatus.Name}");
                }

                var resolvedStatus = await _db.Statuses.FirstOrDefaultAsync(s => s.Name == "Resolved");
                if (resolvedStatus != null && dto.StatusId == resolvedStatus.StatusId && ticket.ResolvedAt == null)
                    ticket.ResolvedAt = DateTime.UtcNow;
            }

            if (dto.AssignedTo != ticket.AssignedTo)
            {
                var agentName = dto.AssignedTo.HasValue
                    ? (await _db.Users.FindAsync(dto.AssignedTo.Value))?.FullName ?? "Unknown"
                    : "Unassigned";
                await _activityLog.LogAsync(userId.Value, ticket.TicketId, $"Reassigned to {agentName}");

                if (dto.AssignedTo.HasValue)
                {
                    await _notifications.NotifyAsync(dto.AssignedTo.Value, ticket.TicketId,
                        $"You were assigned to ticket {ticket.ReferenceNo}");
                }
            }

            ticket.Title = dto.Title;
            ticket.Description = dto.Description;
            ticket.CategoryId = dto.CategoryId;
            ticket.PriorityId = dto.PriorityId;
            ticket.StatusId = dto.StatusId;
            ticket.AssignedTo = dto.AssignedTo;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            var result = await GetDetailDto(id);
            return Ok(result);
        }

        [HttpPut("{id}/assign")]
        [Authorize(Roles = "Admin,IT Support Agent,Manager")]
        public async Task<ActionResult<TicketDetailDto>> Assign(int id, AssignTicketDto dto)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            if (dto.AgentId.HasValue)
            {
                var agentExists = await _db.Users.AnyAsync(u => u.Id == dto.AgentId.Value);
                if (!agentExists) return BadRequest(new { message = "Agent not found." });
            }

            var agentName = dto.AgentId.HasValue
                ? (await _db.Users.FindAsync(dto.AgentId.Value))?.FullName ?? "Unknown"
                : "Unassigned";

            ticket.AssignedTo = dto.AgentId;
            ticket.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await _activityLog.LogAsync(userId.Value, ticket.TicketId, $"Assigned to {agentName}");

            if (dto.AgentId.HasValue)
            {
                await _notifications.NotifyAsync(dto.AgentId.Value, ticket.TicketId,
                    $"You were assigned to ticket {ticket.ReferenceNo}");
            }

            var result = await GetDetailDto(id);
            return Ok(result);
        }

        [HttpPost("{id}/escalate")]
        [Authorize(Roles = "Admin,IT Support Agent,Manager")]
        public async Task<ActionResult<TicketDetailDto>> Escalate(int id, EscalateTicketDto dto)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.Include(t => t.Priority).FirstOrDefaultAsync(t => t.TicketId == id);
            if (ticket == null) return NotFound();

            var nextPriority = await _db.Priorities
                .Where(p => p.SortOrder > ticket.Priority!.SortOrder)
                .OrderBy(p => p.SortOrder)
                .FirstOrDefaultAsync();

            if (nextPriority == null)
                return BadRequest(new { message = "Ticket is already at the highest priority." });

            var oldPriorityName = ticket.Priority!.Name;
            ticket.PriorityId = nextPriority.PriorityId;
            ticket.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            var reasonSuffix = string.IsNullOrWhiteSpace(dto.Reason) ? "" : $" ({dto.Reason})";
            await _activityLog.LogAsync(userId.Value, ticket.TicketId,
                $"Escalated priority from {oldPriorityName} to {nextPriority.Name}{reasonSuffix}");

            if (ticket.AssignedTo.HasValue)
            {
                await _notifications.NotifyAsync(ticket.AssignedTo.Value, ticket.TicketId,
                    $"Ticket {ticket.ReferenceNo} was escalated to {nextPriority.Name}");
            }

            var result = await GetDetailDto(id);
            return Ok(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = User.GetUserId();
            if (userId == null) return Unauthorized();

            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value)
                return Forbid();

            _db.Tickets.Remove(ticket);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        private async Task<TicketDetailDto?> GetDetailDto(int id)
        {
            var dto = await _db.Tickets
                .Include(t => t.Category)
                .Include(t => t.Priority)
                .Include(t => t.Status)
                .Include(t => t.Creator)
                .Include(t => t.Assignee)
                .Where(t => t.TicketId == id)
                .Select(t => new TicketDetailDto
                {
                    TicketId = t.TicketId,
                    ReferenceNo = t.ReferenceNo,
                    Title = t.Title,
                    Description = t.Description,
                    Category = new LookupDto { Id = t.CategoryId, Name = t.Category!.Name },
                    Priority = new LookupDto { Id = t.PriorityId, Name = t.Priority!.Name },
                    Status = new LookupDto { Id = t.StatusId, Name = t.Status!.Name },
                    CreatedBy = t.CreatedBy,
                    CreatedByName = t.Creator!.FullName,
                    AssignedTo = t.AssignedTo,
                    AssignedToName = t.Assignee != null ? t.Assignee.FullName : null,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt,
                    ResolvedAt = t.ResolvedAt,
                })
                .FirstOrDefaultAsync();

            if (dto != null)
            {
                dto.Sla = _sla
                    .Evaluate(dto.Priority.Name, dto.Status.Name, dto.CreatedAt, dto.ResolvedAt, dto.UpdatedAt)
                    .ToDto();
            }

            return dto;
        }
    }
}