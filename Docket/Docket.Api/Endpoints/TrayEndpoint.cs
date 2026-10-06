using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using System.Security.Claims;
namespace Docket.Api.Endpoints;

public record CreateTrayRequest(string name);
public static class TrayEndpoints
{
    public static void MapTrayEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/{tenantId}/trays",
        async (
            Guid tenantId,
            CreateTrayRequest req,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db, 
            ClaimsPrincipal user
        ) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isAdminOrOwner = await authService.IsAdminOrOwner(userId, tenantId);
            if (!isAdminOrOwner) return Results.Forbid();
            var tray = new Tray
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = req.name,
                CreatedAt = DateTime.UtcNow
            };
            db.Trays.Add(tray); await db.SaveChangesAsync();
            return Results.Created($"/tenant/{tenantId}/trays/{tray.Id}", tray);
        }).RequireAuthorization(); 
        
        app.MapGet("/tenant/{tenantId}/trays",
            async (Guid tenantId, CurrentUserService currentUserService,
            TenantAuthorizationService authService, DocketDbContext db, ClaimsPrincipal user) =>
            {
                var userId = currentUserService.GetUserId(user);
                var isMember = await authService.IsMember(userId, tenantId);
                if (!isMember) return Results.Forbid();
                var trays = await db.Trays.Where(t => t.TenantId == tenantId)
                .Select(t => new { t.Id, t.Name, t.CreatedAt })
                .ToListAsync(); return Results.Ok(trays);
            }).RequireAuthorization();
    }
}