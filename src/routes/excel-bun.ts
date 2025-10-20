import { Elysia, t } from "elysia";
import { connectToMongo } from "../services/mongo";

export const excelBunRoutes = new Elysia({
  prefix: "/excel-bun",
  detail: {
    tags: ["MONGO-EXCEL"],
  },
})

  // 📘 GET: Obtener todos los documentos de EXCEL-BUN
  .get(
    "/",
    async () => {
      const db = await connectToMongo();
      const data = await db.collection("EXCEL-BUN").find().toArray();
      return data;
    },
    {
      detail: {
        summary: "Obtener todos los documentos de EXCEL-BUN",
        description:
          "Devuelve todos los documentos almacenados en la colección EXCEL-BUN.",
      },
    }
  )

  // ➕ POST: Insertar un documento en EXCEL-BUN
  .post(
    "/",
    async ({ body }) => {
      const db = await connectToMongo();
      const result = await db.collection("EXCEL-BUN").insertOne(body);
      return { insertedId: result.insertedId };
    },
    {
      body: t.Record(t.String(), t.Any()),
      detail: {
        summary: "Insertar un documento en EXCEL-BUN",
        description:
          "Agrega un nuevo documento en la colección EXCEL-BUN. Acepta cualquier estructura JSON.",
      },
    }
  )

  // ❌ DELETE: Eliminar todos los documentos de EXCEL-BUN
  .delete(
    "/",
    async () => {
      const db = await connectToMongo();
      const result = await db.collection("EXCEL-BUN").deleteMany({});
      return { deletedCount: result.deletedCount };
    },
    {
      detail: {
        summary: "Eliminar todos los documentos de EXCEL-BUN",
        description:
          "Elimina todos los registros de la colección EXCEL-BUN de la base de datos.",
      },
    }
  );
