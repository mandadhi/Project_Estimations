using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Agents.Migrations
{
    /// <inheritdoc />
    public partial class modify : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "ProjectRisks",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "ProjectRequirements",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProjectId",
                table: "ProjectModules",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "ProjectRisks");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "ProjectRequirements");

            migrationBuilder.DropColumn(
                name: "ProjectId",
                table: "ProjectModules");
        }
    }
}
