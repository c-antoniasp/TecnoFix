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

// Una sola instancia: si se crea una nueva en cada DbContext, EF Core arma un proveedor
// interno por petición y a las 20 lanza ManyServiceProvidersCreatedWarning (error 500).
var enumNameTranslator = new NpgsqlNullNameTranslator();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsql => npgsql
            .MapEnum<UserRole>("user_role", nameTranslator: enumNameTranslator)
            .MapEnum<OrderStatus>("order_status", nameTranslator: enumNameTranslator)));

// Orígenes permitidos: en producción se definen con Cors__AllowedOrigins__0, __1, ...
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:5173"];

builder.Services.AddCors(options =>
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
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
                    message = context.Request.Path == "/api/auth/change-password"
                        ? "Debe iniciar sesión para cambiar su contraseña."
                        : "Debe iniciar sesión para realizar esta acción."
                });
            }
        };
    });
builder.Services.AddAuthorization();

// Inyección de dependencias del registro de clientes (USU-002).
builder.Services.AddScoped<IClientRepository, ClientRepository>();
// Correo con Brevo (Brevo__ApiKey y Brevo__SenderEmail); sin ellos, los correos solo se registran en el log.
builder.Services.AddHttpClient<IEmailService, EmailService>();
builder.Services.AddScoped<IClientService, ClientService>();

// Inyección de dependencias del registro de técnicos.
builder.Services.AddScoped<IEngineerRepository, EngineerRepository>();
builder.Services.AddScoped<ITechnicianService, TechnicianService>();

// Catálogo de tipos de equipo (ADM-001).
builder.Services.AddScoped<IEquipmentTypeRepository, EquipmentTypeRepository>();
builder.Services.AddScoped<IEquipmentTypeService, EquipmentTypeService>();

// Órdenes de reparación (ORD-001).
builder.Services.AddScoped<IRepairOrderRepository, RepairOrderRepository>();
builder.Services.AddScoped<IRepairOrderService, RepairOrderService>();

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
