using Microsoft.AspNetCore.Diagnostics;
using Docket.Api.Exceptions;
namespace Docket.Api.ExceptionHandling;

public class UnauthenticatedExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool>
    TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not UnauthenticatedException) return false; // not ours to handle - let something else deal with it 
        httpContext.Response.StatusCode = StatusCodes.Status401Unauthorized;
        await httpContext.Response.WriteAsJsonAsync(new
        {
            error = exception.Message
        }, cancellationToken);
        return true; // we handled it 
    }
}