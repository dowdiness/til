import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function dbFor(database: D1Database) {
  return drizzle(database, { schema });
}
