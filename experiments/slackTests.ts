import { sendSlackMessage } from "../libs/slackSDK";

const result = await sendSlackMessage({
  message: "Hello, world!",
});

console.log({ result });
