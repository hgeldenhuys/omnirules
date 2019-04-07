"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const BOMEntry_1 = require("./BOMEntry");
const engines = {};
function getRulesEngine(id, version, rules, schemaVersion) {
    if (engines[id] === void 0) {
        engines[id] = {};
    }
    if (engines[id][version] === void 0) {
        engines[id][version] = new RulesEngine(rules, {}, id, version, schemaVersion);
    }
    return engines[id][version];
}
exports.getRulesEngine = getRulesEngine;
function censor(censor) {
    let i = 0;
    return (key, value) => {
        if (i !== 0 && typeof (censor) === "object" && typeof (value) === "object" && censor === value) {
            return "[Circular]";
        }
        if (i >= 100) {
            return typeof value === "function" ? undefined : `${typeof value}`;
        }
        ++i;
        return value;
    };
}
exports.jlog = (obj) => {
    console.error(JSON.stringify(obj, censor(obj), 2));
};
var RuleBehaviour;
(function (RuleBehaviour) {
    RuleBehaviour["Always"] = "Always";
    RuleBehaviour["Normal"] = "Normal";
    RuleBehaviour["Some"] = "Some";
    RuleBehaviour["Never"] = "Never";
})(RuleBehaviour = exports.RuleBehaviour || (exports.RuleBehaviour = {}));
function getPath(path) {
    const paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}
exports.getPath = getPath;
function getAllPaths(root, obj, result = []) {
    for (const attr in obj) {
        if (obj.hasOwnProperty(attr) && obj[attr] !== null && typeof (obj[attr]) === "object") {
            result = getAllPaths(root + "." + attr, obj[attr], result);
        }
        else {
            result.push({ path: root + "." + attr, value: obj[attr] });
        }
    }
    return result;
}
exports.getAllPaths = getAllPaths;
function getBOMValue(root, path) {
    return getValueForPath(root, getPath(path));
}
exports.getBOMValue = getBOMValue;
function getValueForPath(root, paths) {
    let object = root;
    if (paths.length !== 0) {
        let indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        const normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        const remainderPaths = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach((path) => {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            if (indexOfArray < paths.length) {
                const arr = object;
                const vals = [];
                arr.forEach((item) => {
                    const arrValue = this.getValueForPath(item, remainderPaths);
                    if (arrValue !== undefined) {
                        vals.push(arrValue);
                    }
                });
                object = vals.length === 0 ? undefined : vals;
            }
        }
        return object;
    }
}
exports.getValueForPath = getValueForPath;
class Rule {
    constructor(name, code, bom, behaviour = RuleBehaviour.Normal) {
        this.name = name;
        this.code = code;
        this.bom = bom;
        this.behaviour = behaviour;
        this.variables = [];
        this.valid = false;
        this.usedValues = {};
        this.path = {};
        this.debug = false;
        this.code = `var result;${code}`;
        this.variables = Rule.findUsedBomVariablesInCode(code);
        this.variables.forEach((variable) => {
            this.path[variable] = getPath(variable);
        });
    }
    execute(rule, engine) {
        if (rule.behaviour === RuleBehaviour.Never) {
            this.execute = (rule, engine) => { return undefined; };
        }
        else {
            const fs = `fn=function(o,r){try{let bom=r.bomRoot;${this.code};if(result===undefined){return;}let e=r.bomRoot,n=r.bomRoot,s=o.name;o.name.split(".").forEach(function(o){e[o]===undefined?(e[o]={}):e[o],n=e,s=o,e=e[o]}),n[s]=result}catch(e){console.error("Error in "+o.name+"; Valid="+o.valid+"; Error:"+e.message+" "+e.stack+"}"),console.error("     "+o.usedVariables+": "+JSON.stringify(o.usedValues)),console.error("     "+JSON.stringify(r.bomRoot)),console.error("     Code: "+o.code),r.bomRoot.error=e}return o};`;
            let fn;
            fn = (rule, engine) => {
                return undefined;
            };
            eval(fs);
            this.execute = fn;
            return fn(this, engine);
        }
    }
    calculate() {
        this.valid = this.valid || (this.variables.length === 0);
        if (!this.valid || (this.behaviour === RuleBehaviour.Always)) {
            this.usedVariables = [];
            this.variables.forEach((variable) => {
                this.usedValues[variable] = getValueForPath(this.bom, this.path[variable]);
                if (this.usedValues[variable] !== undefined) {
                    this.usedVariables.push(variable);
                }
            });
            this.valid = (this.variables.length === this.usedVariables.length) || ((this.behaviour === RuleBehaviour.Some) && (this.variables.length > 0)) || (this.behaviour === RuleBehaviour.Always);
        }
        return this;
    }
    static findUsedBomVariablesInCode(code) {
        const bomVariablesRx = /bom\.([A-Za-z_])+([A-Za-z_0-9\.\[\]])*/g;
        const bomVariables = code.match(bomVariablesRx);
        const arrayExpressionsRx = /\[([A-Za-z0-9\+_'' \(\)\t\n\[\]])+\]/g;
        if (bomVariables === null) {
            return [];
        }
        for (let i = 0; i < bomVariables.length; i++) {
            bomVariables[i] = bomVariables[i].replace(arrayExpressionsRx, ".?");
        }
        return bomVariables.filter((variable, index, array) => {
            return array.lastIndexOf(variable) === index;
        });
    }
}
exports.Rule = Rule;
class RulesEngine {
    constructor(inputRules, bomRoot, name, version, schemaVersion, validateInputs = []) {
        this.inputRules = inputRules;
        this.bomRoot = bomRoot;
        this.name = name;
        this.version = version;
        this.schemaVersion = schemaVersion;
        this.validateInputs = validateInputs;
        this.usedRules = [];
        this.usedRuleNames = [];
        this.iterations = 0;
        this.maxIterations = 100;
        this.rules = [];
        this.addToBom = BOMEntry_1.addToBom;
        this.placeBackInQueue = false;
        this.runInputValidation();
        inputRules.forEach((rule) => {
            this.rules.push(new Rule(rule.name, rule.code, bomRoot, rule.behaviour));
        });
        this.calculate();
    }
    runInputValidation() {
        this.validateInputs.forEach((inputRule) => {
            if (BOMEntry_1.assertValueForPath(this.bomRoot, getPath(`bom.${inputRule}`), undefined)) {
                eval(`throw new Error('Input "${inputRule}" is missing a value for "${this.name}": ${JSON.stringify(this.bomRoot)}')`);
            }
        });
    }
    reset(bom) {
        this.bomRoot = bom;
        this.usedRules = [];
        this.usedRuleNames = [];
        this.rules.forEach((rule) => {
            rule.valid = false;
            rule.bom = bom;
            if ((rule.valid !== rule.calculate().valid) && (rule.valid)) {
                if (this.usedRuleNames.indexOf(rule.name) === -1) {
                    this.usedRules.push(rule);
                    this.usedRuleNames.push(rule.name);
                }
            }
        });
        return this;
    }
    instance(bom) {
        return new RulesEngine(this.inputRules, bom);
    }
    calculate() {
        this.rules.forEach((rule) => {
            if ((rule.valid !== rule.calculate().valid) && (rule.valid)) {
                if (this.usedRuleNames.indexOf(rule.name) === -1) {
                    this.usedRules.push(rule);
                    this.usedRuleNames.push(rule.name);
                }
            }
        });
        return this;
    }
    run(configuration) {
        this.iterations = 0;
        const start = new Date();
        let previousUsedRuleNames = "";
        let usedRuleNames = this.usedRuleNames.toString();
        while (previousUsedRuleNames !== usedRuleNames) {
            if (this.iterations >= this.maxIterations) {
                throw new Error(`Max iterations of ${this.maxIterations} reached.`);
            }
            this.iterations++;
            this.usedRules.forEach((rule) => {
                try {
                    rule.execute(rule, this);
                }
                catch (e) {
                    console.error(rule.name + " " + e + " " + e.stack);
                    this.bomRoot[rule.name] = undefined;
                    this.bomRoot.error = rule.name + " threw an error: " + e.toString();
                }
            });
            this.calculate();
            previousUsedRuleNames = usedRuleNames;
            usedRuleNames = this.usedRuleNames.toString();
        }
        if (!!configuration && !!configuration.withStats) {
            const end = new Date();
            if (!this.bomRoot.engine)
                this.bomRoot.engine = {};
            const engine = {
                runtime: { version: this.version,
                    schema: this.schemaVersion,
                    executionTime: end.valueOf() - start.valueOf(),
                    runIterations: this.iterations,
                    usedRuleNames: this.usedRuleNames,
                    unusedRules: this.rules.filter((rule) => { return !rule.valid; }).map((rule) => { return { name: rule.name, missing: rule.variables.filter((variable) => { return rule.usedVariables.indexOf(variable) === -1; }) }; }) },
                tableResults: {},
                conditions: this.bomRoot._conditions
            };
            this.bomRoot.engine[this.name] = engine;
            const processed = [];
            this.usedRuleNames.forEach((name, nameIndex) => {
                if ((name.indexOf("DecisionTable_") > -1) && (processed.indexOf(name) === -1)) {
                    processed.push(name);
                    const value = getValueForPath(this.bomRoot, getPath("bom." + name));
                    if (value)
                        engine.tableResults[name] = value;
                }
            });
        }
        this.usedRuleNames.forEach((name, nameIndex) => {
            if ((name.indexOf("DecisionTable_") > -1)) {
                BOMEntry_1.addToBom(this.bomRoot, name, undefined);
            }
        });
        delete this.bomRoot._conditions;
        if (this.placeBackInQueue) {
            const waiting = SafeWorkerFactory.waiting(this);
            if (waiting) {
                waiting.resolve(this);
            }
            else {
                SafeWorkerFactory.placeBackInQueue(this);
                this.placeBackInQueue = false;
            }
        }
        return this.bomRoot;
    }
    mapRun(bomArray, path, configuration) {
        const result = [];
        const paths = (path && getPath(path));
        bomArray.forEach((bom) => {
            const newBom = this.reset(bom).run(configuration);
            if (!paths) {
                result.push(newBom);
            }
            else {
                result.push(getValueForPath(newBom, paths));
            }
        });
        return result;
    }
    filterRun(bomArray, expression, path, configuration) {
        const result = [];
        const paths = path && getPath(path);
        {
            const bom = {};
            eval(expression);
        }
        bomArray.forEach((bomInput) => {
            const bom = this.reset(bomInput).run(configuration);
            if (eval(expression)) {
                if (!paths) {
                    result.push(bom);
                }
                else {
                    result.push(getValueForPath(bom, paths));
                }
            }
        });
        return result;
    }
}
exports.RulesEngine = RulesEngine;
class SafeWorkerFactory {
    static waiting(ruleEngine) {
        return SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`].waiting.pop();
    }
    static placeBackInQueue(ruleEngine) {
        try {
            SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`].available.unshift(ruleEngine);
        }
        catch (e) {
            console.error(`${ruleEngine.name}.${ruleEngine.version} ${JSON.stringify(SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`])} ${e}`);
        }
    }
    static registerWorkers(rules, numberOfWorkers, name, version) {
        const available = [];
        SafeWorkerFactory.workers[`${name}.${version}`] = {
            available,
            waiting: []
        };
        for (let index = 0; index < numberOfWorkers; index++) {
            available.push(new RulesEngine(rules, {}, name, version));
        }
        return SafeWorkerFactory.workers[`${name}.${version}`];
    }
    static getWorker(name, version) {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = SafeWorkerFactory.workers[`${name}.${version}`];
            const something = collection.available.pop();
            if (!something) {
                const promise = new Promise((resolve, reject) => {
                    collection.waiting.push({ resolve, reject });
                });
                const value = yield promise;
                return value;
            }
            else {
                something.placeBackInQueue = true;
                return something;
            }
        });
    }
}
SafeWorkerFactory.workers = {};
exports.SafeWorkerFactory = SafeWorkerFactory;
//# sourceMappingURL=RulesEngine.js.map