// src/index.ts (Modificado)
import { Elysia } from "elysia";
import { swaggerPlugin } from "./plugins/swagger";
import { baseRoutes } from "./routes/data";
import { tematicasRoutes } from "./routes/analysis/tematicas";
import { statusRoutes } from "./routes/analysis/status";
import { academicosRoutes } from "./routes/analysis/academicos";
import { convocatoriasRoutes } from "./routes/analysis/convocatorias";
import { montoRoutes } from "./routes/analysis/monto";

const app = new Elysia()
  .use(swaggerPlugin)
  .use(baseRoutes)
  .group("/data", (app) =>
    app
      .use(tematicasRoutes)
      .use(statusRoutes)
      .use(academicosRoutes)
      .use(convocatoriasRoutes)
      .use(montoRoutes)
  )
  .listen(3000, () => {
    console.log(`Elysia server running on http://localhost:3000`);
    console.log(`Swagger UI disponible en http://localhost:3000/swagger`);
  });
