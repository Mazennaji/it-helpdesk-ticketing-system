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
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public TicketsController(ApplicationDbContext db)
        {
            _db = db;
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
            [FromQuery] string? search = null)
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

            if (categoryId.HasValue) query = query.Where(t => t.CategoryId == categoryId.Value);
            if (priorityId.HasValue) query = query.Where(t => t.PriorityId == priorityId.Value);
            if (statusId.HasValue) query = query.Where(t => t.StatusId == statusId.Value);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(t => t.Title.Contains(search) || t.ReferenceNo.Contains(search));

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(t => t.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new TicketListItemDto
                {
                    TicketId = t.TicketId,
                    ReferenceNo = t.ReferenceNo,
                    Title = t.Title,
                    Category = t.Category!.Name,
                    Priority = t.Priority!.Name,
                    Status = t.Status!.Name,
                    CreatedByName = t.Creator!.FullName,
                    AssignedToName = t.Assignee != null ? t.Assignee.FullName : null,
                    CreatedAt = t.CreatedAt,
                })
                .ToListAsync();

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

            var ticket = await _db.Tickets.FindAsync(id);
            if (ticket == null) return NotFound();

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value)
                return Forbid();

            if (!isStaff && dto.StatusId != ticket.StatusId)
                return Forbid();
            if (!isStaff && dto.AssignedTo != ticket.AssignedTo)
                return Forbid();

            ticket.Title = dto.Title;
            ticket.Description = dto.Description;
            ticket.CategoryId = dto.CategoryId;
            ticket.PriorityId = dto.PriorityId;
            ticket.StatusId = dto.StatusId;
            ticket.AssignedTo = dto.AssignedTo;
            ticket.UpdatedAt = DateTime.UtcNow;

            var resolvedStatus = await _db.Statuses.FirstOrDefaultAsync(s => s.Name == "Resolved");
            if (resolvedStatus != null && dto.StatusId == resolvedStatus.StatusId && ticket.ResolvedAt == null)
                ticket.ResolvedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

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
            return await _db.Tickets
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
        }
    }
}