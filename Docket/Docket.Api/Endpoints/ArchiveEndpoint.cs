using Microsoft.EntityFrameworkCore; // Imports EF Core for database operations
using Docket.Api.Data;               // Imports the data namespace (where DocketDbContext lives)
using Docket.Api.Services;           // Imports the services namespace (where TenantAuthorizationService lives)
using System.Security.Claims;        // Imports claims for handling user identity

namespace Docket.Api.Endpoints; // Defines the logical group/namespace for this file

// This is a 'static class'. 
// A static class cannot be instantiated (you can't do 'new ArchiveEndpoint()').
// Because it is static, it does NOT have a constructor.
public static class ArchiveEndpoint
{
    // This is an 'Extension Method'. 
    // The 'this WebApplication app' parameter allows this method to be called 
    // as if it were part of the WebApplication class (e.g., app.MapArchiveEndpoints() in Program.cs).
    public static void MapArchiveEndpoints(this WebApplication app)
    {
        // MapPost defines an HTTP POST endpoint.
        // The string is the URL route. '{tenantId}' is a route parameter that is passed to the handler.
        app.MapPost("/tenant/{tenantId}/documents/upload",
          // This is an 'async lambda function' (an anonymous method).
          // It acts as the request handler that runs when the endpoint is called.
           async (Guid tenantId, DocketDbContext db, TenantAuthorizationService authService, ClaimsPrincipal user, IFormFile file) =>
           {
               // 1. Identify the User: Get the unique ID of the person making the request from their security token
               var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
               if (userIdClaim is null)
                   return Results.Unauthorized(); // Stop here if we can't find who the user is
               
               var userId = Guid.Parse(userIdClaim.Value);

               // 2. Check Permissions: Make sure this user is actually a member of the tenant they are trying to upload to
               var isMember = await authService.IsMember(userId, tenantId);
               if (!isMember)
                   return Results.Forbid(); // Stop here if they aren't allowed in this tenant

               // 3. Validate File: Make sure the user didn't send an empty file
               if (file.Length == 0)
                   return Results.BadRequest("No file uploaded.");

               // 4. Prepare Storage: Create a folder for this specific tenant if it doesn't exist yet
               var uploadsFolder = Path.Combine("uploads", tenantId.ToString());
               Directory.CreateDirectory(uploadsFolder);

               // 5. Avoid Name Clashes: Add a random ID to the filename so two files with the same name don't overwrite each other
               var storedFileName = $"{Guid.NewGuid()}_{file.FileName}";
               var filePath = Path.Combine(uploadsFolder, storedFileName);

               // 6. Save to Disk: Open a stream to the file path and copy the uploaded file data into it
               using (var stream = new FileStream(filePath, FileMode.Create))
               {
                   await file.CopyToAsync(stream);
               }

               // 7. Create Database Record: Save the "metadata" (info about the file) so we can find it later
               var document = new ArchivedDocument
               {
                   Id = Guid.NewGuid(),
                   TenantId = tenantId,
                   FileName = file.FileName,
                   MimeType = file.ContentType,
                   SizeBytes = file.Length,
                   BlobRef = filePath, // Store the path to where the file lives on the disk
                   UploadedByUserId = userId,
                   FrozenAt = DateTime.UtcNow
               };

               // Save the record to the database
               db.ArchivedDocuments.Add(document);
               await db.SaveChangesAsync();

               // 8. Success: Return a '201 Created' status and the location of the new document
               return Results.Created($"/tenant/{tenantId}/documents/{document.Id}", document);

           }
        )
        .RequireAuthorization() // Middleware: Only authenticated users can access this endpoint
        .DisableAntiforgery();  // Middleware: Disables CSRF protection for this specific upload endpoint
    }
}

/*
ASP.NET Core has built-in CSRF (Cross-Site Request Forgery) protection that's automatically stricter for form/file uploads by default. 
Since you're using JWT bearer tokens (not cookies) for authentication, you're not vulnerable to CSRF the same way cookie-based apps are
- CSRF specifically exploits a browser automatically attaching cookies to requests, which doesn't apply to your Authorization header approach. 
This line explicitly opts 
*/