import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { eventRoute } from "./router/events.js";
import { participantRoute } from "./router/participants.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, World!");
});

app.route("/events", eventRoute);
app.route("/participants", participantRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
