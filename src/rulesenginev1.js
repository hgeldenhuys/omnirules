"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
function getPath(path) {
    var paths = path.split(".").reverse();
    paths.pop();
    paths.reverse();
    return paths;
}

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

function assertValueForPath(root, paths, testValue) {
    var _this = this;
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
                    var arrValue = _this.getValueForPath(item, remainderPaths_1);
                    if (arrValue !== undefined) {
                        vals_1.push(arrValue);
                    }
                });
                object = vals_1.length === 0 ? undefined : vals_1;
            }
        }
        return object + "" === testValue + "";
    }
    return false;
}

var engines = {};
function getRulesEngine(id, version, rules, schemaVersion) {
    if (engines[id] === void 0) {
        engines[id] = {};
    }
    if (engines[id][version] === void 0) {
        engines[id][version] = new Rulesengine(rules, {}, id, version, schemaVersion);
    }
    return engines[id][version];
}

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
function getAllPaths(root, obj, result) {
    if (result === void 0) { result = []; }
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr) && obj[attr] !== null && typeof (obj[attr]) === "object") {
            result = getAllPaths(root + "." + attr, obj[attr], result);
        }
        else {
            result.push({ path: root + "." + attr, value: obj[attr] });
        }
    }
    return result;
}
function getBOMValue(root, path) {
    return getValueForPath(root, getPath(path));
}

function getValueForPath(root, paths) {
    var _this = this;
    var object = root;
    if (paths.length !== 0) {
        var indexOfArray = paths.indexOf("?");
        indexOfArray = indexOfArray === -1 ? paths.length : indexOfArray;
        var normalPaths = indexOfArray === paths.length ? paths : paths.slice(0, indexOfArray);
        var remainderPaths_2 = indexOfArray === paths.length ? [] : paths.slice(paths.indexOf("?") + 1);
        normalPaths.forEach(function (path) {
            if (object !== undefined) {
                object = object[path];
            }
        });
        if (object !== undefined) {
            if (indexOfArray < paths.length) {
                var arr = object;
                var vals_2 = [];
                arr.forEach(function (item) {
                    var arrValue = _this.getValueForPath(item, remainderPaths_2);
                    if (arrValue !== undefined) {
                        vals_2.push(arrValue);
                    }
                });
                object = vals_2.length === 0 ? undefined : vals_2;
            }
        }
        return object;
    }
}

var Rule = (function () {
    function Rule(name, code, bom, behaviour) {
        var _this = this;
        if (behaviour === void 0) { behaviour = "Normal"; }
        this.name = name;
        this.code = code;
        this.bom = bom;
        this.behaviour = behaviour;
        this.variables = [];
        this.valid = false;
        this.usedValues = {};
        this.path = {};
        this.debug = false;
        this.code = "var result;" + code;
        this.variables = Rule.findUsedBomVariablesInCode(code);
        this.variables.forEach(function (variable) {
            _this.path[variable] = getPath(variable);
        });
    }
    Rule.prototype.execute = function (rule, engine) {
        if (rule.behaviour === "Never") {
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
        if (!this.valid || (this.behaviour === "Always")) {
            this.usedVariables = [];
            this.variables.forEach(function (variable) {
                _this.usedValues[variable] = getValueForPath(_this.bom, _this.path[variable]);
                if (_this.usedValues[variable] !== undefined) {
                    _this.usedVariables.push(variable);
                }
            });
            this.valid = (this.variables.length === this.usedVariables.length) || ((this.behaviour === "Some") && (this.variables.length > 0)) || (this.behaviour === "Always");
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
        this.addToBom = addToBom;
        this.placeBackInQueue = false;
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
    Rulesengine.prototype.reset = function (bom) {
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
        if (this.placeBackInQueue) {
            var waiting = SafeWorkerFactory.waiting(this);
            if (waiting) {
                waiting.resolve(this);
            }
            else {
                SafeWorkerFactory.placeBackInQueue(this);
                this.placeBackInQueue = false;
            }
        }
        return this.bomRoot;
    };
    Rulesengine.prototype.mapRun = function (bomArray, path, configuration) {
        var _this = this;
        var result = [];
        var paths = (path && getPath(path));
        bomArray.forEach(function (bom) {
            var newBom = _this.reset(bom).run(configuration);
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
            var bom = _this.reset(bomInput).run(configuration);
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

var SafeWorkerFactory = (function () {
    function SafeWorkerFactory() {
    }
    SafeWorkerFactory.waiting = function (ruleEngine) {
        return SafeWorkerFactory.workers[ruleEngine.name + "." + ruleEngine.version].waiting.pop();
    };
    SafeWorkerFactory.placeBackInQueue = function (ruleEngine) {
        try {
            SafeWorkerFactory.workers[ruleEngine.name + "." + ruleEngine.version].available.unshift(ruleEngine);
        }
        catch (e) {
            console.error(ruleEngine.name + "." + ruleEngine.version + " " + JSON.stringify(SafeWorkerFactory.workers[ruleEngine.name + "." + ruleEngine.version]) + " " + e);
        }
    };
    SafeWorkerFactory.registerWorkers = function (rules, numberOfWorkers, name, version) {
        var available = [];
        SafeWorkerFactory.workers[name + "." + version] = {
            available: available,
            waiting: []
        };
        for (var index = 0; index < numberOfWorkers; index++) {
            available.push(new Rulesengine(rules, {}, name, version));
        }
        return SafeWorkerFactory.workers[name + "." + version];
    };
    SafeWorkerFactory.getWorker = function (name, version) {
        return __awaiter(this, void 0, void 0, function () {
            var collection, something, promise, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        collection = SafeWorkerFactory.workers[name + "." + version];
                        something = collection.available.pop();
                        if (!!something) return [3, 2];
                        promise = new Promise(function (resolve, reject) {
                            collection.waiting.push({ resolve: resolve, reject: reject });
                        });
                        return [4, promise];
                    case 1:
                        value = _a.sent();
                        return [2, value];
                    case 2:
                        something.placeBackInQueue = true;
                        return [2, something];
                }
            });
        });
    };
    SafeWorkerFactory.workers = {};
    return SafeWorkerFactory;
}());

//# sourceMappingURL=rulesengine.js.map