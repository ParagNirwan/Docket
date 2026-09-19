using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Docket.Api.Migrations
{
    /// <inheritdoc />
    public partial class HugeAhhArchivedDocumentDataModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlobRef",
                table: "ArchivedDocuments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "FolderId",
                table: "ArchivedDocuments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MimeType",
                table: "ArchivedDocuments",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "SizeBytes",
                table: "ArchivedDocuments",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "ArchivedDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "UploadedByUserId",
                table: "ArchivedDocuments",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedDocuments_TenantId",
                table: "ArchivedDocuments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ArchivedDocuments_UploadedByUserId",
                table: "ArchivedDocuments",
                column: "UploadedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ArchivedDocuments_Tenants_TenantId",
                table: "ArchivedDocuments",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ArchivedDocuments_Users_UploadedByUserId",
                table: "ArchivedDocuments",
                column: "UploadedByUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ArchivedDocuments_Tenants_TenantId",
                table: "ArchivedDocuments");

            migrationBuilder.DropForeignKey(
                name: "FK_ArchivedDocuments_Users_UploadedByUserId",
                table: "ArchivedDocuments");

            migrationBuilder.DropIndex(
                name: "IX_ArchivedDocuments_TenantId",
                table: "ArchivedDocuments");

            migrationBuilder.DropIndex(
                name: "IX_ArchivedDocuments_UploadedByUserId",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "BlobRef",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "FolderId",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "MimeType",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "SizeBytes",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ArchivedDocuments");

            migrationBuilder.DropColumn(
                name: "UploadedByUserId",
                table: "ArchivedDocuments");
        }
    }
}
