using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;
using Docket.Api.Storage;
using Docket.Api.Models;
using Docket.Api.Validation;

namespace Docket.Api.Endpoints;

// Data structures for requests
public record ApproveIntakeRequest(Guid? FolderId = null);
public record RejectIntakeRequest(string Reason);
public record BulkApproveRequest(List<Guid> ItemIds);
public record BulkRejectRequest(List<Guid> ItemIds, string Reason);

public static class IntakeEndpoints
{
    private const long MaxFileSizeBytes = 50 * 1024 * 1024; // 50 MB

    public static void MapIntakeEndpoints(this WebApplication app)
    {
        // Upload file to staged IntakeItem (with optional folder)
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/intake/upload", async (
            Guid tenantId,
            Guid trayId,
            Guid? folderId,
            IFormFile? file,
            IBlobStore blobStore,
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
                    ApiError.Forbidden("You do not have permission to upload files to this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var trayExists = await db.Trays.AnyAsync(t => t.Id == trayId && t.TenantId == tenantId);
            if (!trayExists)
            {
                return Results.NotFound(ApiError.NotFound("Destination tray was not found.", traceId: ctx.TraceIdentifier));
            }

            if (folderId.HasValue)
            {
                var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == folderId.Value && f.TenantId == tenantId);
                if (folder == null)
                {
                    return Results.NotFound(ApiError.NotFound("Destination folder was not found.", traceId: ctx.TraceIdentifier));
                }
                if (folder.TrayId != trayId)
                {
                    return Results.BadRequest(ApiError.BadRequest(
                        "The destination folder does not belong to the selected tray.",
                        details: $"Folder.TrayId '{folder.TrayId}' != target tray '{trayId}'.",
                        traceId: ctx.TraceIdentifier));
                }
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
                    details: "File name cannot be empty or solely whitespace.",
                    traceId: ctx.TraceIdentifier));
            }

            var blobKey = $"{tenantId}/{Guid.NewGuid()}_{safeName}";

            await using var stream = file.OpenReadStream();
            var blobRef = await blobStore.SaveAsync(blobKey, stream, file.ContentType);

            var intakeItem = new IntakeItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TrayId = trayId,
                FolderId = folderId,
                FileName = safeName,
                MimeType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                SizeBytes = file.Length,
                BlobRef = blobRef,
                UploadedByUserId = userId,
                Status = IntakeStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            db.IntakeItems.Add(intakeItem);
            await db.SaveChangesAsync();

            return Results.Created($"/tenant/{tenantId}/intake/{intakeItem.Id}", intakeItem);
        })
        .RequireAuthorization()
        .DisableAntiforgery();

        // List intake items (filtered by tray, folder, or status)
        app.MapGet("/tenant/{tenantId}/intake", async (
            Guid tenantId,
            Guid? trayId,
            Guid? folderId,
            IntakeStatus? status,
            int? page,
            int? pageSize,
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
                    ApiError.Forbidden("You do not have access to view intake items in this tenant.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var query = db.IntakeItems.Where(i => i.TenantId == tenantId);

            if (status.HasValue)
            {
                query = query.Where(i => i.Status == status.Value);
            }
            else
            {
                query = query.Where(i => i.Status == IntakeStatus.Pending);
            }

            if (trayId.HasValue)
            {
                query = query.Where(i => i.TrayId == trayId.Value);
            }

            if (folderId.HasValue)
            {
                query = query.Where(i => i.FolderId == folderId.Value);
            }

            var p = page.GetValueOrDefault(1);
            if (p < 1) p = 1;
            var ps = pageSize.GetValueOrDefault(50);
            if (ps < 1 || ps > 100) ps = 50;

            var items = await query
                .OrderByDescending(i => i.CreatedAt)
                .Skip((p - 1) * ps)
                .Take(ps)
                .Select(i => new
                {
                    i.Id,
                    i.TenantId,
                    i.TrayId,
                    TrayName = i.Tray != null ? i.Tray.Name : null,
                    i.FolderId,
                    FolderName = i.Folder != null ? i.Folder.Name : null,
                    i.FileName,
                    i.MimeType,
                    i.SizeBytes,
                    i.BlobRef,
                    i.UploadedByUserId,
                    i.Status,
                    i.RejectionReason,
                    i.CreatedAt,
                    i.ReviewedAt,
                    i.ReviewedByUserId
                })
                .ToListAsync();

            return Results.Ok(items);
        })
        .RequireAuthorization();

        // Approve single intake item -> freeze to ArchivedDocument
        app.MapPost("/tenant/{tenantId}/intake/{itemId}/approve", async (
            Guid tenantId,
            Guid itemId,
            ApproveIntakeRequest? req,
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
                    ApiError.Forbidden("You do not have permission to approve intake documents.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var item = await db.IntakeItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
            if (item == null)
            {
                return Results.NotFound(ApiError.NotFound("Intake item was not found.", traceId: ctx.TraceIdentifier));
            }

            if (item.Status != IntakeStatus.Pending)
            {
                return Results.BadRequest(ApiError.BadRequest(
                    $"This document cannot be approved because its current status is '{item.Status}'. Only pending documents can be approved.",
                    details: $"Item {itemId} has Status={item.Status}.",
                    traceId: ctx.TraceIdentifier));
            }

            var targetFolderId = req?.FolderId ?? item.FolderId;
            if (req?.FolderId != null)
            {
                var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == req.FolderId.Value && f.TenantId == tenantId);
                if (folder == null)
                {
                    return Results.NotFound(ApiError.NotFound("Target folder was not found.", traceId: ctx.TraceIdentifier));
                }
                if (folder.TrayId != item.TrayId)
                {
                    return Results.BadRequest(ApiError.BadRequest(
                        "The target folder does not belong to this item's tray.",
                        details: $"Folder.TrayId '{folder.TrayId}' != Item.TrayId '{item.TrayId}'.",
                        traceId: ctx.TraceIdentifier));
                }
            }

            var archivedDoc = new ArchivedDocument
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TrayId = item.TrayId,
                FolderId = targetFolderId,
                FileName = item.FileName,
                MimeType = item.MimeType,
                SizeBytes = item.SizeBytes,
                BlobRef = item.BlobRef,
                UploadedByUserId = item.UploadedByUserId,
                FrozenAt = DateTime.UtcNow
            };

            db.ArchivedDocuments.Add(archivedDoc);

            item.Status = IntakeStatus.Approved;
            item.FolderId = targetFolderId;
            item.ReviewedAt = DateTime.UtcNow;
            item.ReviewedByUserId = userId;

            await db.SaveChangesAsync();

            return Results.Ok(archivedDoc);
        })
        .RequireAuthorization();

        // Reject single intake item
        app.MapPost("/tenant/{tenantId}/intake/{itemId}/reject", async (
            Guid tenantId,
            Guid itemId,
            RejectIntakeRequest req,
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
                    ApiError.Forbidden("You do not have permission to reject intake documents.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var item = await db.IntakeItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
            if (item == null)
            {
                return Results.NotFound(ApiError.NotFound("Intake item was not found.", traceId: ctx.TraceIdentifier));
            }

            if (item.Status != IntakeStatus.Pending)
            {
                return Results.BadRequest(ApiError.BadRequest(
                    $"This document cannot be rejected because its current status is '{item.Status}'. Only pending documents can be rejected.",
                    details: $"Item {itemId} has Status={item.Status}.",
                    traceId: ctx.TraceIdentifier));
            }

            item.Status = IntakeStatus.Rejected;
            item.RejectionReason = req.Reason.Trim();
            item.ReviewedAt = DateTime.UtcNow;
            item.ReviewedByUserId = userId;

            await db.SaveChangesAsync();

            return Results.Ok(item);
        })
        .RequireAuthorization()
        .WithValidation<RejectIntakeRequest>();

        // Bulk approve intake items
        app.MapPost("/tenant/{tenantId}/intake/bulk-approve", async (
            Guid tenantId,
            BulkApproveRequest req,
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
                    ApiError.Forbidden("You do not have permission to approve intake documents.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var items = await db.IntakeItems
                .Where(i => i.TenantId == tenantId && req.ItemIds.Contains(i.Id) && i.Status == IntakeStatus.Pending)
                .ToListAsync();

            if (items.Count == 0)
            {
                return Results.BadRequest(ApiError.BadRequest(
                    "None of the selected documents are currently in 'Pending' status.",
                    details: "0 documents matched the selection criteria.",
                    traceId: ctx.TraceIdentifier));
            }

            var now = DateTime.UtcNow;
            foreach (var item in items)
            {
                var archivedDoc = new ArchivedDocument
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    TrayId = item.TrayId,
                    FolderId = item.FolderId,
                    FileName = item.FileName,
                    MimeType = item.MimeType,
                    SizeBytes = item.SizeBytes,
                    BlobRef = item.BlobRef,
                    UploadedByUserId = item.UploadedByUserId,
                    FrozenAt = now
                };

                db.ArchivedDocuments.Add(archivedDoc);

                item.Status = IntakeStatus.Approved;
                item.ReviewedAt = now;
                item.ReviewedByUserId = userId;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new { ApprovedCount = items.Count });
        })
        .RequireAuthorization()
        .WithValidation<BulkApproveRequest>();

        // Bulk reject intake items
        app.MapPost("/tenant/{tenantId}/intake/bulk-reject", async (
            Guid tenantId,
            BulkRejectRequest req,
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
                    ApiError.Forbidden("You do not have permission to reject intake documents.", traceId: ctx.TraceIdentifier),
                    statusCode: StatusCodes.Status403Forbidden);
            }

            var items = await db.IntakeItems
                .Where(i => i.TenantId == tenantId && req.ItemIds.Contains(i.Id) && i.Status == IntakeStatus.Pending)
                .ToListAsync();

            if (items.Count == 0)
            {
                return Results.BadRequest(ApiError.BadRequest(
                    "None of the selected documents are currently in 'Pending' status.",
                    details: "0 documents matched the selection criteria.",
                    traceId: ctx.TraceIdentifier));
            }

            var now = DateTime.UtcNow;
            var reason = req.Reason.Trim();
            foreach (var item in items)
            {
                item.Status = IntakeStatus.Rejected;
                item.RejectionReason = reason;
                item.ReviewedAt = now;
                item.ReviewedByUserId = userId;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new { RejectedCount = items.Count });
        })
        .RequireAuthorization()
        .WithValidation<BulkRejectRequest>();
    }
}
