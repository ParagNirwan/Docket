namespace Docket.Api.Data;

public class Folder
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid TrayId { get; set; }
    public Tray? Tray { get; set; }
    public Guid? ParentFolderId { get; set; }
    public Folder? ParentFolder { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}