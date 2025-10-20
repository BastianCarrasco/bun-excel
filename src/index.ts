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

// ✅ Dominios permitidos
const allowedOrigins = [
  "https://editor-wallet-production.up.railway.app",
  "https://bun-excel-production.up.railway.app",
];

// 🧠 Lógica de validación de origen
function isAllowedOrigin(origin?: string | null) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

// 🚀 Inicializamos la app
const app = new Elysia()
  // --- CORS primero ---
  .use(
    cors({
      origin: ({ request }) => {
        const origin = request.headers.get("origin");
        // Devuelve true solo si se permite este origin
        return isAllowedOrigin(origin);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
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
  .listen(3000, () => {
    console.log("🚀 Servidor corriendo en PRODUCCIÓN (Railway)");
    console.log("🌐 CORS permitido desde:", allowedOrigins.join(", "));
    console.log("📘 Swagger UI en http://localhost:3000/swagger");
  });
