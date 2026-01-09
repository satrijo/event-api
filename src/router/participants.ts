import { Hono } from "hono";
import prisma from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import { participantSchema } from "../validations/participant-schema.js";

export const participantRoute = new Hono()
  .get("/", async (c) => {
    const participants = await prisma.participant.findMany();
    return c.json({ participants });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const participant = await prisma.participant.findUnique({
      where: { id: String(id) },
      include: { event: true },
    });
    return c.json({ participant });
  })
  .post("/", zValidator("json", participantSchema), async (c) => {
    const { name, email, eventId } = await c.req.json();

    const event = await prisma.event.findUnique({
      where: { id: String(eventId) },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    const newParticipant = await prisma.participant.create({
      data: {
        name,
        email,
        eventId,
      },
    });
    return c.json({ participant: newParticipant }, 201);
  })
  .patch("/:id", async (c) => {
    const id = c.req.param("id");
    const { name, email } = await c.req.json();
    const updatedParticipant = await prisma.participant.update({
      where: { id: String(id) },
      data: {
        name,
        email,
      },
    });
    return c.json({ participant: updatedParticipant });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await prisma.participant.delete({
        where: { id: String(id) },
      });
      return c.json({ message: "Participant deleted successfully" });
    } catch (error) {
      return c.json({ message: "Participant not found" }, 404);
    }
  });
