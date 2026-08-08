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
    [Route("api/tickets/{ticketId}/attachments")]
    [Authorize]
    public class TicketAttachmentsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IActivityLogService _activityLog;
        private readonly IWebHostEnvironment _env;

        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };
        private static readonly string[] AllowedExtensions =
        {
            ".png", ".jpg", ".jpeg", ".gif", ".pdf", ".doc", ".docx",
            ".xls", ".xlsx", ".txt", ".log", ".csv"
        };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024;

        public TicketAttachmentsController(
            ApplicationDbContext db,
            IActivityLogService activityLog,
            IWebHostEnvironment env)
        {
            _db = db;
            _activityLog = activityLog;
            _env = env;
        }

        private async Task<(bool allowed, Ticket? ticket)> CheckAccess(int ticketId)
        {
            var userId = User.GetUserId();
            if (userId == null) return (false, null);

            var ticket = await _db.Tickets.FindAsync(ticketId);
            if (ticket == null) return (false, null);

            var isStaff = User.IsInAnyRole(StaffRoles);
            if (!isStaff && ticket.CreatedBy != userId.Value) return (false, ticket);

            return (true, ticket);
        }

        [HttpGet]
        public async Task<ActionResult<List<AttachmentResponseDto>>> GetAll(int ticketId)
        {
            var (allowed, ticket) = await CheckAccess(ticketId);
            if (ticket == null) return NotFound();
            if (!allowed) return Forbid();

            var attachments = await _db.TicketAttachments
                .Include(a => a.Uploader)
                .Where(a => a.TicketId == ticketId)
                .OrderByDescending(a => a.UploadedAt)
                .Select(a => new AttachmentResponseDto
                {
                    AttachmentId = a.AttachmentId,
                    TicketId = a.TicketId,
                    FileName = a.FileName,
                    FileSizeKb = a.FileSizeKb,
                    UploadedByName = a.Uploader!.FullName,
                    UploadedAt = a.UploadedAt,
                })
                .ToListAsync();

            return Ok(attachments);
        }

        [HttpPost]
        [RequestSizeLimit(MaxFileSizeBytes)]
        public async Task<ActionResult<AttachmentResponseDto>> Upload(int ticketId, IFormFile file)
        {
            var userId = User.GetUserId();
            var (allowed, ticket) = await CheckAccess(ticketId);
            if (ticket == null) return NotFound();
            if (!allowed || userId == null) return Forbid();

            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file was provided." });

            if (file.Length > MaxFileSizeBytes)
                return BadRequest(new { message = "File exceeds the 10MB size limit." });

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { message = $"File type '{extension}' is not allowed." });

            var uploadsRoot = Path.Combine(_env.ContentRootPath, "Uploads", ticketId.ToString());
            Directory.CreateDirectory(uploadsRoot);

            var storedFileName = $"{Guid.NewGuid()}{extension}";
            var fullPath = Path.Combine(uploadsRoot, storedFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var attachment = new TicketAttachment
            {
                TicketId = ticketId,
                UploadedBy = userId.Value,
                FileName = file.FileName,
                FilePath = Path.Combine("Uploads", ticketId.ToString(), storedFileName),
                FileSizeKb = (int)Math.Ceiling(file.Length / 1024.0),
                UploadedAt = DateTime.UtcNow,
            };

            _db.TicketAttachments.Add(attachment);
            await _db.SaveChangesAsync();

            await _activityLog.LogAsync(userId.Value, ticketId, $"Attached file: {file.FileName}");

            var uploader = await _db.Users.FindAsync(userId.Value);
            return Ok(new AttachmentResponseDto
            {
                AttachmentId = attachment.AttachmentId,
                TicketId = attachment.TicketId,
                FileName = attachment.FileName,
                FileSizeKb = attachment.FileSizeKb,
                UploadedByName = uploader?.FullName ?? "",
                UploadedAt = attachment.UploadedAt,
            });
        }

        [HttpGet("{attachmentId}/download")]
        public async Task<IActionResult> Download(int ticketId, int attachmentId)
        {
            var (allowed, ticket) = await CheckAccess(ticketId);
            if (ticket == null) return NotFound();
            if (!allowed) return Forbid();

            var attachment = await _db.TicketAttachments
                .FirstOrDefaultAsync(a => a.AttachmentId == attachmentId && a.TicketId == ticketId);
            if (attachment == null) return NotFound();

            var fullPath = Path.Combine(_env.ContentRootPath, attachment.FilePath);
            if (!System.IO.File.Exists(fullPath))
                return NotFound(new { message = "The stored file could not be found on disk." });

            var bytes = await System.IO.File.ReadAllBytesAsync(fullPath);
            return File(bytes, "application/octet-stream", attachment.FileName);
        }
    }
}