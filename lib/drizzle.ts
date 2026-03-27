import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "./db";
import * as schema from "../db/schema";

export const db = drizzle(sql, { schema });
