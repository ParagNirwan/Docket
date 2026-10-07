namespace Docket.Api.Models;

public record ApiError(string Code, string Message, string? Details = null);
