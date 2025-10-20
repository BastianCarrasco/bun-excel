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

// 🌐 Solo origen de producción
const allowedOrigins = [
  "https://editor-wallet-production.up.railway.app",
  "https://bun-excel-production.up.railway.app",
];

const app = new Elysia()
  // 🛡️ CORS configurado sin middleware global
  .use(
    cors({
      origin: (request: Request) => {
        const origin = request.headers.get("origin");
        if (!origin) return false;
        return allowedOrigins.includes(origin); // ✅ solo tus dominios
      },
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )

  // 🧩 Rutas y Swagger
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

  // 🎯 Start
  .listen(3000, () => {
    console.log("🚀 Servidor corriendo en producción (Railway)");
    console.log("✅ CORS activo y controlado para orígenes específicos");
    console.log("📘 Swagger UI: http://localhost:3000/swagger");
  });
