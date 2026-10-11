using FluentValidation;
using Docket.Api.Models;

namespace Docket.Api.Validation;

public class ValidationFilter<T> : IEndpointFilter where T : class
{
    private readonly IValidator<T>? _validator;

    public ValidationFilter(IValidator<T>? validator = null)
    {
        _validator = validator;
    }

    public async ValueTask<object?> InvokeAsync(
        EndpointFilterInvocationContext context,
        EndpointFilterDelegate next)
    {
        if (_validator is null)
        {
            return await next(context);
        }

        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
        {
            return Results.BadRequest(ApiError.BadRequest(
                message: "Request body cannot be empty.",
                details: $"Expected request payload of type '{typeof(T).Name}'.",
                traceId: context.HttpContext.TraceIdentifier));
        }

        var validationResult = await _validator.ValidateAsync(argument, context.HttpContext.RequestAborted);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors
                .GroupBy(e => e.PropertyName, e => e.ErrorMessage)
                .ToDictionary(
                    g => ToCamelCase(g.Key),
                    g => g.ToArray(),
                    StringComparer.OrdinalIgnoreCase);

            var apiError = ApiError.Validation(
                errors: errors,
                message: "Please correct the highlighted fields and try again.",
                details: $"Validation failed for {typeof(T).Name} on {errors.Count} field(s).",
                traceId: context.HttpContext.TraceIdentifier);

            return Results.BadRequest(apiError);
        }

        return await next(context);
    }

    private static string ToCamelCase(string str)
    {
        if (string.IsNullOrEmpty(str)) return str;
        if (str.Length == 1) return str.ToLowerInvariant();
        return char.ToLowerInvariant(str[0]) + str.Substring(1);
    }
}

public static class RouteHandlerBuilderValidationExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class
    {
        return builder.AddEndpointFilter<ValidationFilter<T>>();
    }
}

