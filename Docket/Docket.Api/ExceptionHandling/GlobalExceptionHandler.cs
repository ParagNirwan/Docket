using System.Net;
using Microsoft.AspNetCore.Diagnostics;
using Docket.Api.Models;
using Docket.Api.Exceptions;

namespace Docket.Api.ExceptionHandling;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;
    private readonly IHostEnvironment _env;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment env)
    {
        _logger = logger;
        _env = env;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var traceId = httpContext.TraceIdentifier;

        ApiError errorResponse;
        HttpStatusCode statusCode;

        if (exception is FluentValidation.ValidationException fvEx)
        {
            statusCode = HttpStatusCode.BadRequest;
            var errors = fvEx.Errors
                .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
                .ToDictionary(
                    g => ToCamelCase(g.Key),
                    g => g.ToArray(),
                    StringComparer.OrdinalIgnoreCase);

            errorResponse = ApiError.Validation(
                errors: errors,
                message: "Please correct the highlighted fields and try again.",
                details: _env.IsDevelopment() ? fvEx.Message : null,
                traceId: traceId);
        }
        else if (exception is ValidationException vEx)
        {
            statusCode = HttpStatusCode.BadRequest;
            errorResponse = ApiError.BadRequest(
                message: vEx.Message,
                details: _env.IsDevelopment() ? "Thrown as custom ValidationException" : null,
                traceId: traceId);
        }
        else if (exception is NotFoundException nfEx)
        {
            statusCode = HttpStatusCode.NotFound;
            errorResponse = ApiError.NotFound(
                message: nfEx.Message,
                details: _env.IsDevelopment() ? "Resource not found in database or storage." : null,
                traceId: traceId);
        }
        else if (exception is ForbiddenException fbEx)
        {
            statusCode = HttpStatusCode.Forbidden;
            errorResponse = ApiError.Forbidden(
                message: fbEx.Message,
                details: _env.IsDevelopment() ? "User does not have required permissions/role." : null,
                traceId: traceId);
        }
        else if (exception is UnauthenticatedException unEx)
        {
            statusCode = HttpStatusCode.Unauthorized;
            errorResponse = ApiError.Unauthorized(
                message: unEx.Message,
                details: _env.IsDevelopment() ? "Valid JWT bearer token required." : null,
                traceId: traceId);
        }
        else
        {
            statusCode = HttpStatusCode.InternalServerError;
            errorResponse = new ApiError(
                Code: "INTERNAL_SERVER_ERROR",
                Message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
                Errors: null,
                Details: _env.IsDevelopment() ? exception.ToString() : null,
                TraceId: traceId);
        }

        httpContext.Response.StatusCode = (int)statusCode;
        await httpContext.Response.WriteAsJsonAsync(errorResponse, cancellationToken);

        return true;
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;
        if (str.Length == 1) return str.ToLowerInvariant();
        return char.ToLowerInvariant(str[0]) + str.Substring(1);
    }
}
