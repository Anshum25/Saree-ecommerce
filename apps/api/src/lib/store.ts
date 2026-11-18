import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";

/**
 * JSON-file document store for Phase 1: enquiries, newsletter signups,
 * submitted reviews, carts, and admin product overrides.
 *
 * Why a file and not a database: in Phase 1 the volume is a handful of rows a
 * day, the data must be readable by a non-technical person, and nothing should
 * block launch on provisioning Postgres. Every function is async and returns
 * the shapes a database layer would, so Phase 2 replaces the bodies here and
 * nothing above this file changes.
 *
 * Concurrency: writes are serialised through an in-process queue and committed
 * by atomic rename, so a crash mid-write cannot truncate a collection. That is
 * enough for ONE instance. Two instances writing the same directory will still
 * lose data — move to Postgres before scaling out.
 */

const DATA_DIR = process.env.JAIISHA_DATA_DIR ?? "./.data";

export type Collection = "enquiries" | "newsletter" | "reviews" | "carts" | "products";

export interface Row<T> {
  id: string;
  createdAt: string;
  updatedAt: string;
  payload: T;
}

const fileFor = (collection: Collection) => resolve(process.cwd(), DATA_DIR, `${collection}.json`);

/* ---------------------------------------------------------------- locking - */

/** One promise chain per collection: writes queue instead of interleaving. */
const queues = new Map<Collection, Promise<unknown>>();

const withLock = <T>(collection: Collection, job: () => Promise<T>): Promise<T> => {
  const prior = queues.get(collection) ?? Promise.resolve();
  // Swallow a prior rejection so one failed write does not poison the queue.
  const next = prior.catch(() => {}).then(job);
  queues.set(
    collection,
    next.catch(() => {}),
  );
  return next;
};

/* -------------------------------------------------------------------- io - */

const load = async <T>(collection: Collection): Promise<Row<T>[]> => {
  try {
    const raw = await readFile(fileFor(collection), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Row<T>[]) : [];
  } catch (err) {
    // A missing file is the normal first-run case, not an error.
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return [];
    // Corrupt file: refuse rather than silently overwriting what is there.
    throw new Error(
      `Could not read the ${collection} store. Fix or move ${fileFor(collection)} and retry.`,
    );
  }
};

const save = async <T>(collection: Collection, rows: Row<T>[]): Promise<void> => {
  const path = fileFor(collection);
  await mkdir(dirname(path), { recursive: true });
  // Write to a sibling then rename: rename is atomic, so a reader never sees
  // a half-written file.
  const tmp = `${path}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await rename(tmp, path);
};

/* ------------------------------------------------------------------- api - */

export const readAll = async <T>(collection: Collection): Promise<Row<T>[]> => load<T>(collection);

export const find = async <T>(collection: Collection, id: string): Promise<Row<T> | undefined> =>
  (await load<T>(collection)).find((r) => r.id === id);

export const insert = <T>(collection: Collection, payload: T, id?: string): Promise<Row<T>> =>
  withLock(collection, async () => {
    const rows = await load<T>(collection);
    const now = new Date().toISOString();
    const row: Row<T> = { id: id ?? randomUUID(), createdAt: now, updatedAt: now, payload };
    rows.push(row);
    await save(collection, rows);
    return row;
  });

/** Shallow-merges `patch` into the stored payload. Returns undefined if absent. */
export const update = <T extends object>(
  collection: Collection,
  id: string,
  patch: Partial<T>,
): Promise<Row<T> | undefined> =>
  withLock(collection, async () => {
    const rows = await load<T>(collection);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return undefined;
    rows[i] = {
      ...rows[i],
      updatedAt: new Date().toISOString(),
      payload: { ...rows[i].payload, ...patch },
    };
    await save(collection, rows);
    return rows[i];
  });

/** Creates the row if it is missing, replaces the payload if it exists. */
export const upsert = <T>(collection: Collection, id: string, payload: T): Promise<Row<T>> =>
  withLock(collection, async () => {
    const rows = await load<T>(collection);
    const now = new Date().toISOString();
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) {
      const row: Row<T> = { id, createdAt: now, updatedAt: now, payload };
      rows.push(row);
      await save(collection, rows);
      return row;
    }
    rows[i] = { ...rows[i], updatedAt: now, payload };
    await save(collection, rows);
    return rows[i];
  });

export const remove = (collection: Collection, id: string): Promise<boolean> =>
  withLock(collection, async () => {
    const rows = await load<unknown>(collection);
    const next = rows.filter((r) => r.id !== id);
    if (next.length === rows.length) return false;
    await save(collection, next);
    return true;
  });

/** Back-compat alias used by the enquiry and newsletter routes. */
export const append = insert;
export const list = readAll;

/* ---------------------------------------------------------- rate limiting - */

const hits = new Map<string, number[]>();

export const rateLimited = (key: string, limit = 5, windowMs = 60_000): boolean => {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing without bound on a long-running process.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }

  return recent.length > limit;
};

export const clientKey = (req: Request): string =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
