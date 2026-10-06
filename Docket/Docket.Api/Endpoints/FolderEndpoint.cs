using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using System.Security.Claims;
namespace Docket.Api.Endpoints;

public record CreateFolderRequest(string name, Guid? parentFolderId);
public static class FolderEndpoints
{
    public static void MapFolderEndpoints(this WebApplication app)
    {
        //create folder endpoibnt
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/folders",
        async (Guid tenantId, Guid trayId, CreateFolderRequest req,
        CurrentUserService currentUserService, TenantAuthorizationService authService,
        DocketDbContext db, ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();
            var folder = new Folder
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TrayId = trayId,
                ParentFolderId = req.parentFolderId,
                Name = req.name,
                CreatedAt = DateTime.UtcNow
            };
            db.Folders.Add(folder);
            await db.SaveChangesAsync();
            return Results.Created($"/tenant/{tenantId}/trays/{trayId}/folders/{folder.Id}", folder);
        }).RequireAuthorization();

        //Get folders endpoint
        app.MapGet("/tenant/{tenantId}/trays/{trayId}/folders", async (
            Guid tenantId,
            Guid trayId,
            Guid?
            parentFolderId,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();
            var folders = await db.Folders.Where(f => f.TrayId == trayId && f.ParentFolderId == parentFolderId)
            .Select(f => new { f.Id, f.Name, f.ParentFolderId, f.CreatedAt })
            .ToListAsync();
            return Results.Ok(folders);
        }).RequireAuthorization();
    }
}