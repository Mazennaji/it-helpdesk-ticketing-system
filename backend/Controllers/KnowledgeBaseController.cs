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
    [Route("api/knowledge-base")]
    [Authorize]
    public class KnowledgeBaseController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private static readonly string[] StaffRoles = { "Admin", "IT Support Agent", "Manager" };

        public KnowledgeBaseController(ApplicationDbContext db)
        {
            _db = db;
        }

        private bool IsStaff() => User.IsInAnyRole(StaffRoles);

        [HttpGet]
        public async Task<ActionResult<List<ArticleListItemDto>>> GetAll(
            [FromQuery] string? search,
            [FromQuery] string? category)
        {
            var query = _db.KnowledgeArticles.AsQueryable();

            if (!IsStaff())
                query = query.Where(a => a.IsPublished);

            if (!string.IsNullOrWhiteSpace(category))
                query = query.Where(a => a.Category == category);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim();
                query = query.Where(a =>
                    EF.Functions.Like(a.Title, $"%{term}%") ||
                    EF.Functions.Like(a.Summary, $"%{term}%") ||
                    EF.Functions.Like(a.Body, $"%{term}%"));
            }

            var result = await query
                .OrderByDescending(a => a.UpdatedAt)
                .Select(a => new ArticleListItemDto
                {
                    Id = a.Id,
                    Title = a.Title,
                    Category = a.Category,
                    Summary = a.Summary,
                    IsPublished = a.IsPublished,
                })
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<ActionResult<List<string>>> GetCategories()
        {
            var query = _db.KnowledgeArticles.AsQueryable();
            if (!IsStaff())
                query = query.Where(a => a.IsPublished);

            var cats = await query
                .Select(a => a.Category)
                .Where(c => c != null && c != "")
                .Distinct()
                .OrderBy(c => c)
                .ToListAsync();

            return Ok(cats);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ArticleDetailDto>> GetOne(int id)
        {
            var a = await _db.KnowledgeArticles
                .Include(x => x.Author)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (a == null) return NotFound();
            if (!a.IsPublished && !IsStaff()) return NotFound();

            return Ok(new ArticleDetailDto
            {
                Id = a.Id,
                Title = a.Title,
                Category = a.Category,
                Summary = a.Summary,
                Body = a.Body,
                IsPublished = a.IsPublished,
                AuthorName = a.Author?.FullName,
                CreatedAt = a.CreatedAt,
                UpdatedAt = a.UpdatedAt,
            });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,IT Support Agent,Manager")]
        public async Task<ActionResult<ArticleDetailDto>> Create(SaveArticleDto dto)
        {
            var article = new KnowledgeArticle
            {
                Title = dto.Title,
                Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category,
                Summary = dto.Summary,
                Body = dto.Body,
                IsPublished = dto.IsPublished,
                AuthorId = User.GetUserId()?.ToString(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            _db.KnowledgeArticles.Add(article);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetOne), new { id = article.Id },
                new ArticleDetailDto
                {
                    Id = article.Id,
                    Title = article.Title,
                    Category = article.Category,
                    Summary = article.Summary,
                    Body = article.Body,
                    IsPublished = article.IsPublished,
                    CreatedAt = article.CreatedAt,
                    UpdatedAt = article.UpdatedAt,
                });
        }

        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin,IT Support Agent,Manager")]
        public async Task<IActionResult> Update(int id, SaveArticleDto dto)
        {
            var article = await _db.KnowledgeArticles.FindAsync(id);
            if (article == null) return NotFound();

            article.Title = dto.Title;
            article.Category = string.IsNullOrWhiteSpace(dto.Category) ? "General" : dto.Category;
            article.Summary = dto.Summary;
            article.Body = dto.Body;
            article.IsPublished = dto.IsPublished;
            article.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> Delete(int id)
        {
            var article = await _db.KnowledgeArticles.FindAsync(id);
            if (article == null) return NotFound();

            _db.KnowledgeArticles.Remove(article);
            await _db.SaveChangesAsync();
            return NoContent();
        }
    }
}