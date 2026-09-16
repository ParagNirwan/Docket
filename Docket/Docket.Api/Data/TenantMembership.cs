namespace Docket.Api.Data;

public enum TenantRole
{
    Owner,
    Admin,
    Member,

}

public class TenantMembership
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid TenantId { get; set; }

    public Tenant? Tenant { get; set; }

    public TenantRole Role { get; set; }
    public DateTime CreatedAt { get; set; }
}