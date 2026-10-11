using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using Docket.Api.Models;
using Docket.Api.Validation;
using System.Security.Claims;

namespace Docket.Api.Endpoints;

public record CreateTrayRequest(string name);

public static class TrayEndpoints
{
    public static void MapTrayEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/{tenantId}/trays", async (
            Guid tenantId,
            CreateTrayRequest req,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isAdminOrOwner = await authService.IsAdminOrOwner(userId, tenantId);
            if (!isAdminOrOwner)
            {
                return Results.Json(
                    ApiError.Forbidden("Only tenant admins or owners can create new trays.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var trimmedName = req.name.Trim();
            var exists = await db.Trays.AnyAsync(t => t.TenantId == tenantId && t.Name.ToLower() == trimmedName.ToLower());
            if (exists)
            {
                return Results.Conflict(ApiError.Conflict(
                    message: $"A tray named '{trimmedName}' already exists in this organization.",
                    details: "Tray names must be unique within a tenant.",
                    traceId: ctx.TraceIdentifier));
            }

            var tray = new Tray
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = trimmedName,
                CreatedAt = DateTime.UtcNow
            };

            db.Trays.Add(tray);
            await db.SaveChangesAsync();

            return Results.Created($"/tenant/{tenantId}/trays/{tray.Id}", tray);
        })
        .RequireAuthorization()
        .WithValidation<CreateTrayRequest>();

        app.MapGet("/tenant/{tenantId}/trays", async (
            Guid tenantId,
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
                    ApiError.Forbidden("You do not have access to view trays in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var trays = await db.Trays
                .Where(t => t.TenantId == tenantId)
                .OrderBy(t => t.Name)
                .Select(t => new { t.Id, t.Name, t.CreatedAt })
                .ToListAsync();

            return Results.Ok(trays);
        })
        .RequireAuthorization();
    }
}