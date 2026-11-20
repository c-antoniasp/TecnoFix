import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "../App";

const API = "http://localhost:5032";

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// Backend falso: replica el contrato de ORD-002 en memoria, sin red ni base de datos.
function createBackend({ failStart = false } = {}) {
  const orders = [
    {
      orderId: 1,
      orderNumber: 1001,
      equipmentType: "Notebook",
      brandModel: "Lenovo ThinkPad",
      reportedFailure: "No enciende",
      status: "RECEIVED",
      receivedAt: "2026-11-09T10:00:00",
    },
  ];

  const calls = [];

  const fetchMock = vi.fn(async (input, options = {}) => {
    const url = typeof input === "string" ? input : input.url;
    const method = (options.method || "GET").toUpperCase();

    calls.push({ url, method, headers: options.headers, body: options.body });

    if (!url.startsWith(API)) return json({ message: "URL inesperada" }, 404);

    if (method === "GET" && url.endsWith("/orders/diagnosis")) {
      return json(
        orders.filter(
          (order) => order.status === "RECEIVED" || order.status === "IN_DIAGNOSIS"
        )
      );
    }

    const startMatch = url.match(/\/orders\/(\d+)\/diagnosis\/start$/);
    if (method === "PATCH" && startMatch) {
      if (failStart) return json({ message: "No se pudo abrir la orden" }, 400);

      const order = orders.find((item) => item.orderId === Number(startMatch[1]));
      if (!order) return json({ message: "La orden de reparación no existe" }, 400);
      if (order.status !== "RECEIVED" && order.status !== "IN_DIAGNOSIS") {
        return json(
          { message: "La orden no se encuentra disponible para diagnóstico" },
          400
        );
      }

      order.status = "IN_DIAGNOSIS";
      return json({ message: "Orden abierta para diagnóstico." });
    }

    const diagnosisMatch = url.match(/\/orders\/(\d+)\/diagnosis$/);
    if (method === "POST" && diagnosisMatch) {
      const order = orders.find(
        (item) => item.orderId === Number(diagnosisMatch[1])
      );
      if (!order) return json({ message: "La orden de reparación no existe" }, 400);
      if (order.status !== "RECEIVED" && order.status !== "IN_DIAGNOSIS") {
        return json(
          { message: "La orden no se encuentra disponible para diagnóstico" },
          400
        );
      }

      const body = JSON.parse(options.body || "{}");
      const totalCost = Number(body.laborCost) + Number(body.partsCost);
      order.status = "QUOTED";

      return json({
        message: "Diagnóstico y presupuesto registrados exitosamente.",
        totalCost,
      });
    }

    return json({ message: `Mock no implementado: ${method} ${url}` }, 404);
  });

  return { orders, calls, fetchMock };
}

async function login() {
  const { container } = render(<App />);

  // En este entorno jsdom el click del submit no dispara el evento submit;
  // lo enviamos directamente sobre el formulario.
  fireEvent.submit(container.querySelector("form"));

  return container;
}

describe("ORD-002 en el frontend", () => {
  it("abre la orden, la pasa a En diagnóstico y calcula el total", async () => {
    const user = userEvent.setup();
    const backend = createBackend();
    vi.stubGlobal("fetch", backend.fetchMock);

    await login();

    const row = await screen.findByRole("row", { name: /#1001/i });
    expect(within(row).getByText("Recibida")).toBeInTheDocument();

    // El listado se pidió con el token de la sesión.
    const getCall = backend.calls.find((call) => call.method === "GET");
    expect(getCall.headers.Authorization).toMatch(/^Bearer /);

    // Abrir la orden: primero debe pedir confirmación.
    await user.click(within(row).getByRole("button", { name: /^abrir$/i }));

    const openDialog = await screen.findByRole("dialog");
    expect(openDialog).toHaveTextContent(/#1001/);
    expect(openDialog).toHaveTextContent(/no se puede deshacer/i);

    await user.click(
      within(openDialog).getByRole("button", { name: /sí, abrir orden/i })
    );

    await waitFor(() => {
      expect(within(row).getByText("En diagnóstico")).toBeInTheDocument();
    });

    const patchCall = backend.calls.find((call) => call.method === "PATCH");
    expect(patchCall.url).toBe(`${API}/api/technician/orders/1/diagnosis/start`);

    // Formulario de diagnóstico.
    await user.type(
      screen.getByLabelText(/diagnóstico técnico/i),
      "Limpieza interna y cambio de pasta térmica."
    );
    await user.type(screen.getByLabelText(/costo de mano de obra/i), "25000");
    await user.type(screen.getByLabelText(/costo de repuestos/i), "15000");

    // La vista previa del total debe sumar mano de obra + repuestos.
    expect(screen.getByText(money.format(40000))).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /registrar diagnóstico y presupuesto/i })
    );

    // Presupuestar también exige doble confirmación.
    const quoteDialog = await screen.findByRole("dialog");
    expect(quoteDialog).toHaveTextContent(/#1001/);
    expect(quoteDialog).toHaveTextContent(money.format(40000));

    await user.click(
      within(quoteDialog).getByRole("button", {
        name: /sí, registrar presupuesto/i,
      })
    );

    // Mensaje de éxito con el total devuelto por el backend.
    const success = await screen.findByRole("status");
    expect(success).toHaveTextContent(
      "Diagnóstico y presupuesto registrados exitosamente."
    );
    expect(success).toHaveTextContent(`Total: ${money.format(40000)}`);

    // El body enviado al backend debe llevar los valores del formulario.
    const postCall = backend.calls.find((call) => call.method === "POST");
    expect(JSON.parse(postCall.body)).toEqual({
      technicalDiagnosis: "Limpieza interna y cambio de pasta térmica.",
      laborCost: 25000,
      partsCost: 15000,
    });

    expect(backend.orders[0].status).toBe("QUOTED");
  });

  it("mantiene el estado Recibida si el backend rechaza la apertura", async () => {
    const user = userEvent.setup();
    const backend = createBackend({ failStart: true });
    vi.stubGlobal("fetch", backend.fetchMock);

    await login();

    const row = await screen.findByRole("row", { name: /#1001/i });
    await user.click(within(row).getByRole("button", { name: /^abrir$/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /sí, abrir orden/i })
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo abrir la orden"
    );
    expect(within(row).getByText("Recibida")).toBeInTheDocument();
    expect(backend.orders[0].status).toBe("RECEIVED");
  });

  it("valida los campos obligatorios antes de enviar", async () => {
    const user = userEvent.setup();
    const backend = createBackend();
    vi.stubGlobal("fetch", backend.fetchMock);

    await login();

    const row = await screen.findByRole("row", { name: /#1001/i });
    await user.click(within(row).getByRole("button", { name: /^abrir$/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /sí, abrir orden/i })
    );

    await waitFor(() => {
      expect(within(row).getByText("En diagnóstico")).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", { name: /registrar diagnóstico y presupuesto/i })
    );

    // La validación ocurre antes de la confirmación: no debe abrirse el diálogo.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Debe completar el campo Diagnóstico técnico"
    );
    expect(backend.calls.some((call) => call.method === "POST")).toBe(false);
  });

  it("no abre la orden si se cancela la confirmación", async () => {
    const user = userEvent.setup();
    const backend = createBackend();
    vi.stubGlobal("fetch", backend.fetchMock);

    await login();

    const row = await screen.findByRole("row", { name: /#1001/i });
    await user.click(within(row).getByRole("button", { name: /^abrir$/i }));

    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: /^cancelar$/i })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(backend.calls.some((call) => call.method === "PATCH")).toBe(false);
    expect(within(row).getByText("Recibida")).toBeInTheDocument();
  });

  it("no registra el presupuesto si se cancela la confirmación", async () => {
    const user = userEvent.setup();
    const backend = createBackend();
    vi.stubGlobal("fetch", backend.fetchMock);

    await login();

    const row = await screen.findByRole("row", { name: /#1001/i });
    await user.click(within(row).getByRole("button", { name: /^abrir$/i }));

    const openDialog = await screen.findByRole("dialog");
    await user.click(
      within(openDialog).getByRole("button", { name: /sí, abrir orden/i })
    );

    await waitFor(() => {
      expect(within(row).getByText("En diagnóstico")).toBeInTheDocument();
    });

    await user.type(
      screen.getByLabelText(/diagnóstico técnico/i),
      "Limpieza interna y cambio de pasta térmica."
    );
    await user.type(screen.getByLabelText(/costo de mano de obra/i), "25000");
    await user.type(screen.getByLabelText(/costo de repuestos/i), "15000");

    await user.click(
      screen.getByRole("button", { name: /registrar diagnóstico y presupuesto/i })
    );

    const quoteDialog = await screen.findByRole("dialog");
    await user.click(
      within(quoteDialog).getByRole("button", { name: /^cancelar$/i })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(backend.calls.some((call) => call.method === "POST")).toBe(false);
    expect(screen.getByLabelText(/diagnóstico técnico/i)).toHaveValue(
      "Limpieza interna y cambio de pasta térmica."
    );
  });
});
