namespace Docket.Api.Data;

public class Tenant
{
    public Guid Id { get; set; }
    public required String Name { get; set; }
    public required String Slug { get; set; }
    public DateTime CreatedAt { get; set; }

}