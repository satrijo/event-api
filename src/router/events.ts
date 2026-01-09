import { Hono } from "hono";
import prisma from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import { eventSchema } from "../validations/event-schema.js";

export const eventRoute = new Hono()
  .get("/", async (c) => {
    const events = await prisma.event.findMany({
      include: { _count: { select: { participants: true } } },
    });
    return c.json({ events });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const event = await prisma.event.findFirst({
      where: { id: String(id) },
      include: {
        participants: {
          select: {
            participant: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
    return c.json({ event });
  })
  .post("/", zValidator("json", eventSchema), async (c) => {
    const { title, description, location, date } = await c.req.json();
    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
      },
    });
    return c.json({ event: newEvent }, 201);
  })
  .patch("/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json();
    try {
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: {
          ...body,
          date: body.date ? new Date(body.date) : undefined,
        },
      });
      return c.json({ event: updatedEvent });
    } catch (error) {
      return c.json({ message: "Event not found" }, 404);
    }
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    await prisma.event.delete({
      where: { id: String(id) },
    });
    return c.json({ message: "Event deleted successfully" });
  });
