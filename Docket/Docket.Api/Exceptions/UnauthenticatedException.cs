namespace Docket.Api.Exceptions;

public class UnauthenticatedException : Exception
{
    public UnauthenticatedException() :
    base("No valid user identity found on this request.")
    {

    }
}
