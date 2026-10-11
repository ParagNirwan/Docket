using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using Docket.Api.Models;
using Docket.Api.Validation;
using System.Security.Claims;

namespace Docket.Api.Endpoints;

public record CreateFolderRequest(string name, Guid? parentFolderId);

public static class FolderEndpoints
{
    public static void MapFolderEndpoints(this WebApplication app)
    {
        // Create folder endpoint
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/folders", async (
            Guid tenantId,
            Guid trayId,
            CreateFolderRequest req,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
            {
                return Results.Json(
                    ApiError.Forbidden("You do not have permission to create folders in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var trayExists = await db.Trays.AnyAsync(t => t.Id == trayId && t.TenantId == tenantId);
            if (!trayExists)
            {
                return Results.NotFound(ApiError.NotFound("Destination tray was not found.", traceId: ctx.TraceIdentifier));
            }

            if (req.parentFolderId.HasValue)
            {
                var parentFolder = await db.Folders.FirstOrDefaultAsync(f => f.Id == req.parentFolderId.Value && f.TenantId == tenantId);
                if (parentFolder is null)
                {
                    return Results.NotFound(ApiError.NotFound("Parent folder was not found in this tenant.", traceId: ctx.TraceIdentifier));
                }
                if (parentFolder.TrayId != trayId)
                {
                    return Results.BadRequest(ApiError.BadRequest(
                        "Parent folder does not belong to the selected tray.",
                        details: $"ParentFolder tray '{parentFolder.TrayId}' != target tray '{trayId}'.",
                        traceId: ctx.TraceIdentifier));
                }
            }

            var trimmedName = req.name.Trim();
            var duplicate = await db.Folders.AnyAsync(f =>
                f.TrayId == trayId &&
                f.ParentFolderId == req.parentFolderId &&
                f.Name.ToLower() == trimmedName.ToLower());

            if (duplicate)
            {
                return Results.Conflict(ApiError.Conflict(
                    message: $"A folder named '{trimmedName}' already exists in this folder level.",
                    details: "Duplicate folder name under the same parent.",
                    traceId: ctx.TraceIdentifier));
            }

            var folder = new Folder
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TrayId = trayId,
                ParentFolderId = req.parentFolderId,
                Name = trimmedName,
                CreatedAt = DateTime.UtcNow
            };

            db.Folders.Add(folder);
            await db.SaveChangesAsync();

            return Results.Created($"/tenant/{tenantId}/trays/{trayId}/folders/{folder.Id}", folder);
        })
        .RequireAuthorization()
        .WithValidation<CreateFolderRequest>();

        // Get folders endpoint
        app.MapGet("/tenant/{tenantId}/trays/{trayId}/folders", async (
            Guid tenantId,
            Guid trayId,
            Guid? parentFolderId,
            bool? all,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
            {
                return Results.Json(
                    ApiError.Forbidden("You do not have access to view folders in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var query = db.Folders.Where(f => f.TrayId == trayId);
            if (all != true)
            {
                query = query.Where(f => f.ParentFolderId == parentFolderId);
            }

            var folders = await query
                .OrderBy(f => f.Name)
                .Select(f => new { f.Id, f.Name, f.ParentFolderId, f.CreatedAt })
                .ToListAsync();

            return Results.Ok(folders);
        })
        .RequireAuthorization();
    }
}