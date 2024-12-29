import express from "express";
import { json } from "express";
import { OpenAIService } from "../../libs/OpenAIService";

const app = express();
const port = 3000;

const worldMap: string[][] = [
  [
    // Row 0
    "start",
    "trawa",
    "trawa drzewo",
    "dom",
  ],
  [
    // Row 1
    "trawa",
    "wiatrak",
    "trawa",
    "trawa",
  ],
  [
    // Row 2
    "trawa",
    "trawa",
    "skały",
    "drzewa trawa",
  ],
  [
    // Row 3
    "góry",
    "góry",
    "samochód",
    "jaskinia",
  ],
];

const systemPrompt = `
Na podstawie instrukcji zwroc finalna lokalizacje na mapie 4x4. Zaczynasz w lewym górnym rogu {x: 0, y: 0}.
Zwroc wynik w postaci JSON. 
Przyklad: 

<example>
Prompt:" Dobra. To co? zaczynamy? Odpalam silniki. Czas na kolejny lot. Jesteś moimi oczami. Lecimy w dół, albo nie! nie! czekaaaaj. Polecimy wiem jak. W prawo i dopiero teraz w dół. Tak będzie OK. Co widzisz?"
Response: {
  "x": 1,
  "y": 1
}
</example>

<example>
Prompt: "Idziemy na sam dół mapy. Albo nie! nie! nie idziemy. Zaczynamy od nowa. W prawo maksymalnie idziemy. Co my tam mamy?"
Response: {
  "x": 3,
  "y": 0
}
</example>
`;

const openai = new OpenAIService();

const getFinalLocation = async (instructions: string) => {
  const response = await openai.completion([
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: instructions,
    },
  ]);

  const result = JSON.parse(response.choices[0].message.content);

  return result;
};

// Middleware to parse JSON bodies
app.use(json());

// POST endpoint
app.post("/", async (req, res) => {
  const { instruction } = req.body;
  console.log("instrukcja", instruction);

  const finalLocation = await getFinalLocation(instruction);

  console.log("finalLocation", finalLocation);

  const description = worldMap[finalLocation.y][finalLocation.x];

  console.log("description", description);

  res.json({
    description,
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
