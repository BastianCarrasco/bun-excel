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

// 🌐 Solo tu dominio en producción
const allowedOrigin = "https://editor-wallet-production.up.railway.app";

const app = new Elysia()
  // 🔹 CORS al principio
  .use(
    cors({
      origin: (req) => {
        const origin = req.headers.get("origin");
        return origin === allowedOrigin ? origin : false;
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )

  // 🚀 Middleware global para forzar respuesta OPTIONS + cabeceras CORS
  .all("*", ({ request, set }) => {
    if (request.method === "OPTIONS") {
      const origin = request.headers.get("origin");
      // ⚠️ Solo responder si el origen está permitido
      if (origin === allowedOrigin) {
        set.headers["Access-Control-Allow-Origin"] = origin;
        set.headers["Access-Control-Allow-Methods"] = "GET,POST,DELETE,OPTIONS";
        set.headers["Access-Control-Allow-Headers"] =
          "Content-Type,Authorization";
        set.headers["Access-Control-Allow-Credentials"] = "true";
        set.status = 200;
        return Response.json({ ok: true });
      }
      // Origen no permitido → responde sin CORS
      set.status = 403;
      return Response.json({ error: "Origen no autorizado" });
    }
  })

  // 🔹 Swagger y rutas
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

  // 🔹 Start server
  .listen(3000, () => {
    console.log("\n🚀 Servidor corriendo en PRODUCCIÓN (Railway)");
    console.log("✅ CORS permitido para:", allowedOrigin);
    console.log("📘 Swagger UI: http://localhost:3000/swagger\n");
  });
