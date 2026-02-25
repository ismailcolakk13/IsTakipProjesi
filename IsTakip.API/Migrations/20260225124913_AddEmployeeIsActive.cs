using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IsTakip.API.Migrations
{
    /// <inheritdoc />
    public partial class AddEmployeeIsActive : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkLogs_Employees_EmployeeId",
                table: "WorkLogs");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Employees",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddForeignKey(
                name: "FK_WorkLogs_Employees_EmployeeId",
                table: "WorkLogs",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_WorkLogs_Employees_EmployeeId",
                table: "WorkLogs");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Employees");

            migrationBuilder.AddForeignKey(
                name: "FK_WorkLogs_Employees_EmployeeId",
                table: "WorkLogs",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
