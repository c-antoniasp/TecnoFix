using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Npgsql.NameTranslation;
using TecnoFix.Data;
using TecnoFix.Models;
using TecnoFix.Repositories;
using TecnoFix.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql.MapEnum<UserRole>("user_role", nameTranslator: new NpgsqlNullNameTranslator())));

builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "TecnoFix",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "TecnoFixUsers",
            IssuerSigningKey = string.IsNullOrWhiteSpace(jwtKey)
                ? null
                : new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Acepta la cookie del login y conserva el soporte para Bearer.
                if (string.IsNullOrWhiteSpace(context.Request.Headers.Authorization))
                {
                    context.Token = context.Request.Cookies["access_token"];
                }
                return Task.CompletedTask;
            },
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.Headers["WWW-Authenticate"] = JwtBearerDefaults.AuthenticationScheme;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Debe iniciar sesión para cambiar su contraseña."
                });
            }
        };
    });
builder.Services.AddAuthorization();

// Inyección de dependencias del registro de clientes (USU-002).
builder.Services.AddSingleton<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IClientService, ClientService>();

// Inyección de dependencias del registro de técnicos.
builder.Services.AddScoped<IEngineerRepository, EngineerRepository>();
builder.Services.AddScoped<ITechnicianService, TechnicianService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
