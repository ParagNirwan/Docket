using Microsoft.EntityFrameworkCore;
using Docket.Api.Data;

namespace Docket.Api.Services;
// This Service checks whether the current user 
// belongs to the current Tenant
public class TenantAuthorizationService(DocketDbContext db)
{
    public async Task<bool> IsMember(Guid userId, Guid tenantId)
    {
        return await db.TenantMemberships.AnyAsync(
            m => m.UserId == userId && m.TenantId == tenantId
            );
    }
}
