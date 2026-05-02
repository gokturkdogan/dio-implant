import { asc } from "drizzle-orm";
import { provinces } from "../db/schema";
import { db } from "../lib/drizzle";

export const provinceService = {
  /** Tüm illeri plaka koduna göre sıralı döner. */
  async listAll() {
    return db.query.provinces.findMany({
      orderBy: [asc(provinces.code)],
    });
  },
};
