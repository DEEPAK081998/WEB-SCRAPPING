//pass the seriesID as a Command Line Argument

let cheerio = require("cheerio");
let request = require("request");
let fs = require("fs");

let seriesId = process.argv[2];

let gcount=0;
let leaderboard=[];

request(`https://www.espncricinfo.com/scores/series/${seriesId}`, function (err, resp, html) {
    if (err === null && resp.statusCode === 200) {
        // fs.writeFileSync("index.html",html);
        // console.log("File Written To Disk");
        console.log("\tLEADERBOARD : \n");
        parseHtml(html);
    } else if (resp.statusCode === 404) {
        console.log("Page not Found : INVALID URL");
    } else {
        console.log(err);
        console.log(resp.statusCode);
    }
})

function parseHtml(html) {
    let d = cheerio.load(html);
    let cards = d(".cscore.cscore--final.cricket.cscore--watchNotes");
    // console.log(cards.length);
    for (let i = 0; i < cards.length; i++) {
        let matchType = d(cards[i]).find(".cscore_info-overview").text();
        // console.log(matchType);
        if (matchType.includes("T20") || matchType.includes("ODI")) {
            let anchor = d(cards[i]).find(".cscore_buttonGroup ul li a").attr("href");
            let matchLink = `https://www.espncricinfo.com${anchor}`
            // console.log(matchLink);
            GoToMatch(matchLink);
        }
    }
}

function GoToMatch(matchLink) {
    gcount++;
    request(`${matchLink}`, function (err, resp, html) {
        if (err === null && resp.statusCode === 200) {
            handleMatch(html);
            gcount--;
            if(gcount===0){
                console.table(leaderboard);
            }
        } else if (resp.statusCode === 404) {
            console.log("Page not Found : INVALID URL");
        } else {
            console.log(err);
            console.log(resp.statusCode);
        }
    })
}

function handleMatch(html) {
    let d = cheerio.load(html);
    let format = d(".cscore_info-overview").html();
    format=format.includes("ODI")?"ODI":"T20I";
    // console.log(format);
    let teams = d(".sub-module.scorecard h2");
    let innings = d(".sub-module.scorecard");
    for (let i = 0; i < innings.length; i++) {
        let team=d(teams[i]).text();
        // console.log("");
        let PlayerArray = d(innings[i]).find(".scorecard-section.batsmen .flex-row .wrap.batsmen");
        for (let j = 0; j < PlayerArray.length; j++) {    
            let PlayerName = d(PlayerArray[j]).find(".cell.batsmen").text();
            let PlayerRuns = d(d(PlayerArray[j]).find(".cell.runs")[0]).text();
            handlePlayer(format,team,PlayerName,PlayerRuns);
            // console.log(PlayerName + "  " + PlayerRuns);
        }
        // console.log("_____________________________________________________________");
    }
    // console.log("*************************************************************");
}

function handlePlayer(format,team,batsmanName,batsmanRuns){
    batsmanRuns=Number(batsmanRuns);
    for(let i=0;i<leaderboard.length;i++){
        let pObj=leaderboard[i];
        if(pObj.Name==batsmanName&&pObj.Team==team&&pObj.Format===format){
            pObj.Runs+=batsmanRuns;
            return;
        }
    }
    let obj={
        Runs:batsmanRuns,
        Format:format,
        Team:team,
        Name:batsmanName
    }
    leaderboard.push(obj);
}