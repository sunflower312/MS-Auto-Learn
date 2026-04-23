export const SESSION_COOKIE = "autolearn_session";
export const SESSION_KEY = "adminUserId";

declare module "@fastify/secure-session" {
  interface SessionData {
    adminUserId?: number;
  }
}
