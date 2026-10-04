using TecnoFix.Data;
using TecnoFix.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuración de Controladores
builder.Services.AddControllers();

// Configuración de OpenAPI / Swagger
builder.Services.AddOpenApi();

// Configuración de CORS para permitir solicitudes desde el Frontend (React/Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Inyección de Dependencias (Capa de Datos y Servicios)
builder.Services.AddSingleton<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IClientService, ClientService>();

var app = builder.Build();

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
