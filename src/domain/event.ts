export type Event = {
    title: string,
    url: string,
    owner: string,
    place: Place
};

export type Place = {
    lon: number,
    lat: number
}
