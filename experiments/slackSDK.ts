import { retryPolicies, WebClient } from "@slack/web-api";

// Check if token exists
if (!process.env.SLACK_BOT_TOKEN) {
  throw new Error("SLACK_BOT_TOKEN is not defined in environment variables");
}

const web = new WebClient(process.env.SLACK_BOT_TOKEN, {
  retryConfig: retryPolicies.fiveRetriesInFiveMinutes,
});

// Wrap in async function
export async function sendSlackMessage({
  message,
  previewLink,
}: {
  message: string;
  previewLink?: string;
}) {
  try {
    console.log("Attempting to post message to Slack...");
    const messageText = previewLink ? `${message}\n${previewLink}` : message;

    const result = await web.chat.postMessage({
      channel: "#general",
      text: messageText,
      unfurl_links: true,
    });

    console.log("Message posted successfully:", result.ts);
  } catch (error) {
    console.error("Error posting message to Slack:", error);
    throw error;
  }
}

// Example usage with preview link
// sendSlackMessage({
//   message: "Check out this cool website!",
//   previewLink: "https://example.com",
// });
