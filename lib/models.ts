import "server-only";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * A real 3D model replaces the procedural one when public/models/<handle>.glb exists.
 * Checked at build/render time, so adding the file needs no code change.
 */
export function glbUrlFor(handle: string): string | null {
  const file = path.join(process.cwd(), "public", "models", `${handle}.glb`);
  return existsSync(file) ? `/models/${handle}.glb` : null;
}
