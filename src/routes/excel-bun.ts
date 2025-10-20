import { Elysia, t } from "elysia";
import { connectToMongo } from "../services/mongo";
import type { InsertOneResult, InsertManyResult } from "mongodb";

export const excelBunRoutes = new Elysia({
  prefix: "/excel-bun",
  detail: { tags: ["MONGO-EXCEL"] },
})

  // 📘 GET
  .get("/", async ({ set }) => {
    try {
      const db = await connectToMongo();
      const data = await db.collection("EXCEL-BUN").find().toArray();
      set.status = 200;
      return data.length ? data : { message: "No hay documentos disponibles." };
    } catch (err) {
      set.status = 500;
      console.error("❌ Error GET /excel-bun:", err);
      return { error: "Error al obtener los documentos." };
    }
  })

  // ➕ POST
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const db = await connectToMongo();

        if (Array.isArray(body)) {
          const result: InsertManyResult<Document> = await db
            .collection("EXCEL-BUN")
            .insertMany(body);
          set.status = 200;
          return {
            message: "Datos insertados correctamente (insertMany)",
            count:
              result.insertedCount ?? Object.keys(result.insertedIds).length,
          };
        } else {
          const result: InsertOneResult<Document> = await db
            .collection("EXCEL-BUN")
            .insertOne(body);
          set.status = 200;
          return {
            message: "Documento insertado correctamente (insertOne)",
            insertedId: result.insertedId,
          };
        }
      } catch (err) {
        set.status = 500;
        console.error("❌ Error POST /excel-bun:", err);
        return { error: "Error al insertar el documento." };
      }
    },
    {
      body: t.Any(),
      detail: {
        summary: "Insertar uno o varios documentos en EXCEL-BUN",
        description:
          "Inserta nuevos documentos en la colección EXCEL-BUN. Acepta cualquier estructura JSON.",
      },
    }
  )

  // ❌ DELETE
  .delete("/", async ({ set }) => {
    try {
      const db = await connectToMongo();
      const result = await db.collection("EXCEL-BUN").deleteMany({});
      set.status = 200;
      return {
        message: "Colección vaciada correctamente",
        deletedCount: result.deletedCount,
      };
    } catch (err) {
      set.status = 500;
      console.error("❌ Error DELETE /excel-bun:", err);
      return { error: "Error al eliminar los documentos." };
    }
  });
