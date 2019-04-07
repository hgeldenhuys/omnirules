"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var rulesengine_1 = require("./rulesengine");
var ts_md5_1 = require("ts-md5");
var bom_1 = require("./bom");
var terser = require("terser");
var avro = require("avsc");
function functionize(calculation, addFunction, rawValue) {
    if (addFunction === void 0) { addFunction = false; }
    if (rawValue === void 0) { rawValue = false; }
    if (!rawValue) {
        calculation = calculation || "";
        if (calculation.indexOf("result") === -1) {
            calculation = "var result=undefined; result = " + calculation;
        }
        if (addFunction) {
            calculation = "function() {" + calculation + "; return result}";
        }
    }
    return calculation;
}
exports.functionize = functionize;
function assert(expr, message, code) {
    if (!expr) {
        throw new Error("[" + code + "]: " + message);
    }
    return assert;
}
exports.assert = assert;
function replaceTokensWithPath(calculation, token, path) {
    var previousRegex = new RegExp("\\b\\." + token + "\\b", "g");
    var tokenRegEx = new RegExp("(?!'|\")\\b" + token + "\\b(?!'|\")", "g");
    var restorePreviousRegex = new RegExp("\\b\\._" + token + "\\b", "g");
    var restoreValuesBetweenSingleQuotesRegex = new RegExp("(')\\b([^']*)(bom.)" + token + "([^']*)\\b(')", "g");
    var restoreValuesBetweenDoubleQuotesRegex = new RegExp("(\")\\b([^\"]*)(bom.)" + token + "([^\"]*)\\b(\")", "g");
    calculation = calculation.replace(previousRegex, "._" + token);
    calculation = calculation.replace(tokenRegEx, "" + path);
    calculation = calculation.replace(restorePreviousRegex, "." + token);
    calculation = calculation.replace(restoreValuesBetweenSingleQuotesRegex, "'$2" + token + "$4'");
    calculation = calculation.replace(restoreValuesBetweenDoubleQuotesRegex, "\"$2" + token + "$4\"");
    return calculation;
}
exports.replaceTokensWithPath = replaceTokensWithPath;
function tokenizeString(input) {
    input = input
        .replace(/===/g, "IsEqualTo")
        .replace(/!==/g, "IsNotEqual")
        .replace(/==/g, "IsEqualTo")
        .replace(/!=/g, "IsNotEqualTo")
        .replace(/<>/g, "IsNotEqualTo")
        .replace(/>/g, "IsGreaterThan")
        .replace(/>=/g, "IsGreaterOrEqualTo")
        .replace(/</g, "IsLessThan")
        .replace(/<=/g, "IsLessOrEqualTo")
        .replace(/&&/g, "And")
        .replace(/\|\|/g, "Or")
        .replace(/!/g, "Not")
        .replace(/=/g, "Is")
        .replace(/\(/g, "With")
        .replace(/\)/g, "_params_")
        .replace(/\./g, "_via_")
        .replace(/,/g, "_and_")
        .replace(/,/g, "_and_")
        .replace(/[^\w]|_/g, "_");
    if ("0123456789".indexOf(input.charAt(0)) > -1) {
        input = "_" + input;
    }
    return input.replace(/__/g, "_");
}
exports.tokenizeString = tokenizeString;
var DecisionObjectType;
(function (DecisionObjectType) {
    DecisionObjectType["RuleSet"] = "RuleSet";
    DecisionObjectType["MultiAxisTable"] = "MultiAxisTable";
    DecisionObjectType["SingleAxisTable"] = "SingleAxisTable";
})(DecisionObjectType = exports.DecisionObjectType || (exports.DecisionObjectType = {}));
var ConditionTypeEnum;
(function (ConditionTypeEnum) {
    ConditionTypeEnum["Boolean"] = "Boolean";
    ConditionTypeEnum["LessThan"] = "LessThan";
    ConditionTypeEnum["LessThanOrEqualTo"] = "LessThanOrEqualTo";
    ConditionTypeEnum["GreaterThan"] = "GreaterThan";
    ConditionTypeEnum["GreaterThanOrEqualTo"] = "GreaterThanOrEqualTo";
    ConditionTypeEnum["Between"] = "Between";
    ConditionTypeEnum["Outside"] = "Outside";
})(ConditionTypeEnum = exports.ConditionTypeEnum || (exports.ConditionTypeEnum = {}));
var DataTypeEnum;
(function (DataTypeEnum) {
    DataTypeEnum["Unknown"] = "Unknown";
    DataTypeEnum["String"] = "String";
    DataTypeEnum["Integer"] = "Integer";
    DataTypeEnum["Boolean"] = "Boolean";
    DataTypeEnum["Date"] = "Date";
    DataTypeEnum["Decimal"] = "Decimal";
    DataTypeEnum["Enum"] = "Enum";
    DataTypeEnum["List"] = "List";
    DataTypeEnum["Object"] = "Object";
})(DataTypeEnum = exports.DataTypeEnum || (exports.DataTypeEnum = {}));
var Enumeration = (function () {
    function Enumeration(jsonObj) {
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
    }
    return Enumeration;
}());
exports.Enumeration = Enumeration;
var EnumerationSet = (function () {
    function EnumerationSet(jsonObj) {
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.values = this.values.map(function (value) {
            return new Enumeration(value);
        });
    }
    EnumerationSet.prototype.setupLookup = function () {
        var _this = this;
        this.valueLookup = {};
        this.values.forEach(function (value) {
            _this.valueLookup[value.value] = value;
        });
        this.setupLookup = function () {
        };
    };
    EnumerationSet.prototype.validateTheValue = function (value) {
        this.setupLookup();
        return this.valueLookup[value] !== undefined;
    };
    EnumerationSet.prototype.getLabel = function (value) {
        this.setupLookup();
        return this.valueLookup[value].label ? this.valueLookup[value].label : value;
    };
    EnumerationSet.prototype.getRange = function (value) {
        this.setupLookup();
        return this.valueLookup[value].range;
    };
    return EnumerationSet;
}());
exports.EnumerationSet = EnumerationSet;
var RuleContext = (function () {
    function RuleContext(jsonObj) {
        this.name = "Generic";
        this.enumerations = [];
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.enumerations = this.enumerations.map(function (enumeration) { return new EnumerationSet(enumeration); });
    }
    RuleContext.prototype.hasEnumerationSet = function (enumeration) {
        return this.enumerations.filter(function (enumerationSet) { return enumerationSet.name === enumeration; }).length > 0;
    };
    RuleContext.prototype.getEnumerationSet = function (enumeration) {
        return this.enumerations.filter(function (enumerationSet) { return enumerationSet.name === enumeration; })[0];
    };
    return RuleContext;
}());
exports.RuleContext = RuleContext;
var SAMPLEDATA = {};
SAMPLEDATA[DataTypeEnum.List] = [];
SAMPLEDATA[DataTypeEnum.Object] = {};
SAMPLEDATA[DataTypeEnum.String] = "A string";
SAMPLEDATA[DataTypeEnum.Boolean] = true;
SAMPLEDATA[DataTypeEnum.Date] = new Date();
SAMPLEDATA[DataTypeEnum.Decimal] = 3.142;
SAMPLEDATA[DataTypeEnum.Integer] = 7;
SAMPLEDATA[DataTypeEnum.Enum] = "Enumeration";
SAMPLEDATA[DataTypeEnum.Unknown] = undefined;
var DataPointBase = (function () {
    function DataPointBase(jsonObj) {
        this.dataType = DataTypeEnum.Unknown;
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.label = this.label || this.token;
        this.relativePath = this.relativePath || this.token;
        this.dataType = this.dataType !== undefined ? this.dataType : DataTypeEnum.Decimal;
        this.definition = this.definition || "This is a " + this.token + " of type " + DataTypeEnum[this.dataType] + " with default value of " + this.mockValue;
    }
    DataPointBase.prototype.getFullPath = function (excludeRoot) {
        if (excludeRoot === void 0) { excludeRoot = false; }
        var path = this.relativePath;
        var root = this.getParent();
        while (root) {
            path = root.parentName + "." + path;
            root = root.getParent();
        }
        if (excludeRoot) {
            path = path.replace("bom.", "");
        }
        return path;
    };
    DataPointBase.prototype.getParent = function () {
        return undefined;
    };
    return DataPointBase;
}());
var Output = (function (_super) {
    __extends(Output, _super);
    function Output(parent, jsonObj) {
        var _this = _super.call(this, jsonObj) || this;
        _this.rawValue = false;
        _this.conditions = [];
        _this.ruleBehaviour = rulesengine_1.RuleBehaviour.Normal;
        assert(parent !== undefined, "Parent cannot be null for Output", "OUTPUT03");
        _this.getParent = function () {
            return parent;
        };
        _this.token = tokenizeString(_this.token);
        _this.conditions = [];
        if (!!jsonObj.conditions) {
            jsonObj.conditions.forEach(function (condition) {
                var params = condition;
                _this.addCondition(params);
            });
        }
        if (_this.calculation) {
            assert(replaceTokensWithPath(_this.calculation, _this.token, "bom." + _this.token) === _this.calculation, "Calculation cannot refer to itself for token \"" + _this.token + "\" with \"bom." + _this.token + "\":\nCalculation:\n=====================\n" + _this.calculation + "\n=====================\nReplaced:\n=====================\n" + replaceTokensWithPath(_this.calculation, _this.token, "bom." + _this.token) + "\"\n=====================", "RULE02");
        }
        return _this;
    }
    Output.prototype.addCondition = function (condition) {
        var outputCondition = new Condition(this.getParent(), condition);
        outputCondition.token = "" + tokenizeString(outputCondition.token);
        outputCondition.relativePath = "_conditions." + this.relativePath + "_" + (this.conditions.length + 1) + "_" + outputCondition.token;
        this.conditions.push(outputCondition);
        this.getParent().addOutput(outputCondition);
        return outputCondition;
    };
    Output.prototype.getRule = function () {
        var calculation = this.calculation;
        if (calculation.indexOf("result") === -1) {
            calculation = "result = " + calculation;
        }
        if (this.conditions.length > 0) {
            var conditions_1 = [];
            this.conditions.forEach(function (condition) {
                conditions_1.push(condition.token);
            });
            calculation = "if (" + conditions_1.join(" && ") + ") {" + calculation + "}";
        }
        return terser.minify(calculation, {
            mangle: false,
            parse: {
                bare_returns: true
            },
            compress: {
                conditionals: false,
                dead_code: false,
                directives: false,
                evaluate: false,
                expression: true,
                hoist_funs: true,
                if_return: false,
                inline: 0
            }
        }).code;
    };
    Output.findOutput = function (outputs, token) {
        for (var _i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
            var output = outputs_1[_i];
            if (output.token === token) {
                return output;
            }
        }
        return undefined;
    };
    Output.prototype.setDecisionObject = function (decisionObject, inputMappings) {
        var _this = this;
        if (!!decisionObject && !!this.getParent()) {
            assert(this.inputMappings !== undefined, "Missing inputMappings for Decision Object " + decisionObject.name + " on output " + this.label, "OUTPUT01");
            if (decisionObject.decisionObjectType === DecisionObjectType.MultiAxisTable) {
                decisionObject.parentName = this.relativePath.split(".")[this.relativePath.split(".").length - 1];
                decisionObject = new MultiAxisTable(this.getParent(), decisionObject);
            }
            else {
                decisionObject = new DecisionObject(this.getParent(), decisionObject);
            }
            this.decisionObject = decisionObject;
            this.inputMappings = inputMappings;
            decisionObject.parentName = this.relativePath;
            decisionObject.inputs.forEach(function (input) {
                var tokens = _this.inputMappings.filter(function (inputMapping) {
                    return (inputMapping.To === input.token);
                });
                assert(tokens.length > 0, "No mapping found for input variable \"" + input.getFullPath() + "\" on rule set \"" + _this.getParent().name + "." + _this.label + "\"", "OUTPUT02");
            });
            this.inputMappings.forEach(function (mapping) {
                var input = decisionObject.getInput(mapping.To);
                var dataPoint = _this.getParent().getDataPoint(mapping.From);
                var calculation = dataPoint ? dataPoint.getFullPath() : mapping.From;
                var output = new Output(decisionObject, {
                    token: input.token,
                    calculation: calculation,
                    dataType: input.dataType,
                    definition: input.definition,
                    mockValue: input.mockValue,
                    label: input.label,
                    relativePath: input.relativePath,
                    ruleBehaviour: rulesengine_1.RuleBehaviour.Normal
                });
                decisionObject.addOutput(output);
            });
            decisionObject.inputs = [];
        }
    };
    Output.prototype.getDecisionObject = function () {
        return this.decisionObject;
    };
    Output.prototype.hasDecisionObject = function () {
        return !!this.decisionObject;
    };
    return Output;
}(DataPointBase));
exports.Output = Output;
var Input = (function (_super) {
    __extends(Input, _super);
    function Input(parent, jsonObj) {
        var _this = _super.call(this, jsonObj) || this;
        _this.getParent = function () {
            return parent;
        };
        return _this;
    }
    return Input;
}(DataPointBase));
exports.Input = Input;
var Condition = (function (_super) {
    __extends(Condition, _super);
    function Condition(parent, jsobObj) {
        return _super.call(this, parent, jsobObj) || this;
    }
    Condition.prototype.getRule = function () {
        if (this.conditionType === ConditionTypeEnum.Boolean) {
            this.calculation = this.expression;
        }
        else if (this.conditionType === ConditionTypeEnum.LessThan) {
            this.calculation = this.expression + " < " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.LessThanOrEqualTo) {
            this.calculation = this.expression + " <= " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.GreaterThan) {
            this.calculation = this.expression + " > " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.GreaterThanOrEqualTo) {
            this.calculation = this.expression + " >= " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.Between) {
            var left = "<" + (this.includeFrom ? "=" : "");
            var right = "<" + (this.includeTo ? "=" : "");
            this.calculation = this.from + " " + left + " " + this.expression + " " + right + " " + this.to;
        }
        else if (this.conditionType === ConditionTypeEnum.Outside) {
            var left = "<" + (this.includeFrom ? "=" : "");
            var right = ">" + (this.includeTo ? "=" : "");
            this.calculation = "(" + this.expression + " " + left + " " + this.from + ") && (" + this.expression + " " + right + " " + this.to + ")";
        }
        return _super.prototype.getRule.call(this);
    };
    return Condition;
}(Output));
function evaluateMockValue(input) {
    if (input.mockValue) {
        assert(input.mockValue.indexOf("=") === -1, "Mock value should be simple types", "MOCK01");
        var mockValue = input.mockValue ? input.mockValue : false;
        if ((input.dataType === DataTypeEnum.Object) && mockValue) {
            var anObject = eval("anObject = " + mockValue);
            mockValue = anObject;
        }
        else if (mockValue) {
            try {
                mockValue = eval(mockValue);
            }
            catch (e) {
                console.error(e, mockValue);
            }
        }
        return mockValue;
    }
    else {
        return undefined;
    }
}
var InputsOutputsManager = (function () {
    function InputsOutputsManager(parent, jsonObj) {
        this.inputs = [];
        this.outputs = [];
        this.version = "UnVersioned";
        this.parentName = "bom";
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.getParent = function () {
            return parent;
        };
    }
    InputsOutputsManager.prototype.getParent = function () {
        return undefined;
    };
    InputsOutputsManager.prototype.validateDataPoints = function () {
        var tokens = this.getDataPoints()
            .map(function (dataPoint) {
            return { count: 1, name: dataPoint.token };
        })
            .reduce(function (accumulator, currentValue) {
            accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
            return accumulator;
        }, {});
        var duplicateTokens = Object.keys(tokens).filter(function (a) { return tokens[a] > 1; });
        if (duplicateTokens.length !== 0) {
            rulesengine_1.jlog(this.outputs);
            rulesengine_1.jlog(this.inputs);
        }
        assert(duplicateTokens.length === 0, "Following token(s) are duplicated: '" + duplicateTokens.join("', '") + "' in BOM of '" + this.name + "'", "DO01");
        var names = this.getDataPoints()
            .map(function (dataPoint) {
            return { count: 1, name: dataPoint.label };
        })
            .reduce(function (accumulator, currentValue) {
            accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
            return accumulator;
        }, {});
        var duplicateNames = Object.keys(names).filter(function (a) { return names[a] > 1; });
        assert(duplicateTokens.length === 0, "Following name(s) are duplicated: '" + duplicateNames.join("', '") + "' in BOM of '" + this.name + "'", "DO02");
        var paths = this.getDataPoints()
            .map(function (dataPoint) {
            return { count: 1, name: dataPoint.relativePath };
        })
            .reduce(function (accumulator, currentValue) {
            accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
            return accumulator;
        }, {});
        var duplicatePaths = Object.keys(paths).filter(function (a) { return paths[a] > 1; });
        assert(duplicateTokens.length === 0, "Following relative path(s) are duplicated: '" + duplicatePaths.join("', '") + "' in BOM of '" + this.name + "'", "DO03");
    };
    InputsOutputsManager.prototype.getDataPoints = function () {
        var _this = this;
        var dataPoints = [];
        this.inputs.forEach(function (input, index) {
            dataPoints.push(_this.inputs[index]);
        });
        this.outputs.forEach(function (output, index) {
            dataPoints.push(_this.outputs[index]);
        });
        return dataPoints;
    };
    InputsOutputsManager.prototype.generateSampleBOM = function (includeOutputs, addAnnotation) {
        if (includeOutputs === void 0) { includeOutputs = false; }
        if (addAnnotation === void 0) { addAnnotation = false; }
        var bom = {
            getValue: function (path) {
                return rulesengine_1.getBOMValue(this, "bom." + path);
            },
            setValue: function (path, value) {
                return bom_1.addToBom(this, path, value);
            },
            log: function () {
                console.error(JSON.stringify(this, undefined, 2));
            },
            SchemaVersion: ""
        };
        this.inputs.forEach(function (input, index) {
            var sampleData = evaluateMockValue(input);
            var data = addAnnotation ? { sampleData: input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")], documentation: input.definition, dataType: DataTypeEnum[input.dataType.replace("Type", "")] } : input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")];
            bom_1.addToBom(bom, "" + input.relativePath, data);
        });
        if (includeOutputs) {
            this.outputs.forEach(function (output, index) {
                if (output.hasDecisionObject()) {
                    var dObject = output.getDecisionObject();
                    if (dObject.decisionObjectType === DecisionObjectType.MultiAxisTable) {
                        var root_1 = output.relativePath.split(".")[0];
                        var subBom = dObject.generateSampleBOM(includeOutputs, addAnnotation)[root_1];
                        getAllPaths(output.token, subBom).forEach(function (path) {
                            var fullPath = root_1 + "." + path.path.split(".").splice(1).join(".");
                            bom_1.addToBom(bom, fullPath, path.value);
                        });
                    }
                    else {
                        bom_1.addToBom(bom, "" + output.relativePath, dObject.generateSampleBOM(includeOutputs, addAnnotation));
                    }
                }
                else if (output.token.indexOf("DecisionTable_") === -1) {
                    var sampleData = evaluateMockValue(output);
                    var data = addAnnotation ? { sampleData: sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")], documentation: output.definition, dataType: DataTypeEnum[output.dataType.replace("Type", "")] } : sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")];
                    bom_1.addToBom(bom, output.relativePath, data);
                }
            });
        }
        bom_1.addToBom(bom, "SchemaVersion", this.schemaVersion());
        return bom;
    };
    InputsOutputsManager.prototype.schemaVersion = function () {
        var hash = "";
        this.getDataPoints().forEach(function (datapoint) {
            hash += datapoint.relativePath + ":" + datapoint.dataType;
        });
        return ts_md5_1.Md5.hashStr(hash).toString();
    };
    InputsOutputsManager.prototype.getInput = function (token) {
        return this.inputs.filter(function (input) {
            return (input.token === token);
        })[0];
    };
    InputsOutputsManager.prototype.getOutput = function (token) {
        return this.outputs.filter(function (output) {
            return (output.token === token);
        })[0];
    };
    InputsOutputsManager.prototype.getDataPoint = function (token) {
        return this.getDataPoints().filter(function (dataPoint) {
            return (dataPoint.token === token);
        })[0];
    };
    InputsOutputsManager.prototype.addInput = function (input) {
        this.inputs.forEach(function (iInput) {
            assert(iInput.token !== input.token, "There's already an input with token " + input.token + "\"", "INPUT01");
        });
        if (input instanceof Input) {
            this.inputs.push(input);
            return input;
        }
        else {
            var newInput = new Input(this, input);
            this.inputs.push(newInput);
            return newInput;
        }
    };
    InputsOutputsManager.prototype.addOutput = function (output) {
        this.outputs.forEach(function (iOutput) {
            assert(iOutput.token !== output.token, "There's already an output with token " + output.token + "\"", "OUTPUT04");
        });
        if (output instanceof Output) {
            this.outputs.push(output);
            return output;
        }
        else {
            var newOutput = new Output(this, output);
            this.outputs.push(newOutput);
            return newOutput;
        }
    };
    return InputsOutputsManager;
}());
var InputBuilder = (function () {
    function InputBuilder(input, decisionObjectBuilder) {
        this.input = input;
        this.decisionObjectBuilder = decisionObjectBuilder;
    }
    InputBuilder.prototype.comma = function () {
        return this.decisionObjectBuilder;
    };
    InputBuilder.prototype.thenNext = function () {
        return this.decisionObjectBuilder;
    };
    InputBuilder.prototype.asEnum = function (ofType, withValue) {
        if (withValue === void 0) { withValue = ""; }
        this.input.dataType = DataTypeEnum.Enum;
        assert(this.decisionObjectBuilder.decisionObject.ruleContext.hasEnumerationSet(ofType), "There is no enumeration of type " + ofType, "BUILD01");
        if (withValue) {
            assert(this.decisionObjectBuilder.decisionObject.ruleContext.getEnumerationSet(ofType).validateTheValue(withValue), "Invalid value of \"" + withValue + "\" for " + ofType, "ENUM01");
        }
        this.input.enumerationSet = ofType;
        this.input.mockValue = "\"" + withValue + "\"";
        return this;
    };
    InputBuilder.prototype.asString = function (withValue) {
        if (withValue === void 0) { withValue = ""; }
        this.input.dataType = DataTypeEnum.String;
        this.input.mockValue = "\"" + withValue + "\"";
        return this;
    };
    InputBuilder.prototype.asInteger = function (withValue) {
        if (withValue === void 0) { withValue = 0; }
        this.input.dataType = DataTypeEnum.Integer;
        this.input.mockValue = "" + withValue;
        return this;
    };
    InputBuilder.prototype.asDecimal = function (withValue) {
        if (withValue === void 0) { withValue = 0; }
        this.input.dataType = DataTypeEnum.Decimal;
        this.input.mockValue = "" + withValue;
        return this;
    };
    InputBuilder.prototype.asDate = function (withValue) {
        if (withValue === void 0) { withValue = new Date(); }
        this.input.dataType = DataTypeEnum.Date;
        this.input.mockValue = "\"" + withValue.getDate() + "\"";
        return this;
    };
    InputBuilder.prototype.asBoolean = function (withValue) {
        if (withValue === void 0) { withValue = false; }
        this.input.dataType = DataTypeEnum.Boolean;
        this.input.mockValue = "" + !!withValue;
        return this;
    };
    InputBuilder.prototype.asObject = function (withValue) {
        if (withValue === void 0) { withValue = {}; }
        this.input.dataType = DataTypeEnum.Object;
        this.input.mockValue = "" + JSON.stringify(withValue);
        return this;
    };
    InputBuilder.prototype.asList = function (withValue) {
        if (withValue === void 0) { withValue = []; }
        this.input.dataType = DataTypeEnum.List;
        this.input.mockValue = "" + JSON.stringify(withValue);
        return this;
    };
    InputBuilder.prototype.remove = function () {
        var _this = this;
        this.decisionObjectBuilder.decisionObject.inputs = this.decisionObjectBuilder.decisionObject.inputs.filter(function (input) {
            return input.token !== _this.input.token;
        });
        return this.decisionObjectBuilder;
    };
    return InputBuilder;
}());
var OutputBuilder = (function (_super) {
    __extends(OutputBuilder, _super);
    function OutputBuilder(output, decisionObjectBuilder) {
        var _this = _super.call(this, output, decisionObjectBuilder) || this;
        _this.output = output;
        _this.decisionObjectBuilder = decisionObjectBuilder;
        return _this;
    }
    OutputBuilder.prototype.using = function (calculator) {
        if (typeof calculator === "string") {
            this.usingCalculation(calculator);
        }
        else {
            this.usingDecisionObject(calculator);
        }
        return this;
    };
    OutputBuilder.prototype.usingCalculation = function (calculation) {
        this.output.calculation = calculation;
        return this;
    };
    OutputBuilder.prototype.withCalculation = function (calculation) {
        return this.usingCalculation(calculation);
    };
    OutputBuilder.prototype.usingDecisionObject = function (decisionObject) {
        this.output.decisionObject = decisionObject;
        this.output.inputMappings = [];
        return this;
    };
    OutputBuilder.prototype.withDecisionObject = function (decisionObject) {
        return this.usingDecisionObject(decisionObject);
    };
    OutputBuilder.prototype.mappingInput = function (from, to) {
        assert(this.output.inputMappings !== undefined, "Please set the decision object before you map inputs", "BUILDER01");
        this.output.inputMappings.push({ From: from, To: to });
        return this;
    };
    OutputBuilder.prototype.ifTrueThat = function (expression, withLabel) {
        var condition = new Condition(this.decisionObjectBuilder.decisionObject, {
            expression: expression,
            conditionType: ConditionTypeEnum.Boolean,
            label: withLabel,
            token: !!withLabel ? tokenizeString(withLabel) : tokenizeString(expression) + "IsTrue"
        });
        this.output.addCondition(condition);
        return this;
    };
    OutputBuilder.prototype.and = function () {
        return this;
    };
    return OutputBuilder;
}(InputBuilder));
var DecisionObjectBuilder = (function () {
    function DecisionObjectBuilder(decisionObject) {
        this.decisionObject = decisionObject;
    }
    DecisionObjectBuilder.prototype.withInput = function (input) {
        if (typeof input === "string") {
            var path = input.split(".");
            var token = path[path.length - 1];
            input = this.decisionObject.getInput(token) || this.decisionObject.addInput({ token: token, relativePath: input });
        }
        else {
            input = this.decisionObject.getInput(input.token) || this.decisionObject.addInput(input);
        }
        return new InputBuilder(input, this);
    };
    DecisionObjectBuilder.prototype.withOutput = function (output) {
        if (typeof output === "string") {
            var path = output.split(".");
            var token = path[path.length - 1];
            output = this.decisionObject.getOutput(token) || this.decisionObject.addOutput({ token: token, relativePath: output });
        }
        else {
            output = this.decisionObject.getOutput(output.token) || this.decisionObject.addOutput(output);
        }
        return new OutputBuilder(output, this);
    };
    DecisionObjectBuilder.prototype.also = function () {
        return this;
    };
    DecisionObjectBuilder.prototype.done = function () {
        return this.decisionObject;
    };
    return DecisionObjectBuilder;
}());
var DecisionObject = (function (_super) {
    __extends(DecisionObject, _super);
    function DecisionObject(parent, jsonObj) {
        var _this = _super.call(this, parent, jsonObj) || this;
        _this.parentName = "bom";
        _this.builder = new DecisionObjectBuilder(_this);
        _this.decisionObjectType = DecisionObjectType.RuleSet;
        if (!_this.ruleContext) {
            _this.ruleContext = new RuleContext({});
        }
        else {
            _this.ruleContext = new RuleContext(_this.ruleContext);
        }
        _this.inputs.forEach(function (input, index) {
            _this.inputs[index] = new Input(_this, input);
        });
        _this.outputs = [];
        jsonObj.outputs.forEach(function (output, index) {
            var newOutput = new Output(_this, output);
            _this.addOutput(newOutput);
        });
        if (jsonObj.decisionObjectType === DecisionObjectType.RuleSet) {
            _this.validateDataPoints();
        }
        _this.setupAdditionalRules();
        if (!parent) {
            DecisionObject.setupSubDecisionObjects(_this);
        }
        return _this;
    }
    DecisionObject.prototype.getInputNames = function () {
        return this.inputs.map(function (input) {
            return input.relativePath;
        });
    };
    DecisionObject.setupSubDecisionObjects = function (decisionObject) {
        var _this = this;
        decisionObject.outputs.forEach(function (output) {
            if (output.hasDecisionObject()) {
                output.setDecisionObject(output.decisionObject, output.inputMappings);
            }
        });
        decisionObject.outputs.forEach(function (output) {
            if (output.hasDecisionObject()) {
                _this.setupSubDecisionObjects(output.decisionObject);
            }
        });
    };
    DecisionObject.prototype.setupAdditionalRules = function () {
    };
    DecisionObject.prototype.generateReadableRules = function () {
        var rules = [];
        this.outputs.forEach(function (output) {
            var conditions = output.conditions.map(function (condition) { return condition.token; }).join(" and ");
            rules.push("" + output.label + (output.label !== output.token ? "known as " + output.token + " " : "") + " is defined as " + output.calculation + (output.relativePath !== output.token ? "It will be saved under " + output.relativePath : "") +
                (conditions ? " when " + conditions + " is true." : "."));
        });
        return rules;
    };
    DecisionObject.prototype.getRules = function () {
        var _this = this;
        var rules = {
            rules: [],
            Version: this.version || "unversioned",
            Id: this.name,
            SchemaVersion: this.schemaVersion().toString(),
            error: {},
            schemaDocumentation: this.generateSampleBOM(true, true),
            sampleSchema: this.generateSampleBOM(false, false)
        };
        this.outputs.forEach(function (output) {
            if (output.hasDecisionObject()) {
                var subRules_1 = output.getDecisionObject().getRules();
                var mappings_1 = [];
                subRules_1.rules.forEach(function (rule) {
                    if (!rule.absolute) {
                        mappings_1.push({
                            oldName: rule.name,
                            newName: output.getFullPath() + "." + rule.name
                        });
                        rule.name = output.getFullPath(true) + "." + rule.name;
                        rule.absolute = true;
                    }
                    rules.rules.push(rule);
                });
                mappings_1.forEach(function (mapping) {
                    subRules_1.rules.forEach(function (rule) {
                        rule.code = replaceTokensWithPath(rule.code, mapping.oldName, mapping.newName);
                    });
                });
                var rule = {
                    name: output.relativePath,
                    code: "//Sub Rules",
                    behaviour: rulesengine_1.RuleBehaviour.Never
                };
                assert(rule.name, "Rule doesn't have a name using '" + output.relativePath + "'", "RULE03");
                rules.rules.push(rule);
            }
            else {
                var rule = {
                    name: output.relativePath,
                    code: output.getRule(),
                    behaviour: output.ruleBehaviour
                };
                assert(rule.name, "Rule doesn't have a name using '" + output.relativePath + "'", "RULE03");
                rules.rules.push(rule);
            }
        });
        if (!this.getParent()) {
            rules.rules.forEach(function (rule) {
                _this.getDataPoints().forEach(function (dataPoint) {
                    rule.code = replaceTokensWithPath(rule.code, dataPoint.token, "" + dataPoint.getFullPath());
                });
            });
            var usedVariables_1 = {};
            rules.rules.forEach(function (rule) {
                usedVariables_1["bom." + rule.name] = rulesengine_1.Rule.findUsedBomVariablesInCode(rule.code);
            });
            Object.keys(usedVariables_1).forEach(function (name) {
                usedVariables_1[name].forEach(function (rule) {
                    if (usedVariables_1[rule]) {
                        assert(usedVariables_1[rule].indexOf(name) === -1, "Circular reference detected in rule " + name + " and " + rule, "RULE01");
                    }
                });
            });
        }
        return rules;
    };
    return DecisionObject;
}(InputsOutputsManager));
exports.DecisionObject = DecisionObject;
var Axis = (function () {
    function Axis(jsonObj) {
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.name = this.name || "unnamed";
    }
    return Axis;
}());
exports.Axis = Axis;
var Cell = (function () {
    function Cell() {
    }
    return Cell;
}());
exports.Cell = Cell;
var RuleSet = (function (_super) {
    __extends(RuleSet, _super);
    function RuleSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return RuleSet;
}(DecisionObject));
exports.RuleSet = RuleSet;
var MultiAxisTable = (function (_super) {
    __extends(MultiAxisTable, _super);
    function MultiAxisTable(parent, jsonObj) {
        return _super.call(this, parent, jsonObj) || this;
    }
    MultiAxisTable.prototype.setupAdditionalRules = function () {
        if (this.purpose) {
            this.purpose = tokenizeString(this.purpose);
        }
        this.decisionObjectType = DecisionObjectType.MultiAxisTable;
        var cellCalculation = this.generateCellCalculation();
        var globalCalculation = "\n        \n        result = (function() {\n        " + cellCalculation + "\n        return result;\n        })()";
        var purpose = this.purpose || "";
        var outputBase = new Output(this, {
            calculation: "" + globalCalculation,
            token: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            relativePath: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            definition: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal
        });
        this.outputs.forEach(function (output) {
            if (output.token.indexOf("DecisionTable_") === -1) {
                output.calculation = "result = " + outputBase.token + "." + output.token;
            }
        });
        var decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    };
    MultiAxisTable.prototype.generateCellCalculation = function () {
        var _this = this;
        var code = "var result = {};\n        var evaluate = function(value) {\n            var r1_ = value && (value.call || value) && (value.call && value.call());\n            return r1_ === undefined ? value : r1_;\n        }\n        ";
        this.columns.forEach(function (column, index) {
            var condition = column.conditions.map(function (condition) { return functionize(condition.expression, true) + "()"; }).join(" && ");
            code += "\n            var column" + index + "Condition = true;";
            if (condition.length > 0) {
                code += "\n            column" + index + "Condition = column" + index + "Condition && (" + condition + ");\n                ";
            }
        });
        this.rows.forEach(function (row, index) {
            var condition = row.conditions.map(function (condition) { return functionize(condition.expression, true) + "()"; }).join(" && ");
            code += "\n            var row" + index + "Condition = true;\n            ";
            if (condition.length > 0) {
                code += "\n            row" + index + "Condition = row" + index + "Condition && (" + condition + ");\n                ";
            }
        });
        this.cells.forEach(function (cell, index) {
            assert(_this.rows[cell.rowNumber - 1], "There isn't a row with index " + cell.rowNumber, "CELL01");
            assert(_this.columns[cell.columnNumber - 1], "There isn't a column with index " + cell.columnNumber, "CELL02");
            code += "\n            if (row" + (cell.rowNumber - 1) + "Condition && column" + (cell.columnNumber - 1) + "Condition) {\n            result.Match = {Column: {Index: " + (cell.columnNumber - 1) + ", Name: \"" + _this.columns[cell.columnNumber - 1].name + "\"}, Row: {Index: " + (cell.rowNumber - 1) + ", Name: \"" + _this.rows[cell.rowNumber - 1].name + "\"}};\n            ";
            _this.outputs.forEach(function (output, outputIndex) {
                var cellOutput = cell.outputs.filter(function (cellOutput) { return cellOutput.token === output.token; })[0];
                var cellValue = cellOutput ? functionize(cellOutput.calculation, true, cellOutput.rawValue) : "void 0";
                code += "\n                var cell" + output.token + " = " + cellValue + ";\n                cell" + output.token + " = evaluate(" + cellValue + ");\n                ";
            });
            _this.rows[cell.rowNumber - 1].outputs.forEach(function (output, outputIndex) {
                var columnFn = functionize(output.calculation, true, output.rawValue);
                code += "\n                if (cell" + output.token + " === void 0) {\n                    var column = " + columnFn + ";\n                    cell" + output.token + " = evaluate(column);                    \n                }\n                ";
            });
            _this.columns[cell.columnNumber - 1].outputs.forEach(function (output, outputIndex) {
                var columnFn = functionize(output.calculation, true, output.rawValue);
                code += "\n                if (cell" + output.token + " === void 0) {\n                    var column = " + columnFn + ";\n                    cell" + output.token + " = evaluate(column);                    \n                }\n                ";
            });
            _this.outputs.forEach(function (output) {
                var tableFn = functionize(output.calculation, true, output.rawValue);
                code += "\n                if (cell" + output.token + " === void 0) {\n                    //raw=" + output.rawValue + "\n                    var table = " + tableFn + ";\n                    cell" + output.token + " = evaluate(table);\n                }\n                result[\"" + output.token + "\"] = cell" + output.token + ";\n                ";
            });
            code += "} else \n            ";
        });
        code += " {\n            ";
        this.outputs.forEach(function (output) {
            var tableFn = functionize(output.calculation, true, output.rawValue);
            code += "\n                result.Match = {NoMatch: true};\n                var table" + output.token + " = " + tableFn + ";\n                result[\"" + output.token + "\"] = evaluate(table" + output.token + ");\n                ";
        });
        code += "}\n        result.TableName = \"" + ((this.name && this.name.replace(/"/g, '\"')) || "Unknown") + "\";\n        result.Purpose = \"" + ((this.purpose && this.purpose.replace(/"/g, '\"')) || "Unknown") + "\";\n        ";
        return code;
    };
    return MultiAxisTable;
}(DecisionObject));
exports.MultiAxisTable = MultiAxisTable;
var SingleAxisTable = (function (_super) {
    __extends(SingleAxisTable, _super);
    function SingleAxisTable(parent, jsonObj) {
        return _super.call(this, parent, jsonObj) || this;
    }
    SingleAxisTable.prototype.addEntry = function () {
        var _this = this;
        var conditions = this.inputs.map(function (input) {
            return new Condition(undefined, {
                token: input.token,
                label: input.token,
                conditionType: ConditionTypeEnum.Boolean,
                expression: input.dataType === DataTypeEnum.Enum ? _this.ruleContext.getEnumerationSet(input.enumerationSet).values[0].value : undefined
            });
        });
        var outputs = this.outputs.map(function (output) {
            var newOutuput = new Output(undefined, output);
            if (output.dataType === DataTypeEnum.Enum) {
                output.calculation = "\"" + _this.ruleContext.getEnumerationSet(output.enumerationSet).values[0].value + "\"";
            }
            return newOutuput;
        });
        var newEntry = new Axis({
            conditions: conditions,
            name: (this.entries.length + 1) + "",
            outputs: outputs,
            index: this.entries.length
        });
        this.entries.push(newEntry);
    };
    SingleAxisTable.prototype.setupAdditionalRules = function () {
        var _this = this;
        this.purpose = tokenizeString(this.purpose);
        this.decisionObjectType = DecisionObjectType.SingleAxisTable;
        this.entries = this.entries.map(function (entry) {
            return new Axis(entry);
        });
        this.entries.forEach(function (entry, entryIndex) {
            assert(((entry.conditions.length === _this.inputs.length)), "Not enough conditions for entry #" + entryIndex + ", need " + _this.inputs.length, "ENTRY01");
            _this.inputs.forEach(function (input) {
                assert(((entry.conditions.filter(function (condition) { return condition.token === input.token; }).length > 0)), "Missing the condition for " + input.token + " on entry #" + entryIndex, "ENTRY01");
            });
            _this.outputs.forEach(function (output) {
                assert((entry.outputs.length === _this.outputs.length) && (entry.outputs.filter(function (entryOutput) { return output.token === entryOutput.token; }).length > 0), "Missing an output \"" + output.token + "\" for entry #" + entryIndex, "ENTRY02");
            });
        });
        this.outputs.forEach(function (output) {
            output.calculation = "";
        });
        var tableCalculation = this.generateTableCode();
        var globalCalculation = "\n        result = (function() {\n        " + tableCalculation + "\n        return result;\n        })()";
        var purpose = this.purpose || "";
        var outputBase = new Output(this, {
            calculation: "" + globalCalculation,
            token: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            relativePath: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            definition: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal
        });
        this.outputs.forEach(function (output) {
            if (output.token.indexOf("DecisionTable_") === -1) {
                output.calculation = "result = " + outputBase.token + "." + output.token;
            }
        });
        var decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    };
    SingleAxisTable.prototype.generateTableCode = function () {
        return "var result = {\"TableName\": \"" + this.name + "\"};\n        " + this.entries.map(function (entry, index) {
            return "if (" + entry.conditions.map(function (condition) {
                return condition.token + " === " + condition.expression;
            }).join(" && ") + ") {\n                " + entry.outputs.map(function (output) {
                return "result['" + output.token + "'] = " + functionize(output.calculation, true) + "();";
            }).join("\n") + "\n                result[\"Match\"] = {\"Name\": \"" + entry.name + "\", \"Index\": " + index + "};\n            }";
        }).join("\n");
    };
    return SingleAxisTable;
}(DecisionObject));
exports.SingleAxisTable = SingleAxisTable;
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
exports.getAllPaths = getAllPaths;
//# sourceMappingURL=author.js.map