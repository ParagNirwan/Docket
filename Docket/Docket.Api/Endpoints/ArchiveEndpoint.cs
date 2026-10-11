using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using System.Security.Claims;
using Docket.Api.Storage;
using Docket.Api.Models;

namespace Docket.Api.Endpoints;

public static class ArchiveEndpoint
{
    private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

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
               IFormFile? file,
               HttpContext ctx) =>
           {
               var userId = currentUserService.GetUserId(user);

               var isMember = await authService.IsMember(userId, tenantId);
               if (!isMember)
               {
                   return Results.Json(
                       ApiError.Forbidden("You do not have permission to upload documents in this tenant.", traceId: ctx.TraceIdentifier),
                       statusCode: StatusCodes.Status403Forbidden);
               }

               var trayExists = await db.Trays.AnyAsync(t => t.Id == trayId && t.TenantId == tenantId);
               if (!trayExists)
               {
                   return Results.NotFound(ApiError.NotFound("Destination tray was not found.", traceId: ctx.TraceIdentifier));
               }

               if (file == null || file.Length == 0)
               {
                   return Results.BadRequest(ApiError.BadRequest(
                       "Please select a valid, non-empty file to upload.",
                       details: "File form-data field was missing or had 0 bytes.",
                       traceId: ctx.TraceIdentifier));
               }

               if (file.Length > MaxFileSizeBytes)
               {
                   return Results.BadRequest(ApiError.BadRequest(
                       $"File exceeds the maximum upload size of {MaxFileSizeBytes / 1024 / 1024} MB.",
                       details: $"Received file size: {file.Length} bytes. Maximum allowed: {MaxFileSizeBytes} bytes.",
                       traceId: ctx.TraceIdentifier));
               }

               var safeName = Path.GetFileName(file.FileName);
               if (string.IsNullOrWhiteSpace(safeName))
               {
                   return Results.BadRequest(ApiError.BadRequest(
                       "Invalid file name.",
                       details: "File name cannot be empty.",
                       traceId: ctx.TraceIdentifier));
               }

               var blobKey = $"{tenantId}/{Guid.NewGuid()}_{safeName}";

               await using var stream = file.OpenReadStream();
               var blobRef = await blobStore.SaveAsync(blobKey, stream, file.ContentType);

               var document = new ArchivedDocument
               {
                   Id = Guid.NewGuid(),
                   TenantId = tenantId,
                   TrayId = trayId,
                   FileName = safeName,
                   MimeType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
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
            Guid? folderId,
            CurrentUserService currentUserService,
            DocketDbContext db,
            TenantAuthorizationService authService,
            ClaimsPrincipal user,
            HttpContext ctx) =>
        {
            var userId = currentUserService.GetUserId(user);

            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember)
            {
                return Results.Json(
                    ApiError.Forbidden("You do not have access to view documents in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

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