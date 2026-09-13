using Microsoft.EntityFrameworkCore; //Imports Entity Framework Core funtionality 
namespace Docket.Api.Data;

//Every Entity/Data class here becomes a table, without it EFCore wouldnt know it should be a part of DB

//DbContext is the main connection between application and Database
/*
Your API
   ↓
DocketDbContext
   ↓
Entity Framework Core
   ↓
PostgreSQL (or any other db, but i use postgres.)
*/
public class DocketDbContext(DbContextOptions<DocketDbContext> options /* Modern C# Constructor */ ) : DbContext(options) //options contains config info like db provider, conn. string and which db 
{
    public DbSet<ArchivedDocument> ArchivedDocuments => Set<ArchivedDocument>(); //Getter, Set is a method of DbContext. 
    public DbSet<User> Users => Set<User>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<TenantMembership> TenantMemberships => Set<TenantMembership>();
}