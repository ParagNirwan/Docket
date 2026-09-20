using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using System.Security.Claims;
using Docket.Api.Services;
namespace Docket.Api.Endpoints;

public record CreateTenantRequest(string name, string slug);

public static class TenantEndpoints
{
    public static void MapTenantEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/create", async (
            DocketDbContext db,
            CreateTenantRequest req,
            ClaimsPrincipal user // <-- ASP.NET Core automatically fills this in from the
                                 //     validated JWT on the incoming request. This is only
                                 //     possible because .RequireAuthorization() runs first
                                 //     and rejects the request if there's no valid token.
            ) =>
        {
            // Pull the "sub" claim out of the token - this is the user ID we put in
            // when we generated the token back in /auth/login.
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);

            // Defensive check: this should basically never be null if .RequireAuthorization()
            // did its job, but it's good practice to never trust that blindly.
            if (userIdClaim is null)
                return Results.Unauthorized();

            // The claim comes back as a plain string - we need to convert it back
            // to a Guid so it matches the type of User.Id / TenantMembership.UserId.
            var userId = Guid.Parse(userIdClaim.Value);

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

            // This is the piece that was missing: creating a tenant on its own isn't
            // enough - without a TenantMembership row, the creator would have no way
            // to access the tenant they just made. This is what "makes them the Owner."
            var membership = new TenantMembership
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                TenantId = tenant.Id,
                Role = TenantRole.Owner,
                CreatedAt = DateTime.UtcNow
            };

            // Both new rows get added to the DbContext's "pending changes" tracker here...
            db.Tenants.Add(tenant);
            db.TenantMemberships.Add(membership);

            // ...and this one call sends both INSERTs to Postgres together.
            // This matters: if this line failed halfway through, EF Core/Postgres
            // ensures you never end up with a tenant but no membership, or vice versa -
            // that's a transaction, even though we didn't write "transaction" anywhere.
            await db.SaveChangesAsync();

            return Results.Created($"tenant/{tenant.Slug}", new { tenant.Id, tenant.Slug });
        })
        .RequireAuthorization();


        //GET all tenants  a user has
        app.MapGet("/tenant/list", async (
        DocketDbContext db,
        ClaimsPrincipal user) =>
            {
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim is null)
                    return Results.Unauthorized();

                var userId = Guid.Parse(userIdClaim.Value);

                var tenants = await db.TenantMemberships
                .Where(m => m.UserId == userId)
                .Include(m => m.Tenant)
                .Select(m => new { m.Tenant!.Id, m.Tenant.Name, m.Tenant.Slug, m.Role })
                .ToListAsync();
                return Results.Ok(tenants);
            }).RequireAuthorization();

        //GET all uploaded files of a tenant
        app.MapGet("tenants/{tenantId}/documents", async (
            Guid tenantId,
            DocketDbContext db,
            ClaimsPrincipal user,
            //we created this TenantAuthorizationService ourseleves. 
            TenantAuthorizationService authService
            ) =>
            {
                //We get user and check if he belongs
                var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim is null)
                    return Results.Unauthorized();
                var userId = Guid.Parse(userIdClaim.Value);

                //check if he belongs
                var isMember = await authService.IsMember(userId, tenantId);
                if (!isMember) return Results.Forbid();

                //here we get the docs.
                var documents = await db.ArchivedDocuments.Where(d => d.TenantId == tenantId)
                .OrderByDescending(d => d.FrozenAt)
                .Select(d => new { d.Id, d.FileName, d.MimeType, d.SizeBytes, d.FrozenAt })
                .ToListAsync();
                return Results.Ok(documents);
            }).RequireAuthorization();

        //
        app.MapGet("/tenant/{tenantId}",
        async (
            Guid tenantId,
            DocketDbContext db,
            ClaimsPrincipal user,
            TenantAuthorizationService authService) =>
        {


            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim is null)
                return Results.Unauthorized();
            var userId = Guid.Parse(userIdClaim.Value);

            //check if he belongs
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();


            var tenant = await db.Tenants.Where(t => t.Id == tenantId).Select(t => new { t.Id, t.Name, t.Slug }).FirstOrDefaultAsync();
            if (tenant is null) 
                return Results.NotFound(); 
            return Results.Ok(tenant);
        }).RequireAuthorization();



    }
}
