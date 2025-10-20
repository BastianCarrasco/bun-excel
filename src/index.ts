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

const app = new Elysia()
  // 🌐 CORS abierto
  .use(
    cors({
      origin: true, // <--- permite cualquier origen ('*')
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    })
  )

  // 🧩 Swagger y rutas
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
    console.log("🚀 Servidor corriendo en Railway (producción)");
    console.log("✅ CORS abierto: acepta solicitudes desde cualquier origen");
    console.log("📘 Swagger UI: http://localhost:3000/swagger");
  });
