namespace Docket.Api.Data;

public class ArchivedDocument
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public DateTime FrozenAt { get; set; }
}