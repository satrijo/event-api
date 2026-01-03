import zod from "zod";

export const participantSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  email: zod.email("Invalid email address"),
  eventId: zod.string().min(1, "Event ID is required"),
});
