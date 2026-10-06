using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docket.Api.Migrations
{
    /// <inheritdoc />
    public partial class FixTraysFoldersModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "TrayId",
                table: "ArchivedDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrayId",
                table: "ArchivedDocuments");
        }
    }
}
