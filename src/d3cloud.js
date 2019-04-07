"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jsdom = require("jsdom");
var JSDOM = jsdom.JSDOM;
var dom = new JSDOM("<!DOCTYPE html><p>Hello world</p>");
exports.document = dom.window.document;
global.document = exports.document;
var blockspring = require("blockspring"), fs = require("fs");
exports.d3 = require("d3");
global.d3 = exports.d3;
var cloud = require("d3.layout.cloud");
function processText(text) {
    var uniqueWordCounts = {}, excludeWords = "undefined,null,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,poop,shall", tokenizedText = text.split(/[ '\-\(\)\*":;\[\]|{},.!?]+/);
    tokenizedText.forEach(function (rawWord) {
        var word = rawWord.toLowerCase().trim().replace(/%/g, '');
        if ((word !== "") && (excludeWords.indexOf(word) === -1) && (word.length > 1) && (isNaN(word))) {
            console.log("word='" + rawWord + "' " + excludeWords.indexOf(word.toLowerCase()) + " " + word);
            word in uniqueWordCounts ?
                uniqueWordCounts[word]++ :
                (uniqueWordCounts[word] = 1 + Math.random());
        }
    });
    var wordmap = exports.d3.entries(uniqueWordCounts).sort(function (a, b) {
        return b.value - a.value;
    });
    return wordmap;
}
exports.processText = processText;
function drawCloud(wordmap, colorScheme, width, height, svg, rotateWords, callback) {
    if (colorScheme === void 0) { colorScheme = 0; }
    console.log(JSON.stringify(exports.d3.schemeCategory10));
    var max = Math.min(width / 5, height / 5, 100), fontSize = exports.d3.scaleLinear()
        .domain([1, exports.d3.max(wordmap, function (d) { return d.value; })])
        .range([max / 10, max]), fill = [
        ["#C21460", "#FE2410", "#FD5D08", "#B3D733", "#66AF31", "#347C98", "#FD7208", "#FBAA09", "#FDDC21", "#5918C9", "#9C0797", "#D51A46", "#FD7208", "#FBAA09", "#FDDC21", "#448D76"],
        ["#871A1A", "#F64747", "#EF4836", "#360000", "#D4533B", "#E73C4E", "#D24D57", "#F22613", "#D64541", "#D91E18", "#923026", "#800000"],
        ["#436E43", "#1BA39C", "#005031", "#005555", "#3A4D13", "#26A65B", "#00A566", "#16A085", "#5D995D", "#24A159", "#28A228", "#2A5547"],
        ["#00A4A6", "#527AC2", "#1460AA", "#2C3E50", "#3A539B", "#4B77BE", "#006080", "#2A7AB0", "#004055", "#34385E", "#22313F", "#00202A"],
        ["#448D76", "#1258DC", "#2E2FE3", "#347B98", "#0247FE", "#090934", "#4424D6", "#1258DC", "#2E2FE3", "#700CBC", "#B374E7", "#152679"],
        ["#871A1A", "#F64747", "#EF4836", "#360000", "#D4533B", "#E73C4E", "#D24D57", "#F22613", "#D64541", "#D91E18", "#923026", "#800000"],
        ["#436E43", "#1BA39C", "#005031", "#005555", "#3A4D13", "#26A65B", "#00A566", "#16A085", "#5D995D", "#24A159", "#28A228", "#2A5547"],
        ["#00A4A6", "#527AC2", "#1460AA", "#2C3E50", "#3A539B", "#4B77BE", "#006080", "#2A7AB0", "#004055", "#34385E", "#22313F", "#00202A"],
        ["#448D76", "#1258DC", "#2E2FE3", "#347B98", "#0247FE", "#090934", "#4424D6", "#1258DC", "#2E2FE3", "#700CBC", "#B374E7", "#152679"],
        ["#871A1A", "#F64747", "#EF4836", "#360000", "#D4533B", "#E73C4E", "#D24D57", "#F22613", "#D64541", "#D91E18", "#923026", "#800000"],
        ["#436E43", "#1BA39C", "#005031", "#005555", "#3A4D13", "#26A65B", "#00A566", "#16A085", "#5D995D", "#24A159", "#28A228", "#2A5547"],
        ["#00A4A6", "#527AC2", "#1460AA", "#2C3E50", "#3A539B", "#4B77BE", "#006080", "#2A7AB0", "#004055", "#34385E", "#22313F", "#00202A"],
        ["#448D76", "#1258DC", "#2E2FE3", "#347B98", "#0247FE", "#090934", "#4424D6", "#1258DC", "#2E2FE3", "#700CBC", "#B374E7", "#152679"]
    ][colorScheme];
    cloud().size([width, height])
        .words(wordmap)
        .timeInterval(20)
        .padding(3)
        .spiral("rectangular")
        .fontSize(function (d) { return fontSize(d.value); })
        .font("Impact")
        .text(function (d) { return d.key; })
        .rotate(function () {
        return rotateWords ? (~~(Math.random() * (Math.random() > 0.5 ? -1 : 1) * 45)) : 0;
    })
        .on("end", function (words) {
        cloud().stop();
        svg
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + [width >> 1, height >> 1] + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-family", "Impact")
            .style("font-size", function (d) { return fontSize(d.value) + "px"; })
            .style("fill", function (d, i) { return fill[i]; })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
            .text(function (d) { return d.key; });
        callback(exports.d3.select("body"));
    })
        .start();
}
exports.drawCloud = drawCloud;
//# sourceMappingURL=d3cloud.js.map