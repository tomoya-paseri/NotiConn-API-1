export type Event = {
    title: string,
    url: string,
    owner: string,
    place: Place,
    topic: string,
    pref: number
};

export type Place = {
    lon: number,
    lat: number
}

export type getEventsReq = {
  topics: RegExp,
  pref: number
}
