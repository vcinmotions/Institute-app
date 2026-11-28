import { AsyncLocalStorage } from "async_hooks";

/** Per-request audit context: who is acting, and whether a controller already wrote its own log row. */
export type AuditStore = {
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  ip?: string;
  audited: boolean;
};

export const auditContext = new AsyncLocalStorage<AuditStore>();
export const currentActor = () => auditContext.getStore();
