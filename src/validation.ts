import zod from "zod";

export const eventSchema = zod.object({
  title: zod.string().min(1, "Title is required"),
  description: zod.string().optional().nullable(),
  location: zod.string().optional().nullable(),
  date: zod.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

export const participantSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.email("Invalid email address"),
  eventId: zod.string().min(1, "Event ID is required"),
});
