export type getEventReqType = {
  topics: string[]
};

// match検索出来るように正規表現形式にする
export function parseToInput (req: any): RegExp {
  let topics: string[] = req.topics
  topics = topics.map(t => escapeRegExp(t))
  return new RegExp(topics.join("|"), 'i')
}

const escapeRegExp = (word: string) => {
  const reRegExp: RegExp = /[\\^$.*+?()[\]{}|]/g
  return word.replace(reRegExp, '\\$&');
};
