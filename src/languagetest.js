"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const natural = require("natural");
const classifier = new natural.BayesClassifier();
const porter = natural.PorterStemmer;
const lancaster = natural.LancasterStemmer;
console.log(porter.stem("gives"));
console.log(porter.stem("gave"));
console.log(porter.stem("giving"));
console.log(porter.stem("given"));
console.log(porter.stem("giver"));
console.log(porter.stem("applicant"));
porter.attach();
const nounInflector = new natural.NounInflector();
console.log(nounInflector.pluralize("radius"));
console.log(nounInflector.singularize("beers"));
console.log(nounInflector.singularize("monthly incomes"));
classifier.addDocument("Applicant must be over 21 years of age if male", "IsOfAge");
classifier.addDocument("Applicant must be over 18 years of age if female", "IsOfAge");
classifier.addDocument("Applicant has Monthly Income greater than $1200", "HasMinimumIncome");
classifier.addDocument("An income is how much money you earn on a monthly basis", "HasMinimumIncome");
classifier.addDocument("Is Of Age and Has Minimum Income", "IsEligible");
classifier.train();
console.log(`"how old are you?" is related to the rule for ${classifier.classify("how old are you?")}`);
console.log(`"what are your monthly earnings?" is related to the rule for  ${classifier.classify("what are your monthly earnings?")}`);
console.log(`"what is your income?" is related to the rule for  ${classifier.classify("what is your income?")}`);
console.log(`"are you of age and have the min income?" is related to the rule for  ${classifier.classify("are you of age and have the min income?")}`);
console.log(`"are you of age and have the min income?" is related to the rule for  ${JSON.stringify(classifier.getClassifications("are you of age and have the min income?"))}`);
let path = require("path");
let baseFolder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
let rulesFilename = baseFolder + "/data/English/tr_from_posjs.txt";
let lexiconFilename = baseFolder + "/data/English/lexicon_from_posjs.json";
let defaultCategory = "N";
let lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
let rules = new natural.RuleSet(rulesFilename);
let tagger = new natural.BrillPOSTagger(lexicon, rules);
const tokenizer = new natural.WordPunctTokenizer();
function stringValue(str) {
    try {
        return JSON.stringify(eval(str));
    }
    catch (e) {
        return `"${str}"`;
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
function tokenizeRules(data, useTokenizer = UseTokenizer.WordPunct) {
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const tokens = sentenceTokenizer.tokenize(data);
    let tokenizer;
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
    const ruleTokens = tokens.map((token) => {
        return tagger.tag(tokenizer.tokenize(token));
    });
    ruleTokens.forEach((tokens) => {
        tokens.taggedWords.forEach((word) => {
            word.stem = {
                porter: porter.stem(word.token),
                lancaster: lancaster.stem(word.token)
            };
        });
    });
    return ruleTokens;
}
exports.tokenizeRules = tokenizeRules;
function createRules(tokens) {
    let path = "";
    let oper = "";
    const result = {
        conditions: [],
        result: "void 0"
    };
    tokens.taggedWords.forEach((word) => {
        if (word.tag === "NN") {
            const paths = path.split(".");
            if (paths.pop() !== word.token) {
                path = `${path}${path !== "" ? "." : ""}${word.token}`;
            }
            oper = "";
        }
        else if ((word.tag === "N") || (word.tag === "JJ") || (word.tag === "NNP")) {
            if (path.indexOf(".result") > -1) {
                result.result = word.token;
                const paths = path.split(".");
                if (paths.pop() !== word.token) {
                    path = `${path}${path !== "" ? "." : ""}${word.token}`;
                }
                oper = "";
            }
            else {
                result.conditions.push(`${path} ${oper} ${stringValue(word.token)}`);
                const paths = path.split(".");
                paths.pop();
                path = paths.join(".");
                oper = "";
            }
        }
        else if (word.tag === "VBZ") {
            oper += "==";
        }
        else if ((word.tag === "RB") && (word.token.toLowerCase() === "not")) {
            oper = "!" + oper;
        }
        else if (word.tag === "JJR") {
            oper = (word.token === "greater" ? ">" : word.token === "less" ? "<" : "?") + oper;
        }
        else if ((word.tag === "CC") && (word.token === "or")) {
            console.error("Do not use an OR when defining rules. Instead add another rule and convert to AND logical statements.");
        }
    });
    return result;
}
exports.createRules = createRules;
const paragraph = `
If the applicant's age is 18 then the result is false.
If the applicant's age is greater than 21 years and gender is male then the result is true.
Whenever the applicant's age is greater than 20 years and gender is female then the result is true.
When the applicant's age is less than 20 years and the applicant's gender is not female then the result is false.
If the applicant's name is Vanessa, then the result is false;

`;
function generateCode(paragraph) {
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const tokens = sentenceTokenizer.tokenize(paragraph);
    const wordTokenizer = new natural.WordPunctTokenizer();
    const ruleTokens = tokens.map((token) => {
        return tagger.tag(wordTokenizer.tokenize(token));
    }).filter((tokens) => {
        console.log(`tokens.taggedWords[0].tag = ${tokens.taggedWords[0].tag}`);
        return tokens.taggedWords && tokens.taggedWords[0] && (["IN", "WRB", "VBN"].indexOf(tokens.taggedWords[0].tag) > -1);
    });
    ruleTokens.forEach((tokens) => {
        tokens.taggedWords.forEach((word) => {
            return word.stem = porter.stem(word.token);
        });
    });
    const ruleSet = ruleTokens.map((ruleToken) => {
        return createRules(ruleToken);
    });
    const lines = ["result = void 0;"].concat(ruleSet.map((rule) => {
        const conditions = [`result === void 0`].concat(rule.conditions);
        return `if ((${conditions.join(") && (")})) {
    result = ${stringValue(rule.result)};
}`;
    }));
    console.log(`${ruleTokens.length} RuleTokens:
${JSON.stringify(ruleTokens, undefined, 2)}`);
    return lines.join("\n");
}
exports.generateCode = generateCode;
console.log(`
Paragraph:
${paragraph}

Code:
${generateCode(paragraph)}`);
//# sourceMappingURL=languagetest.js.map