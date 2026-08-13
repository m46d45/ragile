import { sql } from "@vercel/postgres";

export { sql };

/**
 * Helper untuk query database Vercel Postgres.
 * Contoh penggunaan:
 *
 * const { rows } = await sql`SELECT * FROM members WHERE id = ${id}`;
 */
export async function query<T = any>(strings: TemplateStringsArray, ...values: any[]) {
  return sql<T>(strings, ...values);
}
