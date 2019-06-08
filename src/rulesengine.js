"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var author_1 = require("./author");
function getPath(path) {
    var paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}
exports.getPath = getPath;
function addToBom(bom, path, defaultValue) {
    var root = bom;
    path = path.replace(/\[\]/g, ".?");
    var paths = getPath("bom." + path);
    var parentNode = {};
    var child = "";
    paths.forEach(function (path) {
        if (path !== "?") {
            parentNode = bom;
            try {
                if (bom[path] === undefined) {
                    bom[path] = {};
                }
            }
            catch (e) {
                console.error("Failed path " + paths + ": " + JSON.stringify(root, undefined, 2));
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
exports.addToBom = addToBom;
function assertValueForPath(root, paths, testValue) {
    return getValueForPath(root, paths) + "" === testValue + "";
}
exports.assertValueForPath = assertValueForPath;
var registry = {};
function load(name, version, rules, schemaVersion) {
    author_1.assert(name !== void 0, "Missing rules engine name", "RE-001");
    author_1.assert(version !== void 0, "Missing rules engine version", "RE-002");
    if ((registry[name] !== void 0) && (registry[name][version])) {
        return registry[name][version];
    }
    if (registry[name] === void 0) {
        registry[name] = {};
    }
    if (registry[name][version] === void 0) {
        author_1.assert(rules !== void 0, "Missing rules for engine " + name, "RE-003");
        registry[name][version] = new Rulesengine(rules, {}, name, version, schemaVersion);
    }
    return registry[name][version];
}
exports.load = load;
function getEngine(name, version) {
    author_1.assert(name !== void 0, "Missing rules engine name", "RE-001");
    author_1.assert(version !== void 0, "Missing rules engine version", "RE-002");
    author_1.assert(registry[name] !== void 0, "No engine loaded with name " + name, "RE-004");
    author_1.assert(registry[name][version] !== void 0, "Version " + version + " not loaded for " + name, "RE-005");
    return registry[name][version];
}
exports.getEngine = getEngine;
exports.engines = {
    load: load,
    loadDecisionObject: function (ds) {
        load(ds.name, ds.version, ds.getRules().rules, ds.schemaVersion());
    },
    getEngine: getEngine
};
function censor(censor) {
    var i = 0;
    return function (key, value) {
        if (i !== 0 && typeof (censor) === "object" && typeof (value) === "object" && censor === value) {
            return "[Circular]";
        }
        if (i >= 100) {
            return typeof value === "function" ? undefined : "" + typeof value;
        }
        ++i;
        return value;
    };
}
exports.jlog = function (obj) {
    console.error(JSON.stringify(obj, censor(obj), 2));
};
var RuleBehaviour;
(function (RuleBehaviour) {
    RuleBehaviour["Always"] = "Always";
    RuleBehaviour["Normal"] = "Normal";
    RuleBehaviour["Some"] = "Some";
    RuleBehaviour["Never"] = "Never";
})(RuleBehaviour = exports.RuleBehaviour || (exports.RuleBehaviour = {}));
function getBOMValue(root, path) {
    return getValueForPath(root, getPath(path));
}
exports.getBOMValue = getBOMValue;
function getValueForPath(root, paths) {
    var object = root;
    if (paths.length !== 0) {
        var indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        var normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        var remainderPaths_1 = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach(function (path) {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            if (indexOfArray < paths.length) {
                var arr = object;
                var vals_1 = [];
                arr.forEach(function (item) {
                    var arrValue = getValueForPath(item, remainderPaths_1);
                    if (arrValue !== undefined) {
                        vals_1.push(arrValue);
                    }
                });
                object = vals_1.length === 0 ? undefined : vals_1;
            }
        }
        return object;
    }
}
exports.getValueForPath = getValueForPath;
var Rule = (function () {
    function Rule(name, code, bom, behaviour) {
        var _this = this;
        if (behaviour === void 0) { behaviour = RuleBehaviour.Normal; }
        this.name = name;
        this.code = code;
        this.bom = bom;
        this.behaviour = behaviour;
        this.variables = [];
        this.valid = false;
        this.usedValues = {};
        this.path = {};
        this.code = "var result;" + code;
        this.variables = Rule.findUsedBomVariablesInCode(code);
        this.variables.forEach(function (variable) {
            _this.path[variable] = getPath(variable);
        });
    }
    Rule.prototype.execute = function (rule, engine) {
        if (rule.behaviour === RuleBehaviour.Never) {
            this.execute = function (rule, engine) { return undefined; };
        }
        else {
            var fs = "fn=function(o,r){try{let bom=r.bomRoot;" + this.code + ";if(result===undefined){return;}let e=r.bomRoot,n=r.bomRoot,s=o.name;o.name.split(\".\").forEach(function(o){e[o]===undefined?(e[o]={}):e[o],n=e,s=o,e=e[o]}),n[s]=result}catch(e){console.error(\"Error in \"+o.name+\"; Valid=\"+o.valid+\"; Error:\"+e.message+\" \"+e.stack+\"}\"),console.error(\"     \"+o.usedVariables+\": \"+JSON.stringify(o.usedValues)),console.error(\"     \"+JSON.stringify(r.bomRoot)),console.error(\"     Code: \"+o.code),r.bomRoot.error=e}return o};";
            var fn = void 0;
            fn = function (rule, engine) {
                return undefined;
            };
            eval(fs);
            this.execute = fn;
            return fn(this, engine);
        }
    };
    Rule.prototype.calculate = function () {
        var _this = this;
        this.valid = this.valid || (this.variables.length === 0);
        if (!this.valid || (this.behaviour === RuleBehaviour.Always)) {
            this.usedVariables = [];
            this.variables.forEach(function (variable) {
                _this.usedValues[variable] = getValueForPath(_this.bom, _this.path[variable]);
                if (_this.usedValues[variable] !== undefined) {
                    _this.usedVariables.push(variable);
                }
            });
            this.valid = (this.variables.length === this.usedVariables.length) || ((this.behaviour === RuleBehaviour.Some) && (this.variables.length > 0)) || (this.behaviour === RuleBehaviour.Always);
        }
        return this;
    };
    Rule.findUsedBomVariablesInCode = function (code) {
        var bomVariablesRx = /bom\.([A-Za-z_])+([A-Za-z_0-9\.\[\]])*/g;
        var bomVariables = code.match(bomVariablesRx);
        var arrayExpressionsRx = /\[([A-Za-z0-9\+_'' \(\)\t\n\[\]])+\]/g;
        if (bomVariables === null) {
            return [];
        }
        for (var i = 0; i < bomVariables.length; i++) {
            bomVariables[i] = bomVariables[i].replace(arrayExpressionsRx, ".?");
        }
        return bomVariables.filter(function (variable, index, array) {
            return array.lastIndexOf(variable) === index;
        });
    };
    return Rule;
}());
exports.Rule = Rule;
var Rulesengine = (function () {
    function Rulesengine(inputRules, bomRoot, name, version, schemaVersion, validateInputs) {
        var _this = this;
        if (validateInputs === void 0) { validateInputs = []; }
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
        this.placeBackInQueue = false;
        this.getEngine = getEngine;
        this.runInputValidation();
        inputRules.forEach(function (rule) {
            _this.rules.push(new Rule(rule.name, rule.code, bomRoot, rule.behaviour));
        });
        this.calculate();
    }
    Rulesengine.prototype.runInputValidation = function () {
        var _this = this;
        this.validateInputs.forEach(function (inputRule) {
            if (assertValueForPath(_this.bomRoot, getPath("bom." + inputRule), undefined)) {
                eval("throw new Error('Input \"" + inputRule + "\" is missing a value for \"" + _this.name + "\": " + JSON.stringify(_this.bomRoot) + "')");
            }
        });
    };
    Rulesengine.prototype.withBom = function (bom) {
        var _this = this;
        this.bomRoot = bom;
        this.usedRules = [];
        this.usedRuleNames = [];
        this.rules.forEach(function (rule) {
            rule.valid = false;
            rule.bom = bom;
            if ((rule.valid !== rule.calculate().valid) && (rule.valid)) {
                if (_this.usedRuleNames.indexOf(rule.name) === -1) {
                    _this.usedRules.push(rule);
                    _this.usedRuleNames.push(rule.name);
                }
            }
        });
        return this;
    };
    Rulesengine.prototype.instance = function (bom) {
        return new Rulesengine(this.inputRules, bom);
    };
    Rulesengine.prototype.calculate = function () {
        var _this = this;
        this.rules.forEach(function (rule) {
            if ((rule.valid !== rule.calculate().valid) && (rule.valid)) {
                if (_this.usedRuleNames.indexOf(rule.name) === -1) {
                    _this.usedRules.push(rule);
                    _this.usedRuleNames.push(rule.name);
                }
            }
        });
        return this;
    };
    Rulesengine.prototype.run = function (configuration) {
        var _this = this;
        this.iterations = 0;
        var start = new Date();
        var previousUsedRuleNames = "";
        var usedRuleNames = this.usedRuleNames.toString();
        while (previousUsedRuleNames !== usedRuleNames) {
            if (this.iterations >= this.maxIterations) {
                throw new Error("Max iterations of " + this.maxIterations + " reached.");
            }
            this.iterations++;
            this.usedRules.forEach(function (rule) {
                try {
                    rule.execute(rule, _this);
                }
                catch (e) {
                    console.error(rule.name + " " + e + " " + e.stack);
                    _this.bomRoot[rule.name] = undefined;
                    _this.bomRoot.error = rule.name + " threw an error: " + e.toString();
                }
            });
            this.calculate();
            previousUsedRuleNames = usedRuleNames;
            usedRuleNames = this.usedRuleNames.toString();
        }
        if (!!configuration && !!configuration.withStats) {
            var end = new Date();
            if (!this.bomRoot.engine)
                this.bomRoot.engine = {};
            var engine_1 = {
                runtime: { version: this.version,
                    schema: this.schemaVersion,
                    executionTime: end.valueOf() - start.valueOf(),
                    runIterations: this.iterations,
                    usedRuleNames: this.usedRuleNames,
                    unusedRules: this.rules.filter(function (rule) { return !rule.valid; }).map(function (rule) { return { name: rule.name, missing: rule.variables.filter(function (variable) { return rule.usedVariables.indexOf(variable) === -1; }) }; }) },
                tableResults: {},
                conditions: this.bomRoot._conditions
            };
            this.bomRoot.engine[this.name] = engine_1;
            var processed_1 = [];
            this.usedRuleNames.forEach(function (name, nameIndex) {
                if ((name.indexOf("DecisionTable_") > -1) && (processed_1.indexOf(name) === -1)) {
                    processed_1.push(name);
                    var value = getValueForPath(_this.bomRoot, getPath("bom." + name));
                    if (value)
                        engine_1.tableResults[name] = value;
                }
            });
        }
        this.usedRuleNames.forEach(function (name, nameIndex) {
            if ((name.indexOf("DecisionTable_") > -1)) {
                addToBom(_this.bomRoot, name, undefined);
            }
        });
        delete this.bomRoot._conditions;
        return this.bomRoot;
    };
    Rulesengine.prototype.mapRun = function (bomArray, path, configuration) {
        var _this = this;
        var result = [];
        var paths = (path && getPath(path));
        bomArray.forEach(function (bom) {
            var newBom = _this.withBom(bom).run(configuration);
            if (!paths) {
                result.push(newBom);
            }
            else {
                result.push(getValueForPath(newBom, paths));
            }
        });
        return result;
    };
    Rulesengine.prototype.filterRun = function (bomArray, expression, path, configuration) {
        var _this = this;
        var result = [];
        var paths = path && getPath(path);
        {
            var bom = {};
            eval(expression);
        }
        bomArray.forEach(function (bomInput) {
            var bom = _this.withBom(bomInput).run(configuration);
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
    };
    return Rulesengine;
}());
exports.Rulesengine = Rulesengine;
//# sourceMappingURL=rulesengine.js.map