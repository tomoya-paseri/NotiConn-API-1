import { getEventsReq } from '../../domain/event'
// match検索出来るように正規表現形式にする
export function parseToInput (req: any): getEventsReq {
  let topicstr: string[] = req.topics
  let pref: number = req.pref
  if (pref === 0) topicstr.push('リモート');
  const topics: RegExp = new RegExp(topicstr.map(t => escapeRegExp(t)).join("|"), 'i')
  const inputEvents: getEventsReq = {
    topics: topics,
    pref: pref
  }
  return inputEvents
}

const escapeRegExp = (word: string) => {
  const reRegExp: RegExp = /[\\^$.*+?()[\]{}|]/g
  return word.replace(reRegExp, '\\$&');
};
