const apiKey = Bun.env.API_KEY;
const reportTaskUrl = Bun.env.REPORT_TASK_URL;

if (!apiKey || !reportTaskUrl) {
  throw new Error("API_KEY or REPORT_TASK_URL is not set");
}

export const sendResult = async (answer: any, task: string) => {
  const response = await fetch("https://centrala.ag3nts.org/report", {
    method: "POST",
    body: JSON.stringify({
      task,
      apikey: apiKey,
      answer,
    }),
  });

  return await response.json();
};
