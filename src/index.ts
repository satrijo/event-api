import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { eventRoute } from "./router/events.js";
import { participantRoute } from "./router/participants.js";

const app = new Hono();

app.get("/", (c) => {
  return c.json({ 
    message: "Welcome to the Event API", 
    description: "This API allows you to manage events and participants.",
    endpoints: {
      events: "/api/v1/events",
      participants: "/api/v1/participants"
    }
  }, 200);
});

app.route("/api/v1/events", eventRoute);
app.route("/api/v1/participants", participantRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
