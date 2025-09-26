import fp from "fastify-plugin";
import admin from "firebase-admin";
import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user?: admin.auth.DecodedIdToken;
  }
}

let bootstrapped = false;

export default fp(async (app) => {
  if (!bootstrapped) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    bootstrapped = true;
  }

  app.decorate("authenticate", async (req, reply) => {
    try {
      const auth = req.headers.authorization || "";
      const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
      if (!token)
        return reply.code(401).send({ error: "Missing Bearer token" });
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = decoded;
    } catch (e) {
      req.log.error({ e }, "firebase auth failed");
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });
});
