using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Helpers
{
    public static class ClaimsPrincipalExtensions
    {
        public static int? GetUserId(this ClaimsPrincipal user)
        {
            var raw = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                      ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(raw, out var id) ? id : null;
        }

        public static bool IsInAnyRole(this ClaimsPrincipal user, params string[] roles)
        {
            return roles.Any(user.IsInRole);
        }
    }
}