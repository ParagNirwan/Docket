using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docket.Api.Migrations
{
    /// <inheritdoc />
    public partial class RenameCreatedAtCasing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "createdAt",
                table: "Tenants",
                newName: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Tenants",
                newName: "createdAt");
        }
    }
}
