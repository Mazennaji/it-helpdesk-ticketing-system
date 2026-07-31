using Backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/users")]
    [Authorize(Roles = "Admin,IT Support Agent,Manager")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<Models.ApplicationUser> _userManager;

        public UsersController(UserManager<Models.ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
        {
            var agents = await _userManager.GetUsersInRoleAsync("IT Support Agent");
            var result = agents
                .Where(a => a.IsActive)
                .Select(a => new { id = a.Id, name = a.FullName })
                .OrderBy(a => a.name)
                .ToList();
            return Ok(result);
        }
    }
}