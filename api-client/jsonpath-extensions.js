var clone = require('clone');
var filterMatch = /\(((@\.[^\s]*\s==\s[^\s]*)( && (@\.[^\s]*\s==\s[^\s]*))*)\)/i;

function addFilterPropertiesToObject(obj, filterExpression) {

    var result = filterExpression.match(filterMatch);
    if (result == null || result.length < 2) {
        throw new Error("Invalid or unsupported jsonpath filter. Only '==' comparisons are allowed.");
    }
    var addProperties = eval("(function (o){" + result[1].replace(/==/g, "=").replace(/&&/g, ";").replace(/@/g, "o") + ";})");
    addProperties(obj);

}

exports.addExtensions = function (jp) {

    jp.setValue = function(obj, pathExpression, value, includeMetaData) {
        var currentObj = obj;
        var parts = jp.parse(pathExpression);

        for (var i = 1; i < parts.length; i++) {
            var part = parts[i];

            if (part.operation == "member") {
                if (i == parts.length - 1) {
                    currentObj[part.expression.value] = value;
                } else if (!(part.expression.value in currentObj)) {
                    if (parts[i + 1].operation == "subscript") {
                        currentObj[part.expression.value] = [];
                    } else {
                        currentObj[part.expression.value] = {};
                    }
                    if (includeMetaData) {
                        currentObj[part.expression.value]._pathData = {
                            key: part.expression.value,
                            previous: currentObj._pathData
                        }
                    }
                }

                currentObj = currentObj[part.expression.value];
            }

            if (part.operation == "subscript") {
                var filterExpression = null;
                var index = 0;
                var hasIndex = false;
                var filteredArray = null;
                
                if (part.expression.type == "filter_expression") {
                    filterExpression = part.expression.value;
                    filteredArray = jp.query(currentObj, "$[" + filterExpression + "]");
                    if (parts[i + 1].expression.type == "numeric_literal") {
                        index = parts[i + 1].expression.value;
                        i++;
                        hasIndex = true;
                    }
                }

                if (part.expression.type == "numeric_literal") {
                    index = part.expression.value;
                    filteredArray = currentObj;
                    hasIndex = true;
                }
                
                if (index < filteredArray.length) {
                    currentObj = filteredArray[index];
                } else {
                    var objWithFilter = {};
                    
                    if (filterExpression)
                        addFilterPropertiesToObject(objWithFilter, filterExpression);

                    for (var j = filteredArray.length; j <= index; j++) {
                        var obj = clone(objWithFilter);
                        currentObj.push(obj);
                        if (includeMetaData) {
                            if (hasIndex) {
                                obj._index = j;
                                obj._jsonPath = jp.stringify(parts.slice(0, i)) + "[" + j + "]";
                            }
                            obj._pathData = {
                                key: currentObj._pathData.key,
                                previous: currentObj._pathData.previous
                            }
                        }
                    }

                    currentObj = currentObj[currentObj.length - 1];
                }
            }
            
        }
    };

    return jp;
};


