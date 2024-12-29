import { sendResult } from "../../libs/centrala";

const answer = "https://8a1c-193-28-84-146.ngrok-free.app";
const task = "webhook";

const result = await sendResult(answer, task);

console.log(result);
