namespace Docket.Api.Storage;

public interface IBlobStore
{
    // Saves the content under the given key and returns the reference to store in BlobRef. 
    Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken cancellationToken = default);
}