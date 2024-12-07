import fs from "fs";

const correct = fs.readFileSync(__dirname + "/lab_data/correct.txt", "utf8")
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `${line};correct`)
    .join('\n');

const incorrect = fs.readFileSync(__dirname + "/lab_data/incorrect.txt", "utf8")
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => `${line};incorrect`)
    .join('\n');


const data = `${correct}\n${incorrect}`;


console.log(data);

const toSave = data.split('\n').map(line => {
    const [content, category] = line.split(';')
    return JSON.stringify({
        messages: [
            {
                role: "system",
                content: "Is data correct or incorrect?"
            },
            {
                role: "user",
                content: content
            },
            {
                role: "assistant",
                content: category
            }
        ],
    })
}).join('\n');

fs.writeFileSync(__dirname + "/lab_data/data.jsonl", toSave);


