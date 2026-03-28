import { randomUUID } from "node:crypto";

export function createStableId() {
  return randomUUID();
}
