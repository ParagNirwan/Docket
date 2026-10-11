using System.Text.Json.Serialization;

namespace Docket.Api.Models;

public record ApiError(
    string Code,
    string Message,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    IDictionary<string, string[]>? Errors = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? Details = null,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    string? TraceId = null)
{
    public static ApiError Validation(
        IDictionary<string, string[]> errors,
        string message = "One or more validation errors occurred.",
        string? details = "Check the 'errors' property for field-specific validation failures.",
        string? traceId = null) =>
        new("VALIDATION_ERROR", message, errors, details, traceId);

    public static ApiError Conflict(
        string message,
        string? details = null,
        string? traceId = null) =>
        new("CONFLICT", message, null, details, traceId);

    public static ApiError NotFound(
        string message = "The requested resource was not found.",
        string? details = null,
        string? traceId = null) =>
        new("NOT_FOUND", message, null, details, traceId);

    public static ApiError Forbidden(
        string message = "You do not have permission to perform this action.",
        string? details = null,
        string? traceId = null) =>
        new("FORBIDDEN", message, null, details, traceId);

    public static ApiError Unauthorized(
        string message = "Authentication is required to access this resource.",
        string? details = null,
        string? traceId = null) =>
        new("UNAUTHORIZED", message, null, details, traceId);

    public static ApiError BadRequest(
        string message,
        string? details = null,
        string? traceId = null) =>
        new("BAD_REQUEST", message, null, details, traceId);
}
