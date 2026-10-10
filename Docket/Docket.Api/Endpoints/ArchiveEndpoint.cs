using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using System.Security.Claims;
using Docket.Api.Storage;
namespace Docket.Api.Endpoints;

public static class ArchiveEndpoint
{
    public static void MapArchiveEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/documents/upload",
           async (
               CurrentUserService currentUserService,
               IBlobStore blobStore,
               Guid tenantId,
               Guid trayId,              
               DocketDbContext db,
               TenantAuthorizationService authService,
               ClaimsPrincipal user,
               IFormFile file) =>
           {
               var userId = currentUserService.GetUserId(user);

               var isMember = await authService.IsMember(userId, tenantId);
               if (!isMember)
                   return Results.Forbid();

               if (file.Length == 0)
                   return Results.BadRequest("No file uploaded.");

               // 4. Build a unique, safe storage key
               var safeName = Path.GetFileName(file.FileName);
               var blobKey = $"{tenantId}/{Guid.NewGuid()}_{safeName}";

               // 5. Save through the storage abstraction (local disk or Cloud Storage)
               await using var stream = file.OpenReadStream();
               var blobRef = await blobStore.SaveAsync(blobKey, stream, file.ContentType);

               var document = new ArchivedDocument
               {
                   Id = Guid.NewGuid(),
                   TenantId = tenantId,
                   TrayId = trayId,
                   FileName = safeName,
                   MimeType = file.ContentType,
                   SizeBytes = file.Length,
                   BlobRef = blobRef,
                   UploadedByUserId = userId,
                   FrozenAt = DateTime.UtcNow
               };

               db.ArchivedDocuments.Add(document);
               await db.SaveChangesAsync();

               return Results.Created($"/tenant/{tenantId}/trays/{trayId}/documents/{document.Id}", document);
           }
        )
        .RequireAuthorization()
        .DisableAntiforgery();

        app.MapGet("/tenant/{tenantId}/trays/{trayId}/documents", async (
            Guid tenantId,
            Guid trayId,
            Guid? folderId,             // <-- query string parameter, no {folderId} in the route
            CurrentUserService currentUserService,
            DocketDbContext db,
            TenantAuthorizationService authService,
            ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
                return Results.Forbid();

            var documents = await db.ArchivedDocuments
                .Where(d => d.TrayId == trayId && d.FolderId == folderId)
                .OrderByDescending(d => d.FrozenAt)
                .Select(d => new { d.Id, d.FileName, d.MimeType, d.SizeBytes, d.FrozenAt })
                .ToListAsync();

            return Results.Ok(documents);
        })
        .RequireAuthorization();
    }
}