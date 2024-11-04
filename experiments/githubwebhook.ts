import express from "express";
import { sendSlackMessage } from "./slackSDK";
const app = express();
const port = 3000;

// Parse JSON payloads
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/webhook", (req, res) => {
  // Verify GitHub webhook event type
  console.log("webhook triggered");
  const githubEvent = req.headers["x-github-event"];

  console.log({ githubEvent });

  if (githubEvent === "pull_request") {
    const action = req.body.action;
    console.log({ action });

    if (action === "opened") {
      // Handle new PR creation
      const pr = req.body.pull_request;
      console.log(`New PR #${pr.number} created: ${pr.title}`);
      console.log(`Created by ${pr.user.login}`);
      console.log(`URL: ${pr.html_url}`);

      sendSlackMessage({
        message: `New PR #${pr.number} created: ${pr.title}`,
        previewLink: pr.html_url,
      });
    }
  }

  // Send response to acknowledge receipt
  res.status(202).send("Webhook received");
});

app.listen(port, () => {
  console.log(`Webhook server listening on port ${port}`);
});
