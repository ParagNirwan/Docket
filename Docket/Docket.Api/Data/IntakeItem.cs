namespace Docket.Api.Data;

public enum IntakeStatus
{
    Pending, Approved, Rejected
}

public class IntakeItem
{
public Guid Id { get; set; }
public Guid TenantId { get; set; }
public Tenant? Tenant { get; set; }
public Guid TrayId { get; set; }
public Tray? Tray { get; set; }
public Guid? FolderId { get; set; }
public Folder? Folder { get; set; }
public required string FileName { get; set; }
public required string MimeType { get; set; }
public long SizeBytes { get; set; }
public required string BlobRef { get; set; }
public Guid UploadedByUserId { get; set; }
public User? UploadedByUser { get; set; }
public IntakeStatus Status { get; set; } = IntakeStatus.Pending;
public string? RejectionReason { get; set; }
public DateTime CreatedAt { get; set; }
public DateTime? ReviewedAt { get; set; }
public Guid? ReviewedByUserId { get; set; }
public User? ReviewedByUser { get; set; }
}