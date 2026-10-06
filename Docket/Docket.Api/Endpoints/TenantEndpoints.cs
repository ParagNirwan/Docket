using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using System.Security.Claims;
using Docket.Api.Services;
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
            ClaimsPrincipal user) =>
        {

            var userId = currentUserService.GetUserId(user);

            var exists = await db.Tenants.AnyAsync(t => t.Slug == req.slug);
            if (exists)
                return Results.Conflict("This slug is already being used by another tenant.");

            var tenant = new Tenant
            {
                Id = Guid.NewGuid(),
                Name = req.name,
                CreatedAt = DateTime.UtcNow,
                Slug = req.slug
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

            //Code tou create Default Trays
            var defaultTray = new Tray
            {
                Id = Guid.NewGuid(),
                TenantId = tenant.Id,
                Name = "General",
                CreatedAt = DateTime.UtcNow
            };
            db.Trays.Add(defaultTray);


            await db.SaveChangesAsync();

            return Results.Created($"tenant/{tenant.Slug}", new { tenant.Id, tenant.Slug });
        })
        .RequireAuthorization();


        // GET all tenants a user has
        app.MapGet("/tenant/list", async (
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            // CHANGED: same replacement as /tenant/create above.
            var userId = currentUserService.GetUserId(user);

            var tenants = await db.TenantMemberships
                .Where(m => m.UserId == userId)
                .Include(m => m.Tenant)
                .Select(m => new { m.Tenant!.Id, m.Tenant.Name, m.Tenant.Slug, m.Role })
                .ToListAsync();
            return Results.Ok(tenants);
        })
        .RequireAuthorization();


        app.MapGet("/tenant/{tenantId}",
        async (
            Guid tenantId,
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user,
            TenantAuthorizationService authService) =>
        {

            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            var tenant = await db.Tenants
                .Where(t => t.Id == tenantId)
                .Select(t => new { t.Id, t.Name, t.Slug })
                .FirstOrDefaultAsync();

            if (tenant is null)
                return Results.NotFound();
            return Results.Ok(tenant);
        })
        .RequireAuthorization();


        app.MapPatch("/tenant/{tenantId}/documents/{documentId}/move",
        async (
            Guid tenantId,
            Guid documentId,
            MoveDocumentRequest req,
            CurrentUserService currentUserService,
            DocketDbContext db,
            ClaimsPrincipal user,
            TenantAuthorizationService authService
            ) =>
        {
            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
                return Results.Forbid();

            var document = await db.ArchivedDocuments
                .FirstOrDefaultAsync(d => d.Id == documentId && d.TenantId == tenantId);

            if (document is null)
                return Results.NotFound();

            document.FolderId = req.folderId;
            await db.SaveChangesAsync();

            return Results.Ok(document);
        })
        .RequireAuthorization();

    }
}