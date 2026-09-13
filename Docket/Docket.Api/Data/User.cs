namespace Docket.Api.Data;

public class User
{
    public Guid Id { get; set; }

    //in real world first name and last name are stored. I am being lazy here but I know how it works.
    public required String FullName { get; set; }
    public required String Email { get; set; }

    public required string PasswordHash { get; set; }
    public DateTime CreatedAt { get; set; }
}