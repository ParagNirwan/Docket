using FluentValidation;
using Docket.Api.Endpoints;

namespace Docket.Api.Validation;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("Please enter a valid email address (e.g., user@example.com).")
            .MaximumLength(255).WithMessage("Email cannot exceed 255 characters.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
            .Matches(@"[A-Za-z]").WithMessage("Password must contain at least one letter.")
            .Matches(@"[0-9]|[^a-zA-Z0-9]").WithMessage("Password must contain at least one number or special symbol.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full Name is required.")
            .MinimumLength(2).WithMessage("Full Name must be at least 2 characters long.")
            .MaximumLength(100).WithMessage("Full Name cannot exceed 100 characters.")
            .Matches(@"^[\p{L}\s\-']+$").WithMessage("Full Name can only contain letters, spaces, hyphens, and apostrophes.");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email address is required.")
            .EmailAddress().WithMessage("Please enter a valid email address.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}

public class CreateTenantRequestValidator : AbstractValidator<CreateTenantRequest>
{
    public CreateTenantRequestValidator()
    {
        RuleFor(x => x.name)
            .NotEmpty().WithMessage("Organization name is required.")
            .MinimumLength(3).WithMessage("Organization name must be at least 3 characters long.")
            .MaximumLength(80).WithMessage("Organization name cannot exceed 80 characters.");

        RuleFor(x => x.slug)
            .NotEmpty().WithMessage("Organization slug is required.")
            .MinimumLength(3).WithMessage("Slug must be at least 3 characters long.")
            .MaximumLength(50).WithMessage("Slug cannot exceed 50 characters.")
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug can only contain lowercase letters, numbers, and single hyphens (e.g., 'acme-corp').");
    }
}

public class CreateTrayRequestValidator : AbstractValidator<CreateTrayRequest>
{
    public CreateTrayRequestValidator()
    {
        RuleFor(x => x.name)
            .NotEmpty().WithMessage("Tray name is required.")
            .MinimumLength(2).WithMessage("Tray name must be at least 2 characters long.")
            .MaximumLength(60).WithMessage("Tray name cannot exceed 60 characters.");
    }
}

public class CreateFolderRequestValidator : AbstractValidator<CreateFolderRequest>
{
    public CreateFolderRequestValidator()
    {
        RuleFor(x => x.name)
            .NotEmpty().WithMessage("Folder name is required.")
            .MinimumLength(1).WithMessage("Folder name cannot be empty.")
            .MaximumLength(100).WithMessage("Folder name cannot exceed 100 characters.")
            .Must(name => !name.Contains('/') && !name.Contains('\\'))
            .WithMessage("Folder name cannot contain slashes ('/' or '\\').");
    }
}

public class RejectIntakeRequestValidator : AbstractValidator<RejectIntakeRequest>
{
    public RejectIntakeRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A rejection reason is required so the uploader knows why.")
            .MinimumLength(3).WithMessage("Rejection reason must be at least 3 characters long.")
            .MaximumLength(500).WithMessage("Rejection reason cannot exceed 500 characters.");
    }
}

public class BulkApproveRequestValidator : AbstractValidator<BulkApproveRequest>
{
    public BulkApproveRequestValidator()
    {
        RuleFor(x => x.ItemIds)
            .NotEmpty().WithMessage("At least one document must be selected.")
            .Must(ids => ids != null && ids.Count <= 100).WithMessage("Cannot approve more than 100 documents at once.");

        RuleForEach(x => x.ItemIds)
            .NotEmpty().WithMessage("Selected document ID cannot be empty.");
    }
}

public class BulkRejectRequestValidator : AbstractValidator<BulkRejectRequest>
{
    public BulkRejectRequestValidator()
    {
        RuleFor(x => x.ItemIds)
            .NotEmpty().WithMessage("At least one document must be selected.")
            .Must(ids => ids != null && ids.Count <= 100).WithMessage("Cannot reject more than 100 documents at once.");

        RuleForEach(x => x.ItemIds)
            .NotEmpty().WithMessage("Selected document ID cannot be empty.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A rejection reason is required.")
            .MinimumLength(3).WithMessage("Rejection reason must be at least 3 characters long.")
            .MaximumLength(500).WithMessage("Rejection reason cannot exceed 500 characters.");
    }
}

