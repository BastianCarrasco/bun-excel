import { Elysia } from "elysia";
import { swaggerPlugin } from "./plugins/swagger";
import { cors } from "@elysiajs/cors";

import { baseRoutes } from "./routes/data";
import { excelBunRoutes } from "./routes/excel-bun";

import { tematicasRoutes } from "./routes/analysis/tematicas";
import { statusRoutes } from "./routes/analysis/status";
import { academicosRoutes } from "./routes/analysis/academicos";
import { convocatoriasRoutes } from "./routes/analysis/convocatorias";
import { montoRoutes } from "./routes/analysis/monto";
import { proyectosRoutes } from "./routes/analysis/proyectos";

// ✅ Orígenes permitidos en producción
const allowedOrigins = [
  "https://editor-wallet-production.up.railway.app",
  "https://bun-excel-production.up.railway.app",
];

// 🚀 Inicialización del servidor
const app = new Elysia()
  // --- CORS (debe ir antes que las rutas) ---
  .use(
    cors({
      origin: ({ request }) => {
        const origin = request.headers.get("origin");
        // Solo aceptar si el origen está en la lista
        if (origin && allowedOrigins.includes(origin)) {
          // Esto hace que la cabecera Access-Control-Allow-Origin = origin
          request.headers.set("Origin", origin);
          return true;
        }
        return false;
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // --- Swagger & rutas ---
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

  // --- Server listen ---
  .listen(3000, () => {
    console.log("🚀 Servidor corriendo en PRODUCCIÓN (Railway)");
    console.log("🌐 CORS permitido desde:", allowedOrigins.join(", "));
    console.log("📘 Swagger UI en http://localhost:3000/swagger");
  });
