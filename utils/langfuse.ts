import { Langfuse } from "langfuse";

const initLangfuse = () =>
  new Langfuse({
    secretKey: Bun.env.LANGFUSE_SECRET_KEY,
    publicKey: Bun.env.LANGFUSE_PUBLIC_KEY,
    baseUrl: "https://cloud.langfuse.com",
  });

export { initLangfuse };
