import { sendResult } from "../../libs/centrala";


const answer = [
    "01",
    "02",
    "03",
    "10"
]

const flag = await sendResult(
    answer,
    "research",
)

console.log(flag);