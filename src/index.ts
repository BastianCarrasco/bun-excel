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

// Orígenes permitidos (solo estos dos)
const allowedOrigins = [
  "http://localhost:5173",
  "https://editor-wallet-production.up.railway.app",
];

const app = new Elysia()
  .use(
    cors({
      origin: (req) => {
        const origin = req.headers.get("origin");
        if (!origin) return false;
        return allowedOrigins.includes(origin);
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
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
    console.log("📘 Swagger UI disponible en http://localhost:3000/swagger");
  });
