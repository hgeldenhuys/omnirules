/* Copyright (C) AgileWorks, Inc - All Rights Reserved
 * License: AgileWorks Community License
 * Url: https://www.agileworks.co.za/agileworks-community-license
 */

/*
* Helper Functions
* */

import { assert, DecisionObject } from "./author";

export function getPath(path: string) {
    const paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}

export function addToBom(bom, path, defaultValue: any) {
    const root = bom;
    path = path.replace(/\[\]/g, ".?");
    const paths = getPath(`bom.${path}`);
    let parentNode: any = {};
    let child = "";
    paths.forEach((path) => {
        if (path !== "?") {
            parentNode = bom;
            try {
                if (bom[path] === undefined) {
                    bom[path] = {};
                }
            } catch (e) {
                console.error(`Failed path ${paths}: ${JSON.stringify(root, undefined, 2)}`);
                throw e;
            }
            bom = bom[path];
        }
        else {
            if (parentNode[child][0] === undefined) {
                parentNode[child] = [{}];
            }
            bom = parentNode[child][0];
            parentNode = bom;
        }
        child = path;
    });
    if (defaultValue !== undefined) {
        parentNode[child] = defaultValue;
        if (child === "?") {
            parentNode[child] = undefined;
        }
    }
    else {
        delete parentNode[child];
    }
    return root;
}

export function assertValueForPath(root: {}, paths: string[], testValue) {
    return getValueForPath(root, paths) + "" === testValue + "";
}


const registry = {};

export function load(name: string, version: string, rules: Rule[], schemaVersion: string): Rulesengine {
    assert(
        name !== void 0,
        `Missing rules engine name`,
        "RE-001");
    assert(
        version !== void 0,
        `Missing rules engine version`,
        "RE-002");
    if ((registry[name] !== void 0) && (registry[name][version])) {
        return registry[name][version];
    }
    if (registry[name] === void 0) {
        registry[name] = {};
    }
    if (registry[name][version] === void 0) {
        assert(
            rules !== void 0,
            `Missing rules for engine ${name}`,
            "RE-003");
        registry[name][version] = new Rulesengine(rules, {}, name, version, schemaVersion);
    }
    return registry[name][version];
}

export function getEngine(name: string, version: string): Rulesengine {
    assert(
        name !== void 0,
        `Missing rules engine name`,
        "RE-001");
    assert(
        version !== void 0,
        `Missing rules engine version`,
        "RE-002");
    assert(
        registry[name] !== void 0,
        `No engine loaded with name ${name}`,
        "RE-004");
    assert(
        registry[name][version] !== void 0,
        `Version ${version} not loaded for ${name}`,
        "RE-005");
    return registry[name][version];
}

export const engines = {
    load,
    loadDecisionObject(ds: DecisionObject) {
        load(ds.name, ds.version, ds.getRules().rules as Rule[], ds.schemaVersion());
    },
    getEngine
};

function censor(censor) {
    let i = 0;
    return (key, value) => {
        if (i !== 0 && typeof(censor) === "object" && typeof(value) === "object" && censor === value) {
            return "[Circular]";
        }
        if (i >= 100) { // seems to be a harded maximum of 30 serialized objects?
            return typeof value === "function" ? undefined : `${typeof value}`;
        }
        ++i; // so we know we aren't using the original object anymore
        return value;
    };
}
export const jlog = (obj) => {
    console.error(JSON.stringify(obj, censor(obj), 2));
};


/*
* The GoodStuff
* */

export enum RuleBehaviour {
    Always = "Always",
    Normal = "Normal",
    Some = "Some",
    Never = "Never"
}

export function getBOMValue(root: {}, path) {
    return getValueForPath(root, getPath(path));
}

export function getValueForPath(root: {}, paths: string[]) {
    let object = root;
    if (paths.length !== 0) {
        let indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        const normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        const remainderPaths = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach((path: string) => {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            // We have an array
            if (indexOfArray < paths.length) {
                const arr: any[] = object as any[];
                const vals = [];
                arr.forEach((item) => {
                    const arrValue = getValueForPath(item, remainderPaths);
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

export class Rule {
    public variables: string[] = [];
    public usedVariables: string[];
    public valid = false;
    public usedValues: {} = {};
    public path: {} = {};
    public execute(rule: Rule, engine: Rulesengine): Rule {
        if (rule.behaviour === RuleBehaviour.Never)  {
            this.execute = (rule: Rule, engine: Rulesengine): Rule => {return undefined; };
        } else {
            const fs =
                `fn=function(o,r){try{let bom=r.bomRoot;${this.code};if(result===undefined){return;}let e=r.bomRoot,n=r.bomRoot,s=o.name;o.name.split(".").forEach(function(o){e[o]===undefined?(e[o]={}):e[o],n=e,s=o,e=e[o]}),n[s]=result}catch(e){console.error("Error in "+o.name+"; Valid="+o.valid+"; Error:"+e.message+" "+e.stack+"}"),console.error("     "+o.usedVariables+": "+JSON.stringify(o.usedValues)),console.error("     "+JSON.stringify(r.bomRoot)),console.error("     Code: "+o.code),r.bomRoot.error=e}return o};`;
            let fn;
            fn = (rule: Rule, engine: Rulesengine): Rule => {
                return undefined;
            };
            eval(fs);
            this.execute = fn;
            return fn(this, engine);
        }
    }
    public constructor(public name: string, public code: string, public bom: {}, public behaviour: RuleBehaviour = RuleBehaviour.Normal) {
        this.code = `var result;${code}`;
        this.variables = Rule.findUsedBomVariablesInCode(code);
        this.variables.forEach((variable: string) => {
            this.path[variable] = getPath(variable);
        });
    }
    public calculate(): Rule {
        this.valid = this.valid || (this.variables.length === 0);
        if (!this.valid || (this.behaviour === RuleBehaviour.Always)) {
            this.usedVariables = [];
            this.variables.forEach((variable: string) => {
                this.usedValues[variable] = getValueForPath(this.bom, this.path[variable]);
                if (this.usedValues[variable] !== undefined) {
                    this.usedVariables.push(variable);
                }
            });
            this.valid = (this.variables.length === this.usedVariables.length) || ((this.behaviour === RuleBehaviour.Some) && (this.variables.length > 0)) || (this.behaviour === RuleBehaviour.Always);
        }
        return this;
    }
    public static findUsedBomVariablesInCode(code) {
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


export interface IRuleStructure {
    name: string;
    code: string;
    behaviour?: RuleBehaviour;
    absolute?: boolean;
    variables?: string[];
}

export interface IRunConfiguration {
    withStats?: boolean;
}

export class Rulesengine {
    public usedRules: Rule[] = [];
    public usedRuleNames: string[] = [];
    public iterations = 0;
    public maxIterations = 100;
    public rules: Rule[] = [];
    public placeBackInQueue = false;
    public getEngine = getEngine;
    constructor(
        public inputRules: IRuleStructure[],
        public bomRoot: any,
        public name?: string,
        public version?: string,
        public schemaVersion?: string,
        public validateInputs: string[] = []) {

        this.runInputValidation();

        inputRules.forEach((rule) => {
            this.rules.push(new Rule(rule.name, rule.code, bomRoot, rule.behaviour));
        });
        this.calculate();
    }
    public runInputValidation() {
        this.validateInputs.forEach((inputRule) => {
            if (assertValueForPath(this.bomRoot, getPath(`bom.${inputRule}`), undefined)) {
                eval(`throw new Error('Input "${inputRule}" is missing a value for "${this.name}": ${JSON.stringify(this.bomRoot)}')`);
            }
        });
    }
    public withBom(bom: any) {
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
    public instance(bom: {}): Rulesengine {
        return new Rulesengine(this.inputRules, bom);
    }
    public calculate() {
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
    public run(configuration?: IRunConfiguration) {
        this.iterations = 0;
        const start = new Date();
        let previousUsedRuleNames = "";
        let usedRuleNames = this.usedRuleNames.toString();
        while (previousUsedRuleNames !== usedRuleNames) {
            if (this.iterations >= this.maxIterations) {
                throw new Error(`Max iterations of ${this.maxIterations} reached.`);
            }
            this.iterations ++;
            this.usedRules.forEach((rule) => {
                try {
                    rule.execute(rule, this);
                } catch (e) {
                    console.error(rule.name + " " +  e + " " + e.stack);
                    this.bomRoot[rule.name] = undefined;
                    this.bomRoot.error = rule.name + " threw an error: " + e.toString();
                }
            });
            // What actually ran
            this.calculate();
            previousUsedRuleNames = usedRuleNames;
            usedRuleNames = this.usedRuleNames.toString();
        }
        if (!!configuration && !!configuration.withStats) {
            const end = new Date();
            if (!this.bomRoot.engine) this.bomRoot.engine = {};
            const engine = {
                runtime: {version: this.version,
                    schema: this.schemaVersion,
                    executionTime: end.valueOf() - start.valueOf(),
                    runIterations: this.iterations,
                    usedRuleNames: this.usedRuleNames,
                    unusedRules: this.rules.filter((rule) => {return !rule.valid; }).map((rule) => {return {name: rule.name, missing: rule.variables.filter((variable) => {return rule.usedVariables.indexOf(variable) === -1; })}; })},
                tableResults: {},
                conditions: this.bomRoot._conditions
            };
            this.bomRoot.engine[this.name] = engine;
            const processed = [];
            this.usedRuleNames.forEach((name, nameIndex) => {
                if ((name.indexOf("DecisionTable_") > -1) && (processed.indexOf(name) === -1)) {
                    processed.push(name);
                    const value = getValueForPath(this.bomRoot, getPath("bom." + name));
                    if (value) engine.tableResults[name] = value;
                }
            });
        }
        this.usedRuleNames.forEach((name, nameIndex) => {
            if ((name.indexOf("DecisionTable_") > -1)) {
                addToBom(this.bomRoot, name, undefined);
            }
        });
        delete this.bomRoot._conditions;
        // if (this.placeBackInQueue) {
        //     const waiting = SafeWorkerFactory.waiting(this);
        //     if (waiting) {
        //         waiting.resolve(this);
        //     } else {
        //         SafeWorkerFactory.placeBackInQueue(this);
        //         this.placeBackInQueue = false;
        //     }
        // }
        return this.bomRoot;
    }
    public mapRun(bomArray: {}[], path?: string, configuration?: IRunConfiguration) {
        const result = [];
        const paths = (path && getPath(path));
        bomArray.forEach((bom) => {
            const newBom = this.withBom(bom).run(configuration);
            if (!paths) {
                result.push(newBom);
            } else {
                result.push(getValueForPath(newBom, paths));
            }
        });
        return result;
    }
    public filterRun(bomArray: {}[], expression: string, path?: string, configuration?: IRunConfiguration) {
        const result = [];
        const paths = path && getPath(path);
        // Test if eval has valid expression
        {
            const bom = {};
            eval(expression);
        }
        bomArray.forEach((bomInput) => {
            const bom = this.withBom(bomInput).run(configuration);
            if (eval(expression)) {
                if (!paths) {
                    result.push(bom);
                } else {
                    result.push(getValueForPath(bom, paths));
                }
            }
        });
        return result;
    }
}
//
// export class SafeWorkerFactory {
//     private static workers: {} = {};
//     public static waiting(ruleEngine: Rulesengine) {
//         return SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`].waiting.pop();
//     }
//     public static placeBackInQueue(ruleEngine: Rulesengine) {
//         try {
//             SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`].available.unshift(ruleEngine);
//         } catch (e) {
//             console.error(`${ruleEngine.name}.${ruleEngine.version} ${JSON.stringify(SafeWorkerFactory.workers[`${ruleEngine.name}.${ruleEngine.version}`])} ${e}`);
//         }
//     }
//     public static registerWorkers(rules: IRuleStructure[], numberOfWorkers: number, name: string, version: string) {
//         const available = [];
//         SafeWorkerFactory.workers[`${name}.${version}`] = {
//             available,
//             waiting: []
//         };
//         for (let index = 0; index < numberOfWorkers; index++) {
//             available.push(new Rulesengine(rules, {}, name, version));
//         }
//         return SafeWorkerFactory.workers[`${name}.${version}`];
//     }
//     public static async getWorker(name: string, version: string) {
//         const collection = SafeWorkerFactory.workers[`${name}.${version}`];
//         const something = collection.available.pop();
//         if (!something) {
//             const promise = new Promise((resolve, reject) => {
//                 collection.waiting.push({resolve, reject});
//             });
//             const value = await promise;
//             return value;
//         } else {
//             something.placeBackInQueue = true;
//             return something;
//         }
//     }
// }
