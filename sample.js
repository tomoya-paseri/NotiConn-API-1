const fs = require('fs');

// sample.json読み込み
let msg = fs.readFileSync("sample.json", {encoding: "utf-8"});

// JSON.parseする際に失敗するので改行文字など変な文字をreplace
msg = msg.replace(/\\n/g, "\\n")
.replace(/\\'/g, "\\'")
.replace(/\\"/g, '\\"')
.replace(/\\&/g, "\\&")
.replace(/\\r/g, "\\r")
.replace(/\\t/g, "\\t")
.replace(/\\b/g, "\\b")
.replace(/\\f/g, "\\f");
msg = msg.replace(/[\u0000-\u0019]+/g,"");

// parseしたものの、descriptionを一つずつ見てawsにマッチするイベントのみ抽出
const filteredEvents = JSON.parse(msg).events
    .filter(description => { return description.description.indexOf( 'aws' ) > 0 });

    // .map(event => { return {"description": event.description, "url": event.event_url } })
