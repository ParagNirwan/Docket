using Microsoft.EntityFrameworkCore;
using Docket.Api.Endpoints;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.AddNpgsqlDbContext<Docket.Api.Data.DocketDbContext>("docketdb");
builder.Services.AddScoped<Docket.Api.Services.CurrentUserService>();
builder.Services.AddOpenApi();
builder.Services.AddScoped<Docket.Api.Services.TenantAuthorizationService>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient",
    policy =>
    {
        policy.WithOrigins("http://localhost:9000", "http://localhost:5173")
    .AllowAnyHeader().AllowAnyMethod();
    });
});
//JWT System
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});
builder.Services.AddAuthorization();
builder.Services.AddExceptionHandler<Docket.Api.ExceptionHandling.UnauthenticatedExceptionHandler>(); 
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseExceptionHandler(); 

//Run EF Migrations automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<Docket.Api.Data.DocketDbContext>();
    db.Database.Migrate();
}


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowClient");

app.UseAuthentication();
app.UseAuthorization();


//calling endpoints 
app.MapDocumentEndpoints();
app.MapAuthEndpoints();
app.MapTenantEndpoints();
app.MapArchiveEndpoints();
app.MapTrayEndpoints();
app.MapFolderEndpoints();


app.Run();


