using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using System.Security.Claims;

namespace Docket.Api.Endpoints;

public static class ArchiveEndpoint
{
    public static void MapArchiveEndpoints(this WebApplication app)
    {
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/documents/upload",
           async (
               CurrentUserService currentUserService,
               Guid tenantId,
               Guid trayId,               // <-- was missing, now captures the route segment
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

               var uploadsFolder = Path.Combine("uploads", tenantId.ToString());
               Directory.CreateDirectory(uploadsFolder);

               var storedFileName = $"{Guid.NewGuid()}_{file.FileName}";
               var filePath = Path.Combine(uploadsFolder, storedFileName);

               using (var stream = new FileStream(filePath, FileMode.Create))
               {
                   await file.CopyToAsync(stream);
               }

               var document = new ArchivedDocument
               {
                   Id = Guid.NewGuid(),
                   TenantId = tenantId,
                   TrayId = trayId,
                   FileName = file.FileName,
                   MimeType = file.ContentType,
                   SizeBytes = file.Length,
                   BlobRef = filePath,
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