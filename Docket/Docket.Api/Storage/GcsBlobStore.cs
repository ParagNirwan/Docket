using Google.Cloud.Storage.V1;
namespace Docket.Api.Storage;

public class GcsBlobStore(StorageClient client, IConfiguration configuration) : IBlobStore
{
    private readonly string _bucket = configuration["Storage:Bucket"] ?? throw new InvalidOperationException("Storage:Bucket is not configured.");
    public async Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        await client.UploadObjectAsync(_bucket, key, contentType, content, cancellationToken: cancellationToken);
        return key;
    }
}