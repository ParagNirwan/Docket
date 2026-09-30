using System.Security.Claims;
using Docket.Api.Exceptions;
namespace Docket.Api.Services;

public class CurrentUserService
{
    public Guid GetUserId(ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null)
            throw new UnauthenticatedException();
        return Guid.Parse(userIdClaim.Value);
    }
}