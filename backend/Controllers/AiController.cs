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
    [Route("api/ai")]
    [Authorize]
    public class AiController : ControllerBase
    {
        private readonly IAiService _ai;
        private readonly ApplicationDbContext _db;
        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public AiController(IAiService ai, ApplicationDbContext db)
        {
            _ai = ai;
            _db = db;
        }

        [HttpPost("classify")]
        public async Task<ActionResult<ClassifySuggestionDto>> Classify(ClassifyRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest(new { message = "Description is required." });

            try
            {
                var result = await _ai.ClassifyAsync(request);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service error.", detail = ex.Message });
            }
        }

        [HttpPost("draft-reply")]
        [Authorize(Roles = "Admin,IT Support Agent,Manager")]
        public async Task<ActionResult<DraftReplyResponseDto>> DraftReply(DraftReplyRequestDto request)
        {
            var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.TicketId == request.TicketId);
            if (ticket == null) return NotFound(new { message = "Ticket not found." });

            try
            {
                var reply = await _ai.DraftReplyAsync(ticket, request.Instruction);
                return Ok(new DraftReplyResponseDto { Reply = reply });
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service error.", detail = ex.Message });
            }
        }

        [HttpPost("chat")]
        public async Task<ActionResult<ChatResponseDto>> Chat(ChatRequestDto request)
        {
            if (request.Messages == null || request.Messages.Count == 0)
                return BadRequest(new { message = "At least one message is required." });

            try
            {
                var result = await _ai.ChatAsync(request.Messages);
                return Ok(result);
            }
            catch (HttpRequestException ex)
            {
                return StatusCode(502, new { message = "AI service error.", detail = ex.Message });
            }
        }
    }
}