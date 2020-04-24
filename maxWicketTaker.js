//pass the seriesID and matchID as a Command Line Argument

let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");

let seriesId=process.argv[2];
let matchId=process.argv[3];

request(`https://www.espncricinfo.com/series/${seriesId}/scorecard/${matchId}`, function (err, resp, html) {
    if (err === null && resp.statusCode === 200) {
        // fs.writeFileSync("index.html",html);
        // console.log("File Written To Disk");
        parseHtml(html);
    } else if (resp.statusCode === 404) {
        console.log("Page not Found : INVALID URL");
    } else {
        console.log(err);
        console.log(resp.statusCode);
    }
})

function parseHtml(html) {
    let $ = cheerio.load(html);
    let playerdata = $(".scorecard-section.bowling table tbody tr");
    let maxwickets = 0;
    let maxwicketstaker = "";
    for (let i = 0; i < playerdata.length; i++) {
        let playerName = $($(playerdata[i]).find("td")[0]).text();
        let playerWickets = $($(playerdata[i]).find("td")[5]).text();
        if (playerWickets > maxwickets) {
            maxwickets = playerWickets;
            maxwicketstaker = playerName;
        }
        // console.log(playerName+"  "+playerWickets);
    }
    console.log("Maximum Wicket Taker : "+maxwicketstaker +"\t"+" Maximum Wickets : " + maxwickets);
}