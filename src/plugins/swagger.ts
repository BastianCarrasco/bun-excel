// src/plugins/swagger.ts
import { swagger } from "@elysiajs/swagger";

const swaggerPlugin = swagger({
  path: "/swagger",
  documentation: {
    info: {
      title: "API de Google Sheets by T3 Chat",
      version: "1.0.0",
      description:
        "API para obtener datos de una hoja de cálculo de Google publicada en formato CSV.",
    },
    tags: [
      {
        name: "Google Sheets",
        description: "Operaciones relacionadas con Google Sheets",
      },
    ],
  },
});

export { swaggerPlugin };
