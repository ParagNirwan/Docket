namespace Docket.Api.Data;

public class User
{
    public Guid Id { get; set; }
    public required String Email { get; set; }

    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
}