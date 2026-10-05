using System.Net;

namespace TecnoFix.Services;

/// <summary>
/// Plantillas de los correos que envía TecnoFix.
/// </summary>
public static class EmailTemplates
{
    public const string TemporaryPasswordSubject = "Bienvenido a TecnoFix - Su contraseña temporal de acceso";

    /// <summary>
    /// Versión en texto plano del correo con la contraseña temporal,
    /// para los clientes de correo que no muestran HTML.
    /// </summary>
    public static string TemporaryPasswordText(string name, string password, string roleDescription) => $@"Estimado/a {name},

{roleDescription}
Su contraseña temporal para iniciar sesión es: {password}

Ingrese a TecnoFix con su correo electrónico y esta contraseña.
Por seguridad, cámbiela desde ""Mis datos"" después de iniciar sesión.

Atentamente,
Equipo TecnoFix";

    /// <summary>
    /// Versión HTML del correo con la contraseña temporal.
    /// Usa tablas y estilos en línea porque muchos clientes de correo ignoran el CSS externo.
    /// </summary>
    public static string TemporaryPasswordHtml(string name, string password, string roleDescription)
    {
        var safeName = WebUtility.HtmlEncode(name);
        var safePassword = WebUtility.HtmlEncode(password);
        var safeRole = WebUtility.HtmlEncode(roleDescription);

        return $@"<!DOCTYPE html>
<html lang=""es"">
<head>
  <meta charset=""UTF-8"">
  <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
  <title>{TemporaryPasswordSubject}</title>
</head>
<body style=""margin:0;padding:0;background:#F1F5F9;font-family:Arial,Helvetica,sans-serif;color:#0F172A;"">
  <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""background:#F1F5F9;padding:32px 16px;"">
    <tr>
      <td align=""center"">
        <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"" style=""max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;"">
          <tr>
            <td style=""background:#0F172A;padding:24px 32px;"">
              <span style=""display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;background:#34D399;border-radius:10px;font-size:20px;color:#0F172A;"">&#9881;</span>
              <span style=""font-size:20px;font-weight:bold;color:#FFFFFF;vertical-align:middle;padding-left:10px;"">TecnoFix</span>
            </td>
          </tr>
          <tr>
            <td style=""padding:32px;"">
              <h1 style=""margin:0 0 16px;font-size:22px;"">¡Hola, {safeName}!</h1>
              <p style=""margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;"">{safeRole}<br>Esta es su contraseña temporal para iniciar sesión:</p>
              <table role=""presentation"" width=""100%"" cellpadding=""0"" cellspacing=""0"">
                <tr>
                  <td align=""center"" style=""background:#ECFDF5;border:2px dashed #34D399;border-radius:12px;padding:20px;"">
                    <span style=""font-family:'Courier New',Courier,monospace;font-size:28px;font-weight:bold;letter-spacing:4px;color:#065F46;"">{safePassword}</span>
                  </td>
                </tr>
              </table>
              <p style=""margin:24px 0 0;font-size:14px;line-height:1.6;color:#475569;"">Ingrese a TecnoFix con su correo electrónico y esta contraseña. Por seguridad, cámbiela desde <strong>Mis datos</strong> después de iniciar sesión.</p>
            </td>
          </tr>
          <tr>
            <td style=""padding:20px 32px;background:#F8FAFC;font-size:12px;color:#94A3B8;text-align:center;"">
              Si usted no solicitó esta cuenta, ignore este correo.<br>Equipo TecnoFix
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>";
    }
}
