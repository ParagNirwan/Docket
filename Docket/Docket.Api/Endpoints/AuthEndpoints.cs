using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Docket.Api.Models;
using Docket.Api.Validation;

namespace Docket.Api.Endpoints;

public record RegisterRequest(string Email, string Password, string FullName);
public record LoginRequest(string Email, string Password);

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/auth/register", async (DocketDbContext db, RegisterRequest req, HttpContext ctx) =>
        {
            var exists = await db.Users.AnyAsync(u => u.Email == req.Email);
            if (exists)
            {
                var error = ApiError.Conflict(
                    message: "An account with this email address already exists. Please log in instead or use another email.",
                    details: "Unique constraint violated on Users.Email.",
                    traceId: ctx.TraceIdentifier);

                return Results.Conflict(error);
            }

            var user = new User
            {
                FullName = req.FullName.Trim(),
                Id = Guid.NewGuid(),
                Email = req.Email.Trim().ToLowerInvariant(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                CreatedAt = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Created($"/users/{user.Id}", new { user.Id, user.Email, user.FullName });
        })
        .WithValidation<RegisterRequest>();

        app.MapPost("/auth/login", async (DocketDbContext db, IConfiguration config, LoginRequest req, HttpContext ctx) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email.Trim().ToLowerInvariant());
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            {
                var error = ApiError.Unauthorized(
                    message: "Invalid email or password. Please verify your credentials and try again.",
                    details: "BCrypt verification failed or user was not found.",
                    traceId: ctx.TraceIdentifier);

                return Results.Json(error, statusCode: StatusCodes.Status401Unauthorized);
            }

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(2), signingCredentials: creds);

            return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        })
        .WithValidation<LoginRequest>();
    }
}