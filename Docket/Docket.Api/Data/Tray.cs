namespace Docket.Api.Data;

public class Tray
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Tenant? Tenant { get; set; }
    public required string Name { get; set; }
    public DateTime CreatedAt { get; set; }
}