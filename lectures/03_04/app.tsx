import fs from "fs";
import uniq from "lodash/uniq";
import { OpenAIService } from "../../libs/OpenAIService";
import { sendResult } from "../../libs/centrala";
const apikey = Bun.env.API_KEY;
const peopleUrl = Bun.env["03_04_PEOPLE_URL"];
const placesUrl = Bun.env["03_04_PLACES_URL"];

if (!apikey) {
    throw new Error("API_KEY is not set");
}

if (!peopleUrl || !placesUrl) {
    throw new Error("03_04_PEOPLE_URL or 03_04_PLACES_URL is not set");
}

const notatka = fs.readFileSync(__dirname + "/notatka.txt", "utf-8");
const openai = new OpenAIService();

const processNote = async (note: string) => {
    const response = await openai.completion([{
        role: "system",
        content: `
        You are an expert in processing notes. You need to extract person names and places from the note.
        Return only the list of names and places, without any other text. Response in JSON format.

        Name and place should using capital letters.
        Name is just a first name without polish diacritics. NOT RAFAŁ but RAFAL.
        Place is a city name without polish diacritics. Not KRAKóW but KRAKOW.

        <format>
        {
            "names": ["name1", "name2", "name3"],
            "places": ["place1", "place2", "place3"]
        }
        </format>
        `
    }, {
        role: "user",
        content: note
    }])

    const { names, places } = JSON.parse(response.choices[0].message.content as string);

    return { names, places };
}

const getCitiesForPerson = async (name: string) => {
    const response = await fetch(peopleUrl, {
        method: "POST",
        body: JSON.stringify({
            apikey: apikey,
            query: name

        }),
    });

    const data = await response.json();
    const cities = data.message.split(' ');
    return cities;
}

const getPeopleForCity = async (place: string) => {
    const response = await fetch(placesUrl, {
        method: "POST",
        body: JSON.stringify({
            apikey: apikey,
            query: place
        }),
    });

    const data = await response.json();
    const names = data.message.split(' ');
    return names;
}

const main = async () => {
    let names: string[] = [];
    let places: string[] = [];

    const response = await processNote(notatka);

    names = response.names.filter(name => name !== 'Barbara');
    places = response.places;

    let barbaraCity: string;
    let maxIterations = 500;

    while (!barbaraCity && maxIterations > 0) {
        console.log('iteration ', maxIterations)
        if (places.length > 0) {
            // console.log('places left', places.length)
            const place = places.pop();
            // console.log('places left', places.length)
            // console.log('Checking place:', place);
            const newNames = await getPeopleForCity(place);
            if (newNames.includes('BARBARA')) {
                const flag = await sendResult(place, "loop");
                console.log('flag', flag)
            }
            names = uniq([...names, ...newNames]);
        }
        else if (names.length > 0) {
            const name = names.pop()
            // console.log('Checking name:', name);
            const newPlaces = await getCitiesForPerson(name);
            places = uniq([...places, ...newPlaces]);
        }

        // console.log('current names', names);
        // console.log('current places', places)

        maxIterations--;
    }

    // console.log('!!!!!!!!!barbaraCity!!!!!', "loop")
    // return { barbaraCity };

}
//     console.log(response);
// }

main();