using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;

namespace Docket.Api.Endpoints;

public static class DocumentEndpoints
{

    public static void MapDocumentEndpoints(this WebApplication app)
    {
        app.MapGet("/documents", async (DocketDbContext db) =>
        {
            var docs = await db.ArchivedDocuments.ToListAsync();
            return Results.Ok(docs);
        });

        app.MapPost("/document", async (DocketDbContext db, ArchivedDocument newDoc) =>
        {
            newDoc.Id = Guid.NewGuid();
            newDoc.FrozenAt = DateTime.UtcNow;
            db.ArchivedDocuments.Add(newDoc); await db.SaveChangesAsync();
            return Results.Created($"/documents/{newDoc.Id}", newDoc);
        });
    }
}