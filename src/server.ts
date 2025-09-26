import { fastifyCors } from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";
import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";

import { createQuestionRoute } from "./http/routes/create-question.ts";
import { createRoomRoute } from "./http/routes/create-room.ts";
import { getRoomQuestions } from "./http/routes/get-room-questions.ts";
import { getRoomsRoute } from "./http/routes/get-rooms.ts";
import { uploadAudioRoute } from "./http/routes/upload-audio.ts";
import firebaseAuth from "./auth/firebaseAuth.ts";

const app = fastify().withTypeProvider<ZodTypeProvider>();

await app.register(firebaseAuth);

if (process.env.NODE_ENV !== "production") {
  require("dotenv/config"); // carrega .env apenas localmente
}

app.register(fastifyCors, {
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "Authorization"],
});
app.register(fastifyMultipart);

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.get("/health", () => "OK");

app.register(getRoomsRoute);

app.register(
  async (instance) => {
    instance.addHook("preHandler", instance.authenticate);

    instance.register(createRoomRoute);
    instance.register(getRoomQuestions);
    instance.register(createQuestionRoute);
    instance.register(uploadAudioRoute);
  },
  { prefix: "" }
);

app.listen({ port: env.PORT });
