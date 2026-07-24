using Backend.Data;
using Backend.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public CategoriesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<List<LookupDto>>> GetAll()
        {
            var items = await _db.Categories
                .OrderBy(c => c.Name)
                .Select(c => new LookupDto { Id = c.CategoryId, Name = c.Name })
                .ToListAsync();
            return Ok(items);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PrioritiesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public PrioritiesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<List<LookupDto>>> GetAll()
        {
            var items = await _db.Priorities
                .OrderBy(p => p.SortOrder)
                .Select(p => new LookupDto { Id = p.PriorityId, Name = p.Name })
                .ToListAsync();
            return Ok(items);
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StatusesController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public StatusesController(ApplicationDbContext db) => _db = db;

        [HttpGet]
        public async Task<ActionResult<List<LookupDto>>> GetAll()
        {
            var items = await _db.Statuses
                .OrderBy(s => s.StatusId)
                .Select(s => new LookupDto { Id = s.StatusId, Name = s.Name })
                .ToListAsync();
            return Ok(items);
        }
    }
}