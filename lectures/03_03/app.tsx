import { sendResult } from "../../libs/centrala";
import { OpenAIService } from "../../libs/OpenAIService";

const API_URL = Bun.env["03_03_API"];
const apiKey = Bun.env.API_KEY;

if (!API_URL) {
    throw new Error("API_URL is not set");
}

if (!apiKey) {
    throw new Error("API_KEY is not set");
}

const openai = new OpenAIService();

const buildQuery = (query = "select * from users limit 1") => ({
    task: "database",
    apikey: apiKey,
    query,
});

const sendQuery = async (query: any) => {
    const response = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify(query),
    });
    return await response.json();
};

const getTableSchemas = async (tables: string[]) => {
    const response = await Promise.all(tables.map(table => sendQuery(buildQuery(`show create table ${table}`))));
    return response.map(r => r.reply);
}

const main = async () => {
    const showTablesQuery = buildQuery("show tables");
    const tablesResponse = await sendQuery(showTablesQuery) as any;
    const tables = tablesResponse.reply.map(table => table["Tables_in_banan"]);

    const selectTablesResponse = await openai.completion([{
        role: 'system',
        content: `
           We need to select relevant tables for the following problem.
           <Problem>które aktywne datacenter (DC_ID) są zarządzane przez pracowników, którzy są na urlopie (is_active=0)</Problem>
           Response format: JSON with the following fields:
           - tables: string[] - list of tables to use.

           <List of tables>
           ${tables.map(table => `- ${table}`).join("\n")}
           </List of tables>
        `
    }])

    const selectedTables = JSON.parse(selectTablesResponse.choices[0].message.content as string).tables;

    const tablesSchema = await getTableSchemas(selectedTables);

    const constructQueryResponse = await openai.completion([{
        role: 'system',
        content: `
            You are an expert SQL query builder.
            You are given a problem and a list of tables with their schemas.
            You need to construct a valid SQL query that solves the problem.

            <Problem>które aktywne datacenter (DC_ID) są zarządzane przez pracowników, którzy są na urlopie (is_active=0)</Problem>
            <List of tables>
            ${JSON.stringify(tablesSchema)}
            </List of tables>

            Return only the query, without any other text.
        `
    }])

    const dataCenterQuery = buildQuery(constructQueryResponse.choices[0].message.content as string);
    const dataCenterResponse = (await sendQuery(dataCenterQuery)).reply.map((r: any) => r["dc_id"]);

    // const dataCenter = dataCenterResponse.map((r: any) => r.reply);

    console.log(dataCenterResponse);

    const flag = await sendResult(dataCenterResponse, "database");

    console.log(flag);
};

main();