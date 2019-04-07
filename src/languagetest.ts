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
//
// // @ts-ignore
// console.log("i stemmed words.".tokenizeAndStem());
// // @ts-ignore
// console.log("i stemmed words.".tokenizeAndStem(true));

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

// Business Narrative

console.log(`"how old are you?" is related to the rule for ${classifier.classify("how old are you?")}`);
console.log(`"what are your monthly earnings?" is related to the rule for  ${classifier.classify("what are your monthly earnings?")}`);
console.log(`"what is your income?" is related to the rule for  ${classifier.classify("what is your income?")}`);
console.log(`"are you of age and have the min income?" is related to the rule for  ${classifier.classify("are you of age and have the min income?")}`);
console.log(`"are you of age and have the min income?" is related to the rule for  ${JSON.stringify(classifier.getClassifications("are you of age and have the min income?"))}`);


// const TfIdf = natural.TfIdf,
//     tfidf = new TfIdf();
//
// tfidf.addDocument(["document", "about", "node"]);
// tfidf.addDocument(["document", "about", "ruby"]);
// tfidf.addDocument(["document", "about", "ruby", "node"]);
// tfidf.addDocument(["document", "about", "node", "node"]);
//
// tfidf.tfidfs(["node", "ruby"], (i, measure) => {
//     console.log("document #" + i + " is " + measure);
// });


let path = require("path");
let baseFolder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
let rulesFilename = baseFolder + "/data/English/tr_from_posjs.txt";
let lexiconFilename = baseFolder + "/data/English/lexicon_from_posjs.json";
let defaultCategory = "N";

let lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
let rules = new natural.RuleSet(rulesFilename);
let tagger = new natural.BrillPOSTagger(lexicon, rules);



// const generateRule = (word) => {
//     const result = [];
//     if (word.tag === "NN") {
//         const paths = path2.split(".");
//         if (paths.pop() !== word.token) {
//             path2 = `${path2}${path2 !== "" ? "." : ""}${word.token}`;
//         }
//     } else if ((word.tag === "N") || (word.tag === "JJ")) {
//         result.push(`   ${path2} ${oper} ${word.token}`);
//         const paths = path2.split(".");
//         paths.pop();
//         path2 = paths.join(".");
//         oper = "";
//     } else if (word.tag === "VBZ") {
//         oper += "=";
//     } else if (word.tag === "RB") {
//         oper = "!" + oper;
//     } else if (word.tag === "JJR") {
//         oper = (word.token === "greater" ? ">" : word.token === "less" ? "<" : "?") + oper;
//     } else if ((word.tag === "CC") && (word.token === "or")) {
//         console.error("Do not use an OR when defining rules. Instead add another rule and convert to AND logical statements.");
//     }
// };

// const s1 = "If the applicant's age is greater than 21 years and gender is male then the result is true";
// const s2 = "If the applicant's age is greater than 20 years and gender is female";
// const s3 = "If the applicant's age is less than 20 years and the applicant's gender is not female";
// const s4 = "If the applicant's age is not undefined and the applicant's gender is not female";
// // @ts-ignore
// let sentence = tokenizer.tokenize(s1);
// // @ts-ignore
// let sentence2 = tokenizer.tokenize(s2);
// // @ts-ignore
// let sentence3 = tokenizer.tokenize(s3);
// // @ts-ignore
// let sentence4 = tokenizer.tokenize(s4);
// console.log(s1);
// // console.log(tagger.tag(sentence));
// let path2 = "";
// let oper = "";
// tagger.tag(sentence).taggedWords.forEach(generateRule);
// console.log(s2);
// // console.log(tagger.tag(sentence2));
// path2 = "";
// tagger.tag(sentence2).taggedWords.forEach(generateRule);
// console.log(s3);
// // console.log(tagger.tag(sentence3));
// path2 = "";
// tagger.tag(sentence3).taggedWords.forEach(generateRule);
// console.log(s4);
// // console.log(tagger.tag(sentence4));
// path2 = "";
// tagger.tag(sentence4).taggedWords.forEach(generateRule);

const tokenizer = new natural.WordPunctTokenizer();

function stringValue(str) {
    try {
        return JSON.stringify(eval(str));
    } catch (e) {
        return `"${str}"`;
    }
}

export enum UseTokenizer {
    WordPunct = "wordPunct",
    Word = "word",
    Case = "case",
    Regexp = "regexp",
    Orthography = "orthography",
    TreebankWord = "treebankWord",
    AggressiveEn = "aggressiveEn",
    AggressiveFr = "aggressiveFr"
}

export function tokenizeRules(data, useTokenizer: UseTokenizer = UseTokenizer.WordPunct) {
    const sentenceTokenizer = new natural.SentenceTokenizer();
    const tokens = sentenceTokenizer.tokenize(data);
    let tokenizer;
    if (useTokenizer === UseTokenizer.Word) {
        tokenizer = new natural.WordTokenizer();
    } if (useTokenizer === UseTokenizer.WordPunct) {
        tokenizer = new natural.WordPunctTokenizer();
    } else if (useTokenizer === UseTokenizer.Case) {
        tokenizer = new natural.CaseTokenizer();
    } else if (useTokenizer === UseTokenizer.Regexp) {
        tokenizer = new natural.RegexpTokenizer();
    } else if (useTokenizer === UseTokenizer.Orthography) {
        tokenizer = new natural.OrthographyTokenizer();
    } else if (useTokenizer === UseTokenizer.TreebankWord) {
        tokenizer = new natural.TreebankWordTokenizer();
    } else if (useTokenizer === UseTokenizer.AggressiveEn) {
        tokenizer = new natural.AggressiveTokenizer();
    } else if (useTokenizer === UseTokenizer.AggressiveFr) {
        tokenizer = new natural.AggressiveTokenizerFr();
    } else {
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

export function createRules(tokens) {
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
        } else if ((word.tag === "N") || (word.tag === "JJ") || (word.tag === "NNP")) {
            if (path.indexOf(".result") > -1) {
                result.result = word.token;
                const paths = path.split(".");
                if (paths.pop() !== word.token) {
                    path = `${path}${path !== "" ? "." : ""}${word.token}`;
                }
                oper = "";
            } else {
                result.conditions.push(`${path} ${oper} ${stringValue(word.token)}`);
                const paths = path.split(".");
                paths.pop();
                path = paths.join(".");
                oper = "";
            }
        } else if (word.tag === "VBZ") {
            oper += "==";
        } else if ((word.tag === "RB") && (word.token.toLowerCase() === "not")) {
            oper = "!" + oper;
        // } else if ((word.tag === "RB") && (word.token.toLowerCase() === "then")) {
        //     oper = "";
        //     path = "";
        } else if (word.tag === "JJR") {
            oper = (word.token === "greater" ? ">" : word.token === "less" ? "<" : "?") + oper;
        } else if ((word.tag === "CC") && (word.token === "or")) {
            console.error("Do not use an OR when defining rules. Instead add another rule and convert to AND logical statements.");
        }
    });
    return result;
}

// If the applicant's age is 18 then the applicant is not of age.
// If the applicant's age is 18 then the applicant is not ofAge. (replace "not ${ruleName}" with "result is false" and "${ruleName}" with "${result} is true")
const paragraph = `
If the applicant's age is 18 then the result is false.
If the applicant's age is greater than 21 years and gender is male then the result is true.
Whenever the applicant's age is greater than 20 years and gender is female then the result is true.
When the applicant's age is less than 20 years and the applicant's gender is not female then the result is false.
If the applicant's name is Vanessa, then the result is false;

`;
export function generateCode(paragraph) {
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

//     console.log(`Paragraph:
// ${paragraph}`);
//     console.log(`Tokens1:
// ${JSON.stringify(tokens, undefined, 2)}`);
//     console.log(`Rules:
// ${JSON.stringify(ruleSet, undefined, 2)}`);
}

console.log(`
Paragraph:
${paragraph}

Code:
${generateCode(paragraph)}`);

