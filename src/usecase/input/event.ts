export type getEventReqType = {
  topics: string[]
};

// match検索出来るように正規表現形式にする
export function parseToInput (req: any): RegExp {
  const topics: string[] = req.topics
  return new RegExp(topics.join("|"), 'i')
}
