using Microsoft.AspNetCore.Diagnostics;
using Docket.Api.Models;
using Docket.Api.Exceptions;
using System.Net;

namespace Docket.Api.ExceptionHandling;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        // Explicitly type the tuple to resolve CS8130/CS8131
        (HttpStatusCode statusCode, string errorCode, string message) = exception switch
        {
            NotFoundException ex => (HttpStatusCode.NotFound, "NOT_FOUND", ex.Message),
            ValidationException ex => (HttpStatusCode.BadRequest, "VALIDATION_ERROR", ex.Message),
            ForbiddenException ex => (HttpStatusCode.Forbidden, "FORBIDDEN", ex.Message),
            UnauthenticatedException ex => (HttpStatusCode.Unauthorized, "UNAUTHENTICATED", ex.Message),
            _ => (HttpStatusCode.InternalServerError, "INTERNAL_SERVER_ERROR", "An unexpected error occurred on the server.")
        };

        var errorResponse = new ApiError(errorCode, message, 
            statusCode == HttpStatusCode.InternalServerError ? null : exception.Message);

        httpContext.Response.StatusCode = (int)statusCode;
        await httpContext.Response.WriteAsJsonAsync(errorResponse, cancellationToken);

        return true;
    }
}
