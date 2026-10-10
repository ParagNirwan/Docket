namespace Docket.Api.Storage;

public class LocalBlobStore : IBlobStore
{
    private const string RootFolder = "uploads";
    public async Task<string> SaveAsync(string key, Stream content, string contentType, CancellationToken cancellationToken = default)
    {
        var fullPath = Path.Combine(RootFolder, key);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        await using var file = new FileStream(fullPath, FileMode.Create);
        await content.CopyToAsync(file, cancellationToken);
        return key;
    }
}