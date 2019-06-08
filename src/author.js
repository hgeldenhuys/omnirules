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
function functionize(code, addFunction, rawValue) {
    if (addFunction === void 0) { addFunction = false; }
    if (rawValue === void 0) { rawValue = false; }
    if (!rawValue) {
        code = code || "";
        if (code.indexOf("result") === -1) {
            code = "var result=undefined; result = " + code;
        }
        if (addFunction) {
            code = "function() {" + code + "; return result}";
        }
    }
    return code;
}
exports.functionize = functionize;
function assert(expr, message, code) {
    if (!expr) {
        throw new Error("[" + code + "]: " + message);
    }
    return assert;
}
exports.assert = assert;
function replaceTokensWithPath(code, name, path) {
    var previousRegex = new RegExp("\\b\\." + name + "\\b", "g");
    var nameRegEx = new RegExp("(?!'|\")\\b" + name + "\\b(?!'|\")", "g");
    var restorePreviousRegex = new RegExp("\\b\\._" + name + "\\b", "g");
    var restoreValuesBetweenSingleQuotesRegex = new RegExp("(')\\b([^']*)(bom.)" + name + "([^']*)\\b(')", "g");
    var restoreValuesBetweenDoubleQuotesRegex = new RegExp("(\")\\b([^\"]*)(bom.)" + name + "([^\"]*)\\b(\")", "g");
    code = code.replace(previousRegex, "._" + name);
    code = code.replace(nameRegEx, "" + path);
    code = code.replace(restorePreviousRegex, "." + name);
    code = code.replace(restoreValuesBetweenSingleQuotesRegex, "'$2" + name + "$4'");
    code = code.replace(restoreValuesBetweenDoubleQuotesRegex, "\"$2" + name + "$4\"");
    return code;
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
    ConditionTypeEnum["Boolean"] = "Expression";
    ConditionTypeEnum["LessThan"] = "LessThan";
    ConditionTypeEnum["LessThanOrEqualTo"] = "LessThanOrEqualTo";
    ConditionTypeEnum["GreaterThan"] = "GreaterThan";
    ConditionTypeEnum["GreaterThanOrEqualTo"] = "GreaterThanOrEqualTo";
    ConditionTypeEnum["Between"] = "Between";
    ConditionTypeEnum["Outside"] = "Outside";
})(ConditionTypeEnum = exports.ConditionTypeEnum || (exports.ConditionTypeEnum = {}));
var DataTypeEnum;
(function (DataTypeEnum) {
    DataTypeEnum["Any"] = "Unknown";
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
SAMPLEDATA[DataTypeEnum.Any] = undefined;
var DataPointBase = (function () {
    function DataPointBase(jsonObj) {
        this.dataType = DataTypeEnum.Any;
        for (var propName in jsonObj) {
            this[propName] = jsonObj[propName];
        }
        this.label = this.label || this.name;
        this.path = this.path || this.name;
        this.dataType = this.dataType !== undefined ? this.dataType : DataTypeEnum.Decimal;
        this.doc = this.doc || "This is a " + this.name + " of type " + DataTypeEnum[this.dataType] + " with default value of " + this.mockValue;
    }
    DataPointBase.prototype.getFullPath = function (excludeRoot) {
        if (excludeRoot === void 0) { excludeRoot = false; }
        var path = this.path;
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
        _this.name = tokenizeString(_this.name);
        _this.conditions = [];
        if (!!jsonObj.conditions) {
            jsonObj.conditions.forEach(function (condition) {
                var params = condition;
                _this.addCondition(params);
            });
        }
        if (_this.code) {
            assert(replaceTokensWithPath(_this.code, _this.name, "bom." + _this.name) === _this.code, "Code cannot refer to itself for name \"" + _this.name + "\" with \"bom." + _this.name + "\":\nCode:\n=====================\n" + _this.code + "\n=====================\nReplaced:\n=====================\n" + replaceTokensWithPath(_this.code, _this.name, "bom." + _this.name) + "\"\n=====================", "RULE02");
        }
        else {
            _this.code = "result = undefined";
        }
        return _this;
    }
    Output.prototype.addCondition = function (condition) {
        var outputCondition = new Condition(this.getParent(), condition);
        outputCondition.name = "" + tokenizeString(outputCondition.name);
        outputCondition.path = "_conditions." + this.path + "_" + (this.conditions.length + 1) + "_" + outputCondition.name;
        this.conditions.push(outputCondition);
        this.getParent().addOutput(outputCondition);
        return outputCondition;
    };
    Output.prototype.getRule = function () {
        var code = this.code;
        if (code.indexOf("result") === -1) {
            code = "result = " + code;
        }
        if (this.conditions.length > 0) {
            var conditions_1 = [];
            this.conditions.forEach(function (condition) {
                conditions_1.push(condition.name);
            });
            code = "if (" + conditions_1.join(" && ") + ") {" + code + "}";
        }
        return terser.minify(code, {
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
    Output.findOutput = function (outputs, name) {
        for (var _i = 0, outputs_1 = outputs; _i < outputs_1.length; _i++) {
            var output = outputs_1[_i];
            if (output.name === name) {
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
                decisionObject.parentName = this.path.split(".")[this.path.split(".").length - 1];
                decisionObject = new MultiAxisTable(this.getParent(), decisionObject);
            }
            else {
                decisionObject = new DecisionObject(this.getParent(), decisionObject);
            }
            this.decisionObject = decisionObject;
            this.inputMappings = inputMappings;
            decisionObject.parentName = this.path;
            decisionObject.inputs.forEach(function (input) {
                var namees = _this.inputMappings.filter(function (inputMapping) {
                    return (inputMapping.To === input.name);
                });
                assert(namees.length > 0, "No mapping found for input variable \"" + input.getFullPath() + "\" on rule set \"" + _this.getParent().name + "." + _this.label + "\"", "OUTPUT02");
            });
            this.inputMappings.forEach(function (mapping) {
                var input = decisionObject.getInput(mapping.To);
                var dataPoint = _this.getParent().getDataPoint(mapping.From);
                var code = dataPoint ? dataPoint.getFullPath() : mapping.From;
                var output = new Output(decisionObject, {
                    name: input.name,
                    code: code,
                    dataType: input.dataType,
                    doc: input.doc,
                    mockValue: input.mockValue,
                    label: input.label,
                    path: input.path,
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
            this.code = this.expression;
        }
        else if (this.conditionType === ConditionTypeEnum.LessThan) {
            this.code = this.expression + " < " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.LessThanOrEqualTo) {
            this.code = this.expression + " <= " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.GreaterThan) {
            this.code = this.expression + " > " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.GreaterThanOrEqualTo) {
            this.code = this.expression + " >= " + this.number;
        }
        else if (this.conditionType === ConditionTypeEnum.Between) {
            var left = "<" + (this.includeFrom ? "=" : "");
            var right = "<" + (this.includeTo ? "=" : "");
            this.code = this.from + " " + left + " " + this.expression + " " + right + " " + this.to;
        }
        else if (this.conditionType === ConditionTypeEnum.Outside) {
            var left = "<" + (this.includeFrom ? "=" : "");
            var right = ">" + (this.includeTo ? "=" : "");
            this.code = "(" + this.expression + " " + left + " " + this.from + ") && (" + this.expression + " " + right + " " + this.to + ")";
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
        var namees = this.getDataPoints()
            .map(function (dataPoint) {
            return { count: 1, name: dataPoint.name };
        })
            .reduce(function (accumulator, currentValue) {
            accumulator[currentValue.name] = (accumulator[currentValue.name] || 0) + currentValue.count;
            return accumulator;
        }, {});
        var duplicateTokens = Object.keys(namees).filter(function (a) { return namees[a] > 1; });
        if (duplicateTokens.length !== 0) {
            rulesengine_1.jlog(this.outputs);
            rulesengine_1.jlog(this.inputs);
        }
        assert(duplicateTokens.length === 0, "Following name(es) are duplicated: '" + duplicateTokens.join("', '") + "' in BOM of '" + this.name + "'", "DO01");
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
            return { count: 1, name: dataPoint.path };
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
            var data = addAnnotation ? { sampleData: input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")], documentation: input.doc, dataType: DataTypeEnum[input.dataType.replace("Type", "")] } : input.mockValue ? sampleData : SAMPLEDATA[input.dataType.replace("Type", "")];
            bom_1.addToBom(bom, "" + input.path, data);
        });
        if (includeOutputs) {
            this.outputs.forEach(function (output, index) {
                if (output.hasDecisionObject()) {
                    var dObject = output.getDecisionObject();
                    if (dObject.decisionObjectType === DecisionObjectType.MultiAxisTable) {
                        var root_1 = output.path.split(".")[0];
                        var subBom = dObject.generateSampleBOM(includeOutputs, addAnnotation)[root_1];
                        getAllPaths(output.name, subBom).forEach(function (path) {
                            var fullPath = root_1 + "." + path.path.split(".").splice(1).join(".");
                            bom_1.addToBom(bom, fullPath, path.value);
                        });
                    }
                    else {
                        bom_1.addToBom(bom, "" + output.path, dObject.generateSampleBOM(includeOutputs, addAnnotation));
                    }
                }
                else if (output.name.indexOf("DecisionTable_") === -1) {
                    var sampleData = evaluateMockValue(output);
                    var data = addAnnotation ? { sampleData: sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")], documentation: output.doc, dataType: DataTypeEnum[output.dataType.replace("Type", "")] } : sampleData ? sampleData : SAMPLEDATA[output.dataType.replace("Type", "")];
                    bom_1.addToBom(bom, output.path, data);
                }
            });
        }
        bom_1.addToBom(bom, "SchemaVersion", this.schemaVersion());
        return bom;
    };
    InputsOutputsManager.prototype.schemaVersion = function () {
        var hash = "";
        this.getDataPoints().forEach(function (datapoint) {
            hash += datapoint.path + ":" + datapoint.dataType;
        });
        return ts_md5_1.Md5.hashStr(hash).toString();
    };
    InputsOutputsManager.prototype.getInput = function (name) {
        return this.inputs.filter(function (input) {
            return (input.name === name);
        })[0];
    };
    InputsOutputsManager.prototype.getOutput = function (name) {
        return this.outputs.filter(function (output) {
            return (output.name === name);
        })[0];
    };
    InputsOutputsManager.prototype.getDataPoint = function (name) {
        return this.getDataPoints().filter(function (dataPoint) {
            return (dataPoint.name === name);
        })[0];
    };
    InputsOutputsManager.prototype.addInput = function (input) {
        this.inputs.forEach(function (iInput) {
            assert(iInput.name !== input.name, "There's already an input with name " + input.name + "\"", "INPUT01");
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
            assert(iOutput.name !== output.name, "There's already an output with name " + output.name + "\"", "OUTPUT04");
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
            return input.name !== _this.input.name;
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
            this.usingCode(calculator);
        }
        else {
            this.usingDecisionObject(calculator);
        }
        return this;
    };
    OutputBuilder.prototype.usingCode = function (code) {
        this.output.code = code;
        return this;
    };
    OutputBuilder.prototype.withCode = function (code) {
        return this.usingCode(code);
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
            name: !!withLabel ? tokenizeString(withLabel) : tokenizeString(expression) + "IsTrue"
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
            var name_1 = path[path.length - 1];
            input = this.decisionObject.getInput(name_1) || this.decisionObject.addInput({ name: name_1, path: input });
        }
        else {
            input = this.decisionObject.getInput(input.name) || this.decisionObject.addInput(input);
        }
        return new InputBuilder(input, this);
    };
    DecisionObjectBuilder.prototype.withOutput = function (output) {
        if (typeof output === "string") {
            var path = output.split(".");
            var name_2 = path[path.length - 1];
            output = this.decisionObject.getOutput(name_2) || this.decisionObject.addOutput({ name: name_2, path: output });
        }
        else {
            output = this.decisionObject.getOutput(output.name) || this.decisionObject.addOutput(output);
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
        if (!!jsonObj.outputs) {
            jsonObj.outputs.forEach(function (output, index) {
                var newOutput = new Output(_this, output);
                _this.addOutput(newOutput);
            });
        }
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
            return input.path;
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
            var conditions = output.conditions.map(function (condition) { return condition.name; }).join(" and ");
            rules.push("" + output.label + (output.label !== output.name ? "known as " + output.name + " " : "") + " is defined as " + output.code + (output.path !== output.name ? "It will be saved under " + output.path : "") +
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
                    name: output.path,
                    code: "//Sub Rules",
                    behaviour: rulesengine_1.RuleBehaviour.Never
                };
                assert(rule.name, "Rule doesn't have a name using '" + output.path + "'", "RULE03");
                rules.rules.push(rule);
            }
            else {
                var rule = {
                    name: output.path,
                    code: output.getRule(),
                    behaviour: output.ruleBehaviour
                };
                assert(rule.name, "Rule doesn't have a name using '" + output.path + "'", "RULE03");
                rules.rules.push(rule);
            }
        });
        if (!this.getParent()) {
            rules.rules.forEach(function (rule) {
                _this.getDataPoints().forEach(function (dataPoint) {
                    rule.code = replaceTokensWithPath(rule.code, dataPoint.name, "" + dataPoint.getFullPath());
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
        var cellCode = this.generateCellCode();
        var globalCode = "\n        \n        result = (function() {\n        " + cellCode + "\n        return result;\n        })()";
        var purpose = this.purpose || "";
        var outputBase = new Output(this, {
            code: "" + globalCode,
            name: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            path: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            doc: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal
        });
        this.outputs.forEach(function (output) {
            if (output.name.indexOf("DecisionTable_") === -1) {
                output.code = "result = " + outputBase.name + "." + output.name;
            }
        });
        var decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    };
    MultiAxisTable.prototype.generateCellCode = function () {
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
                var cellOutput = cell.outputs.filter(function (cellOutput) { return cellOutput.name === output.name; })[0];
                var cellValue = cellOutput ? functionize(cellOutput.code, true, cellOutput.rawValue) : "void 0";
                code += "\n                var cell" + output.name + " = " + cellValue + ";\n                cell" + output.name + " = evaluate(" + cellValue + ");\n                ";
            });
            _this.rows[cell.rowNumber - 1].outputs.forEach(function (output, outputIndex) {
                var columnFn = functionize(output.code, true, output.rawValue);
                code += "\n                if (cell" + output.name + " === void 0) {\n                    var column = " + columnFn + ";\n                    cell" + output.name + " = evaluate(column);                    \n                }\n                ";
            });
            _this.columns[cell.columnNumber - 1].outputs.forEach(function (output, outputIndex) {
                var columnFn = functionize(output.code, true, output.rawValue);
                code += "\n                if (cell" + output.name + " === void 0) {\n                    var column = " + columnFn + ";\n                    cell" + output.name + " = evaluate(column);                    \n                }\n                ";
            });
            _this.outputs.forEach(function (output) {
                var tableFn = functionize(output.code, true, output.rawValue);
                code += "\n                if (cell" + output.name + " === void 0) {\n                    //raw=" + output.rawValue + "\n                    var table = " + tableFn + ";\n                    cell" + output.name + " = evaluate(table);\n                }\n                result[\"" + output.name + "\"] = cell" + output.name + ";\n                ";
            });
            code += "} else \n            ";
        });
        code += " {\n            ";
        this.outputs.forEach(function (output) {
            var tableFn = functionize(output.code, true, output.rawValue);
            code += "\n                result.Match = {NoMatch: true};\n                var table" + output.name + " = " + tableFn + ";\n                result[\"" + output.name + "\"] = evaluate(table" + output.name + ");\n                ";
        });
        code += "}\n        result.TableName = \"" + ((this.name && this.name.replace(/"/g, '\"')) || "Any") + "\";\n        result.Purpose = \"" + ((this.purpose && this.purpose.replace(/"/g, '\"')) || "Any") + "\";\n        ";
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
                name: input.name,
                label: input.name,
                conditionType: ConditionTypeEnum.Boolean,
                expression: input.dataType === DataTypeEnum.Enum ? _this.ruleContext.getEnumerationSet(input.enumerationSet).values[0].value : undefined
            });
        });
        var outputs = this.outputs.map(function (output) {
            var newOutuput = new Output(undefined, output);
            if (output.dataType === DataTypeEnum.Enum) {
                output.code = "\"" + _this.ruleContext.getEnumerationSet(output.enumerationSet).values[0].value + "\"";
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
                assert(((entry.conditions.filter(function (condition) { return condition.name === input.name; }).length > 0)), "Missing the condition for " + input.name + " on entry #" + entryIndex, "ENTRY01");
            });
            _this.outputs.forEach(function (output) {
                assert((entry.outputs.length === _this.outputs.length) && (entry.outputs.filter(function (entryOutput) { return output.name === entryOutput.name; }).length > 0), "Missing an output \"" + output.name + "\" for entry #" + entryIndex, "ENTRY02");
            });
        });
        this.outputs.forEach(function (output) {
            output.code = "";
        });
        var tableCode = this.generateTableCode();
        var globalCode = "\n        result = (function() {\n        " + tableCode + "\n        return result;\n        })()";
        var purpose = this.purpose || "";
        var outputBase = new Output(this, {
            code: "" + globalCode,
            name: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            dataType: DataTypeEnum.Object,
            path: "DecisionTable_" + (purpose ? tokenizeString(purpose) : ""),
            decisionObject: undefined,
            rawValue: false,
            inputMappings: [],
            conditions: [],
            doc: "",
            mockValue: undefined,
            label: "Table",
            ruleBehaviour: rulesengine_1.RuleBehaviour.Normal
        });
        this.outputs.forEach(function (output) {
            if (output.name.indexOf("DecisionTable_") === -1) {
                output.code = "result = " + outputBase.name + "." + output.name;
            }
        });
        var decisionTableOutput = new Output(this, outputBase);
        this.addOutput(decisionTableOutput);
    };
    SingleAxisTable.prototype.generateTableCode = function () {
        return "var result = {\"TableName\": \"" + this.name + "\"};\n        " + this.entries.map(function (entry, index) {
            return "if (" + entry.conditions.map(function (condition) {
                return condition.name + " === " + condition.expression;
            }).join(" && ") + ") {\n                " + entry.outputs.map(function (output) {
                return "result['" + output.name + "'] = " + functionize(output.code, true) + "();";
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