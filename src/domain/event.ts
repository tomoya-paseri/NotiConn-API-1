export type Event = {
    title: string,
    url: string,
    owner: string,
    place: Place,
    topic: string
};

export type Place = {
    lon: number,
    lat: number
}
