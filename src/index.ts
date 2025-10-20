import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swaggerPlugin } from "./plugins/swagger";

import { baseRoutes } from "./routes/data";
import { excelBunRoutes } from "./routes/excel-bun";
import { tematicasRoutes } from "./routes/analysis/tematicas";
import { statusRoutes } from "./routes/analysis/status";
import { academicosRoutes } from "./routes/analysis/academicos";
import { convocatoriasRoutes } from "./routes/analysis/convocatorias";
import { montoRoutes } from "./routes/analysis/monto";
import { proyectosRoutes } from "./routes/analysis/proyectos";

const app = new Elysia()

  // 🌍 CORS global completamente abierto pero válido (maneja credentials)
  .use(
    cors({
      origin: true, // Permite todos los orígenes válidos (no devuelve "*", sino el que hizo la request)
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // 🔧 Middleware para responder manualmente las peticiones OPTIONS
  // Esto fuerza un 200 con CORS headers (Railway a veces quita los headers en 204)
  .all("*", ({ request, set }) => {
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("origin") || "*";

      set.headers["Access-Control-Allow-Origin"] = origin;
      set.headers["Access-Control-Allow-Methods"] =
        "GET,POST,PUT,DELETE,PATCH,OPTIONS";
      set.headers["Access-Control-Allow-Headers"] =
        "Content-Type,Authorization";
      set.headers["Access-Control-Allow-Credentials"] = "true";

      set.status = 200; // evita el 204 problemático
      return { ok: true };
    }
  })

  // 📘 Swagger y rutas principales
  .use(swaggerPlugin)
  .use(baseRoutes)
  .group("/data", (app) =>
    app
      .use(excelBunRoutes)
      .use(tematicasRoutes)
      .use(statusRoutes)
      .use(academicosRoutes)
      .use(convocatoriasRoutes)
      .use(montoRoutes)
      .use(proyectosRoutes)
  )

  // 🧭 Inicio
  .listen(3000, () => {
    console.log("🚀 Backend corriendo en Railway (producción)");
    console.log("✅ CORS habilitado globalmente (all origins)");
    console.log("📘 Swagger UI disponible en /swagger");
  });
