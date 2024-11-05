import z from "zod";

const apiKey = Bun.env.API_KEY;
const poligonUrl = Bun.env.POLIGON_URL;

const get = async () => {
  const response = await fetch(`${poligonUrl}/dane.txt`);
  const data = await response.text();
  const strings = data.split("\n").filter((s) => s.length > 0);
  return strings;
};

const post = async (task: string, answer: string[]) => {
  const request = {
    task,
    apikey: apiKey,
    answer,
  };

  const res = await fetch(`${poligonUrl}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return await res.json();
};

const main = async () => {
  const strings = await get();
  const result = await post("POLIGON", strings);
  console.log({ result });
};

main();
