using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using System.Security.Claims;
using Docket.Api.Services;
using Docket.Api.Models;
using Docket.Api.Validation;

namespace Docket.Api.Endpoints;

public record CreateTenantRequest(string name, string slug);
public record MoveDocumentRequest(Guid? folderId);

public static class TenantEndpoints
{
    public static void MapTenantEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/create", async (
            CurrentUserService currentUserService,
            DocketDbContext db,
            CreateTenantRequest req,
            ClaimsPrincipal user,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);
            var normalizedSlug = req.slug.Trim().ToLowerInvariant();

            var exists = await db.Tenants.AnyAsync(t => t.Slug == normalizedSlug);
            if (exists)
            {
                var error = ApiError.Conflict(
                    message: "The organization handle (slug) is already taken. Please choose another one.",
                    details: $"A tenant with slug '{normalizedSlug}' already exists.",
                    traceId: ctx.TraceIdentifier);

                return Results.Conflict(error);
            }

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = req.name.Trim(),
                CreatedAt = DateTime.UtcNow,
                Slug = normalizedSlug
            };

            var membership = new TenantMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TenantId = tenant.Id,
                Role = TenantRole.Owner,
                CreatedAt = DateTime.UtcNow
            };

            db.Tenants.Add(tenant);
            db.TenantMemberships.Add(membership);

            // Create default Tray
            var defaultTray = new Tray
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = "General",
                CreatedAt = DateTime.UtcNow
            };
            db.Trays.Add(defaultTray);

            await db.SaveChangesAsync();

            return Results.Created($"tenant/{tenant.Slug}", new { tenant.Id, tenant.Slug, tenant.Name });
        })
        .RequireAuthorization()
        .WithValidation<CreateTenantRequest>();

        // GET all tenants a user has
        app.MapGet("/tenant/list", async (
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);

            var tenants = await db.TenantMemberships
                .Where(m => m.UserId == userId)
                .Include(m => m.Tenant)
                .Select(m => new { m.Tenant!.Id, m.Tenant.Name, m.Tenant.Slug, m.Role })
                .ToListAsync();

            return Results.Ok(tenants);
        })
        .RequireAuthorization();

        app.MapGet("/tenant/{tenantId}", async (
            Guid tenantId,
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user,
            TenantAuthorizationService authService,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
            {
                return Results.Json(
                    ApiError.Forbidden("You do not have access to this tenant organization.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var tenant = await db.Tenants
                .Where(t => t.Id == tenantId)
                .Select(t => new { t.Id, t.Name, t.Slug })
                .FirstOrDefaultAsync();

            if (tenant is null)
            {
                return Results.NotFound(ApiError.NotFound("Tenant organization not found.", traceId: ctx.TraceIdentifier));
            }

            return Results.Ok(tenant);
        })
        .RequireAuthorization();

        app.MapPatch("/tenant/{tenantId}/documents/{documentId}/move", async (
            Guid tenantId,
            Guid documentId,
            MoveDocumentRequest req,
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user,
            TenantAuthorizationService authService,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
            {
                return Results.Json(
                    ApiError.Forbidden("You do not have permission to move documents in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var document = await db.ArchivedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId && d.TenantId == tenantId);

            if (document is null)
            {
                return Results.NotFound(ApiError.NotFound("Archived document not found.", traceId: ctx.TraceIdentifier));
            }

            if (req.folderId.HasValue)
            {
                var folderExists = await db.Folders.AnyAsync(f => f.Id == req.folderId.Value && f.TenantId == tenantId);
                if (!folderExists)
                {
                    return Results.NotFound(ApiError.NotFound(
                        "The destination folder does not exist in this tenant.",
                        details: $"FolderId '{req.folderId.Value}' was not found.",
                        traceId: ctx.TraceIdentifier));
                }
            }

            document.FolderId = req.folderId;
            await db.SaveChangesAsync();

            return Results.Ok(document);
        })
        .RequireAuthorization();
    }
}