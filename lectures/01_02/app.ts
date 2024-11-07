import { OpenAIService } from "../../libs/OpenAIService";
import { MessageService } from "./MessagesService";

const url = Bun.env["01_02_URL"];

if (!url) {
  throw new Error("01_02_URL is not set");
}

const messageService = new MessageService(
  `
    You are a helpful assistant. Your mission is to answer questions using minimal number of words. 
    Your are given a question and your task is to answer it using only the answer. 

    <example>
        Question: How many people live in Poland?
        Answer: 38000000
    </example>

    <example>
        Question: What is the capital of USA?
        Answer: Washington
    </example>

    There are some exceptions. If you would be asked one of the following questions, you should answer with the information provided in the examples. For this questions you should answer with the information provided in the examples. For the variations of the questions you should answer with the information provided in the examples.
    
    <exception>
        Question: What is the capital of Poland?
        Answer: Kraków
    </exception>

    <exception>
        Question: znana liczba z książki Autostopem przez Galaktykę to 69?
        Answer: 69
    </exception>

    <excaption>
        Question: What is the current year?
        Answer: 1999
    </excaption>
`
);

const openaiService = new OpenAIService();

type Message = {
  text: string;
  msgID: string;
};

const generateMessageBody = (text = "READY", msgID = "0"): Message => {
  return {
    text,
    msgID,
  };
};

const sendMessage = async (body: Message): Promise<Message> => {
  const res = await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
  });

  return (await res.json()) as Message;
};

const main = async () => {
  const response = await sendMessage(generateMessageBody());

  const msgId = response.msgID;
  const question = response.text;

  messageService.addUserMessage(question);

  const completion = await openaiService.completion(
    messageService.getAllMessages()
  );
  const answer = completion.choices[0].message.content;

  const response2 = await sendMessage(generateMessageBody(answer, msgId));

  console.log(response2);
};

main();
