using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Backend.Helpers;

namespace Backend.Hubs
{
    [Authorize]
    public class NotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.GetUserId();
            if (userId != null)
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId.Value}");

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.GetUserId();
            if (userId != null)
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user-{userId.Value}");

            await base.OnDisconnectedAsync(exception);
        }
    }
}