import zod from "zod";

export const eventSchema = zod.object({
  title: zod.string().min(1, "Title is required"),
  description: zod.string().optional().nullable(),
  location: zod.string().optional().nullable(),
  date: zod.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});
