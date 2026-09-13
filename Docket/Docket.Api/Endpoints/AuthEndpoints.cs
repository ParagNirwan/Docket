using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace Docket.Api.Endpoints;

public record RegisterRequest(string Email, string Password, string FullName); //A record is a special kind of C# type designed mainly for holding data and passing around in requests.
public record LoginRequest(string Email, string Password);
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        app.MapPost("/auth/register", async (DocketDbContext db, RegisterRequest req) =>
        {
            var exists = await db.Users.AnyAsync(u => u.Email == req.Email);
            if (exists) return Results.Conflict("Email already registered.");
            var user = new User
            {
                FullName = req.FullName,
                Id = Guid.NewGuid(),
                Email = req.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                CreatedAt = DateTime.UtcNow
            }; db.Users.Add(user); await db.SaveChangesAsync();
            return Results.Created($"/users/{user.Id}", new { user.Id, user.Email });
        });


        app.MapPost("/auth/login", async (DocketDbContext db, IConfiguration config, LoginRequest req) =>
        {
            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
            if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Unauthorized(); var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub,
            user.Id.ToString()), new Claim(JwtRegisteredClaimNames.Email, user.Email) };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!)); 
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(claims: claims, expires: DateTime.UtcNow.AddHours(2), signingCredentials: creds); 
            return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        });
    }
}