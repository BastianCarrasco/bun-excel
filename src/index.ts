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

// ✅ Solo origen de producción
const allowedOrigin = "https://editor-wallet-production.up.railway.app";

const app = new Elysia()
  // --- CORS primero ---
  .use(
    cors({
      origin: (req: Request) => {
        const origin = req.headers.get("origin");
        return origin === allowedOrigin; // 👉 true si permitido, false si no
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // --- Middleware para manejar manualmente OPTIONS ---
  .all("*", ({ request, set }) => {
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("origin");
      if (origin === allowedOrigin) {
        set.headers["Access-Control-Allow-Origin"] = origin;
        set.headers["Access-Control-Allow-Methods"] =
          "GET,POST,DELETE,PUT,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] =
          "Content-Type,Authorization";
        set.headers["Access-Control-Allow-Credentials"] = "true";
        set.status = 200;
        return { message: "CORS preflight OK" };
      }
      set.status = 403;
      return { error: "Origen no permitido" };
    }
  })

  // --- Swagger y rutas ---
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

  // --- Arranque ---
  .listen(3000, () => {
    console.log("🚀 Servidor corriendo en Railway (producción)");
    console.log("✅ CORS permitido desde:", allowedOrigin);
    console.log("📘 Swagger: http://localhost:3000/swagger");
  });
