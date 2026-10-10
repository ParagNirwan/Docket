using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Docket.Api.Services;

namespace Docket.Api.Endpoints;

// Data structures for requests
public record ApproveIntakeRequest(Guid? FolderId = null);
public record RejectIntakeRequest(string Reason);
public record BulkApproveRequest(List<Guid> ItemIds);
public record BulkRejectRequest(List<Guid> ItemIds, string Reason);

public static class IntakeEndpoints
{
    public static void MapIntakeEndpoints(this WebApplication app)
    {
        // Upload file to staged IntakeItem (with optional folder)
        app.MapPost("/tenant/{tenantId}/trays/{trayId}/intake/upload", async (
            Guid tenantId,
            Guid trayId,
            Guid? folderId,
            IFormFile file,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            // Check if the user is allowed to access this tenant
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            // Make sure the tray exists for this tenant
            var trayExists = await db.Trays.AnyAsync(t => t.Id == trayId && t.TenantId == tenantId);
            if (!trayExists) return Results.NotFound("Tray not found.");

            // If a folder was specified, make sure it's valid and belongs to the tray
            if (folderId.HasValue)
            {
                var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == folderId.Value && f.TenantId == tenantId);
                if (folder == null) return Results.NotFound("Folder not found.");
                if (folder.TrayId != trayId) return Results.BadRequest("Folder does not belong to the specified tray.");
            }

            // Ensure a file was actually sent
            if (file == null || file.Length == 0)
                return Results.BadRequest("No file uploaded.");

            // Save the physical file to the server's storage
            var uploadsFolder = Path.Combine("uploads", tenantId.ToString());
            Directory.CreateDirectory(uploadsFolder);

            var storedFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsFolder, storedFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create a record in the database to track this "pending" document
            var intakeItem = new IntakeItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                TrayId = trayId,
                FolderId = folderId,
                FileName = file.FileName,
                MimeType = file.ContentType,
                SizeBytes = file.Length,
                BlobRef = filePath,
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
            ClaimsPrincipal user) =>
        {
            // Check if the user is allowed to access this tenant
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            // Start building the list of documents to show
            var query = db.IntakeItems.Where(i => i.TenantId == tenantId);

            // Apply filters if the user provided any
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

            // Handle pagination (showing a specific "page" of results)
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
            ClaimsPrincipal user) =>
        {
            // Check if the user is allowed to access this tenant
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            // Find the specific item and make sure it's still waiting for approval
            var item = await db.IntakeItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
            if (item == null) return Results.NotFound("Intake item not found.");
            if (item.Status != IntakeStatus.Pending) return Results.BadRequest("Only pending items can be approved.");

            // Determine which folder the document should end up in
            var targetFolderId = req?.FolderId ?? item.FolderId;
            if (req?.FolderId != null)
            {
                var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == req.FolderId.Value && f.TenantId == tenantId);
                if (folder == null) return Results.NotFound("Target folder not found.");
                if (folder.TrayId != item.TrayId) return Results.BadRequest("Folder does not belong to the item's tray.");
            }

            // Create a permanent record in the archive (this "freezes" the document)
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

            // Mark the original intake item as approved
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
            ClaimsPrincipal user) =>
        {
            // Check if the user is allowed to access this tenant
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            // Find the specific item and make sure it's still waiting for approval
            var item = await db.IntakeItems.FirstOrDefaultAsync(i => i.Id == itemId && i.TenantId == tenantId);
            if (item == null) return Results.NotFound("Intake item not found.");
            if (item.Status != IntakeStatus.Pending) return Results.BadRequest("Only pending items can be rejected.");

            // Ensure a reason for rejection was provided
            if (string.IsNullOrWhiteSpace(req.Reason))
                return Results.BadRequest("Rejection reason is required.");

            // Mark the item as rejected and record the reason
            item.Status = IntakeStatus.Rejected;
            item.RejectionReason = req.Reason;
            item.ReviewedAt = DateTime.UtcNow;
            item.ReviewedByUserId = userId;

            await db.SaveChangesAsync();

            return Results.Ok(item);
        })
        .RequireAuthorization();

        // Bulk approve intake items
        app.MapPost("/tenant/{tenantId}/intake/bulk-approve", async (
            Guid tenantId,
            BulkApproveRequest req,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            if (req.ItemIds == null || req.ItemIds.Count == 0)
                return Results.BadRequest("No item IDs provided.");

            var items = await db.IntakeItems
                .Where(i => i.TenantId == tenantId && req.ItemIds.Contains(i.Id) && i.Status == IntakeStatus.Pending)
                .ToListAsync();

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
        .RequireAuthorization();

        // Bulk reject intake items
        app.MapPost("/tenant/{tenantId}/intake/bulk-reject", async (
            Guid tenantId,
            BulkRejectRequest req,
            CurrentUserService currentUserService,
            TenantAuthorizationService authService,
            DocketDbContext db,
            ClaimsPrincipal user) =>
        {
            var userId = currentUserService.GetUserId(user);
            var isMember = await authService.IsMember(userId, tenantId);
            if (!isMember) return Results.Forbid();

            if (req.ItemIds == null || req.ItemIds.Count == 0)
                return Results.BadRequest("No item IDs provided.");

            if (string.IsNullOrWhiteSpace(req.Reason))
                return Results.BadRequest("Rejection reason is required.");

            var items = await db.IntakeItems
                .Where(i => i.TenantId == tenantId && req.ItemIds.Contains(i.Id) && i.Status == IntakeStatus.Pending)
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var item in items)
            {
                item.Status = IntakeStatus.Rejected;
                item.RejectionReason = req.Reason;
                item.ReviewedAt = now;
                item.ReviewedByUserId = userId;
            }

            await db.SaveChangesAsync();

            return Results.Ok(new { RejectedCount = items.Count });
        })
        .RequireAuthorization();
    }
}
