"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var natural = require("natural");
var classifier = new natural.BayesClassifier();
var porter = natural.PorterStemmer;
var lancaster = natural.LancasterStemmer;
console.log(porter.stem("gives"));
console.log(porter.stem("gave"));
console.log(porter.stem("giving"));
console.log(porter.stem("given"));
console.log(porter.stem("giver"));
console.log(porter.stem("applicant"));
porter.attach();
var nounInflector = new natural.NounInflector();
console.log(nounInflector.pluralize("radius"));
console.log(nounInflector.singularize("beers"));
console.log(nounInflector.singularize("monthly incomes"));
classifier.addDocument("Applicant must be over 21 years of age if male", "IsOfAge");
classifier.addDocument("Applicant must be over 18 years of age if female", "IsOfAge");
classifier.addDocument("Applicant has Monthly Income greater than $1200", "HasMinimumIncome");
classifier.addDocument("An income is how much money you earn on a monthly basis", "HasMinimumIncome");
classifier.addDocument("Is Of Age and Has Minimum Income", "IsEligible");
classifier.train();
console.log("\"how old are you?\" is related to the rule for " + classifier.classify("how old are you?"));
console.log("\"what are your monthly earnings?\" is related to the rule for  " + classifier.classify("what are your monthly earnings?"));
console.log("\"what is your income?\" is related to the rule for  " + classifier.classify("what is your income?"));
console.log("\"are you of age and have the min income?\" is related to the rule for  " + classifier.classify("are you of age and have the min income?"));
console.log("\"are you of age and have the min income?\" is related to the rule for  " + JSON.stringify(classifier.getClassifications("are you of age and have the min income?")));
var path = require("path");
var baseFolder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = baseFolder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = baseFolder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = "N";
var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);
var tokenizer = new natural.WordPunctTokenizer();
function stringValue(str) {
    try {
        return JSON.stringify(eval(str));
    }
    catch (e) {
        return "\"" + str + "\"";
    }
}
var UseTokenizer;
(function (UseTokenizer) {
    UseTokenizer["WordPunct"] = "wordPunct";
    UseTokenizer["Word"] = "word";
    UseTokenizer["Case"] = "case";
    UseTokenizer["Regexp"] = "regexp";
    UseTokenizer["Orthography"] = "orthography";
    UseTokenizer["TreebankWord"] = "treebankWord";
    UseTokenizer["AggressiveEn"] = "aggressiveEn";
    UseTokenizer["AggressiveFr"] = "aggressiveFr";
})(UseTokenizer = exports.UseTokenizer || (exports.UseTokenizer = {}));
function tokenizeRules(data, useTokenizer) {
    if (useTokenizer === void 0) { useTokenizer = UseTokenizer.WordPunct; }
    var sentenceTokenizer = new natural.SentenceTokenizer();
    var tokens = sentenceTokenizer.tokenize(data);
    var tokenizer;
    if (useTokenizer === UseTokenizer.Word) {
        tokenizer = new natural.WordTokenizer();
    }
    if (useTokenizer === UseTokenizer.WordPunct) {
        tokenizer = new natural.WordPunctTokenizer();
    }
    else if (useTokenizer === UseTokenizer.Case) {
        tokenizer = new natural.CaseTokenizer();
    }
    else if (useTokenizer === UseTokenizer.Regexp) {
        tokenizer = new natural.RegexpTokenizer();
    }
    else if (useTokenizer === UseTokenizer.Orthography) {
        tokenizer = new natural.OrthographyTokenizer();
    }
    else if (useTokenizer === UseTokenizer.TreebankWord) {
        tokenizer = new natural.TreebankWordTokenizer();
    }
    else if (useTokenizer === UseTokenizer.AggressiveEn) {
        tokenizer = new natural.AggressiveTokenizer();
    }
    else if (useTokenizer === UseTokenizer.AggressiveFr) {
        tokenizer = new natural.AggressiveTokenizerFr();
    }
    else {
        tokenizer = new natural.WordPunctTokenizer();
    }
    var ruleTokens = tokens.map(function (token) {
        return tagger.tag(tokenizer.tokenize(token));
    });
    ruleTokens.forEach(function (tokens) {
        tokens.taggedWords.forEach(function (word) {
            word.stem = {
                porter: porter.stem(word.alias),
                lancaster: lancaster.stem(word.alias)
            };
        });
    });
    return ruleTokens;
}
exports.tokenizeRules = tokenizeRules;
function createRules(tokens) {
    var path = "";
    var oper = "";
    var result = {
        conditions: [],
        result: "void 0"
    };
    tokens.taggedWords.forEach(function (word) {
        if (word.tag === "NN") {
            var paths = path.split(".");
            if (paths.pop() !== word.alias) {
                path = "" + path + (path !== "" ? "." : "") + word.alias;
            }
            oper = "";
        }
        else if ((word.tag === "N") || (word.tag === "JJ") || (word.tag === "NNP")) {
            if (path.indexOf(".result") > -1) {
                result.result = word.alias;
                var paths = path.split(".");
                if (paths.pop() !== word.alias) {
                    path = "" + path + (path !== "" ? "." : "") + word.alias;
                }
                oper = "";
            }
            else {
                result.conditions.push(path + " " + oper + " " + stringValue(word.alias));
                var paths = path.split(".");
                paths.pop();
                path = paths.join(".");
                oper = "";
            }
        }
        else if (word.tag === "VBZ") {
            oper += "==";
        }
        else if ((word.tag === "RB") && (word.alias.toLowerCase() === "not")) {
            oper = "!" + oper;
        }
        else if (word.tag === "JJR") {
            oper = (word.alias === "greater" ? ">" : word.alias === "less" ? "<" : "?") + oper;
        }
        else if ((word.tag === "CC") && (word.alias === "or")) {
            console.error("Do not use an OR when defining rules. Instead add another rule and convert to AND logical statements.");
        }
    });
    return result;
}
exports.createRules = createRules;
var paragraph = "\n\nIf an applicant has a diploma and the applicant has experience greater than 2 years, the result is true.\n";
function generateCode(paragraph) {
    var sentenceTokenizer = new natural.SentenceTokenizer();
    var tokens = sentenceTokenizer.tokenize(paragraph);
    var wordTokenizer = new natural.WordPunctTokenizer();
    var ruleTokens = tokens.map(function (token) {
        return tagger.tag(wordTokenizer.tokenize(token));
    }).filter(function (tokens) {
        console.log("tokens.taggedWords[0].tag = " + tokens.taggedWords[0].tag);
        return tokens.taggedWords && tokens.taggedWords[0] && (["IN", "WRB", "VBN"].indexOf(tokens.taggedWords[0].tag) > -1);
    });
    ruleTokens.forEach(function (tokens) {
        tokens.taggedWords.forEach(function (word) {
            return word.stem = porter.stem(word.alias);
        });
    });
    var ruleSet = ruleTokens.map(function (ruleToken) {
        return createRules(ruleToken);
    });
    var lines = ["result = void 0;"].concat(ruleSet.map(function (rule) {
        var conditions = ["result === void 0"].concat(rule.conditions);
        return "if ((" + conditions.join(") && (") + ")) {\n    result = " + stringValue(rule.result) + ";\n}";
    }));
    console.log(ruleTokens.length + " RuleTokens:\n" + JSON.stringify(ruleTokens, undefined, 2));
    return lines.join("\n");
}
exports.generateCode = generateCode;
console.log("\nParagraph:\n" + paragraph + "\n\nCode:\n" + generateCode(paragraph));
//# sourceMappingURL=languagetest.js.map