import fs from 'fs/promises';
import { TextSplitter } from '../../libs/TextSplitter';
import { OpenAIService } from './OpenAIService';
import { VectorService } from './VectorService';
import { sendResult } from '../../libs/centrala';

type Data = {
    date: string;
    content: string;
}

const textSplitter = new TextSplitter();
const openai = new OpenAIService();
const vectorService = new VectorService(openai);

const COLLECTION_NAME = "03_02";

const getData = async (): Promise<Data[]> => {
    const files = await fs.readdir(__dirname + '/files');
    const data = await Promise.all(files.map(async (file) => {
        const content = await fs.readFile(__dirname + `/files/${file}`, 'utf8');
        return { date: file.split('.')[0], content };
    }));
    return data;

};

const getPoints = async (data: Data[]) => {
    const points = await Promise.all(data.map(async ({ content, date }) => {
        const doc = await textSplitter.document(content, 'gpt-4o', { date });
        return doc;
    }));
    return points;
}

const main = async () => {
    // const data = await getData();
    // const points = await getPoints(data);
    // fs.writeFile(__dirname + "/points.json", JSON.stringify(points, null, 2));
    // await vectorService.initializeCollectionWithData(COLLECTION_NAME, points);

    const searchResults = await vectorService.performSearch(COLLECTION_NAME, "W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?");

    const answer = searchResults[0].payload.date?.replaceAll('_', '-');

    // const answer = searchResults[0].payload.content;

    // console.log(answer);

    const key = await sendResult(answer, "wektory");
    console.log(key);
};

main();
