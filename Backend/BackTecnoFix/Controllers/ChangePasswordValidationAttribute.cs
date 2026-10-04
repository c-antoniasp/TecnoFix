using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TecnoFix.Controllers;

[AttributeUsage(AttributeTargets.Method)]
public sealed class ChangePasswordValidationAttribute : ActionFilterAttribute
{
    public ChangePasswordValidationAttribute()
    {
        // Se ejecuta antes de la respuesta automatica de ApiController.
        Order = -3000;
    }

    public override void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            context.Result = new BadRequestObjectResult(new
            {
                message = "La solicitud de cambio de contraseña no es válida."
            });
        }
    }
}
