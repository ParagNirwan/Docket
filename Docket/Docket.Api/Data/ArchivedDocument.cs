namespace Docket.Api.Data;

public class ArchivedDocument
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required string FileName { get; set; }
    public required string MimeType { get; set; }
    public long SizeBytes { get; set; }
    public required string BlobRef { get; set; }
    public Guid UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }
    public Guid? FolderId { get; set; }
    public DateTime FrozenAt { get; set; }
}