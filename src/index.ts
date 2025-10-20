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

// Lista estricta de orígenes permitidos
const allowedOrigins = [
  "http://localhost:5173",
  "https://editor-wallet-production.up.railway.app",
];

const app = new Elysia()
  .use(
    cors({
      origin: (req) => {
        const origin = req.headers.get("origin");
        const valid = origin && allowedOrigins.includes(origin);
        if (valid) {
          // 🔹 Devuelve explícitamente el origen permitido
          return origin;
        }
        // 🚫 Bloquea todo lo demás
        return false;
      },
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
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
    console.log("🚀 Servidor corriendo en http://localhost:3000");
    console.log("📘 Swagger disponible en http://localhost:3000/swagger");
  });
