let cheerio=require("cheerio");
let request = require("request");
let fs=require("fs");

request("https://www.espncricinfo.com/series/19322/commentary/1187683",function(err,resp,html){
    if(err===null&&resp.statusCode===200){
        // fs.writeFileSync("index.html",html);
        // console.log("File Written To Disk");
        console.log("\nLAST BALL COMMENTARY : ");
        parseHtml(html);
    }else if(resp.statusCode===404){
        console.log("Page not Found : INVALID URL");
    }else{
        console.log(err);
        console.log(resp.statusCode);
    }
})

function parseHtml(html){
    let $=cheerio.load(html);
    let comm=$(".item-wrapper .description");
    let lbc=$(comm[0]).text();
    console.log(lbc);
}
