import { Event } from "../../domain/event";

function ignoreUnexpectedCharacters(str: string): string {
    str = str.replace(/\\n/g, "\\n")
    .replace(/\\'/g, "\\'")
    .replace(/\\"/g, '\\"')
    .replace(/\\&/g, "\\&")
    .replace(/\\r/g, "\\r")
    .replace(/\\t/g, "\\t")
    .replace(/\\b/g, "\\b")
    .replace(/\\f/g, "\\f")
    .replace(/[\u0000-\u0019]+/g,"")
    return str
}

export function parseToOutput(req: string): Event[] {
  const events = JSON.parse(ignoreUnexpectedCharacters(req)).events;
  let resOutput: Event[] = [];
  events.forEach(event => {
    const resEvent: Event = {
        title: event.title,
        url: event.event_url,
        owner: event.owner_nickname,
        place: {
            lon: Number(event.lon),
            lat: Number(event.lat)
        }
    }
    resOutput.push(resEvent)
  });
  return resOutput
}
