namespace Docket.Api.Data;

public enum IntakeStatus
{
    Pending, Approved, Rejected
}

public class IntakeItem
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid TrayId { get; set; }
    public string FileName { get; set; }
    public string MimeType { get; set; }
    public long SizeBytes { get; set; }
    public string BlobRef { get; set; }
    public Guid UploadedByUserId { get; set; }
    public IntakeStatus Status { get; set; } // Pending, Approved, Rejected
    public string? RejectionReason { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedByUserId { get; set; }
}