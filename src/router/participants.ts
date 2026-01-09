import { Hono } from "hono";
import prisma from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import { participantSchema } from "../validations/participant-schema.js";

export const participantRoute = new Hono()
  .get("/", async (c) => {
    try {
      const participants = await prisma.participant.findMany({
        include: { _count: { select: { events: true } } },
      });
      return c.json({ participants });
    } catch (error) {
      return c.json({ message: "Error fetching participants" }, 500);
    }
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const participant = await prisma.participant.findUnique({
      where: { id: String(id) },
      include: { events: { select: { event: true } } },
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

    const existingParticipant = await prisma.participant.findUnique({
      where: { email },
    });

    if (existingParticipant) {
      const alreadyRegistered = await prisma.eventParticipant.findFirst({
        where: {
          eventId: String(eventId),
          participantId: existingParticipant.id,
        },
      });

      if (alreadyRegistered) {
        return c.json(
          { message: "Participant already registered for this event" },
          400
        );
      }
    }

    const newParticipant = await prisma.eventParticipant.create({
      data: {
        event: { connect: { id: String(eventId) } },
        participant: {
          connectOrCreate: {
            where: { email },
            create: { name, email },
          },
        },
      },
      include: {
        participant: true,
        event: true,
      },
    });
    return c.json({ participant: newParticipant }, 201);
  })
  .patch("/:id", async (c) => {
    const id = c.req.param("id");
    const { name, email } = await c.req.json();
    try {
      const updatedParticipant = await prisma.participant.update({
        where: { id: String(id) },
        data: {
          name,
          email,
        },
      });
      return c.json({ participant: updatedParticipant });
    } catch (error) {
      return c.json({ message: "Participant not found" }, 404);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    try {
      await prisma.eventParticipant.deleteMany({
        where: { participantId: String(id) },
      });

      await prisma.participant.delete({
        where: { id: String(id) },
      });
      return c.json({ message: "Participant deleted successfully" });
    } catch (error) {
      return c.json({ message: "Participant not found" }, 404);
    }
  });
