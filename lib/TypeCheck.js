
var $U = require('underscore');
var Class = require('better-js-class');


module.exports = function() {
    var simpleError = function(code) {
        return {
            'status': 'error',
            'error': {
                'code': code
            }
        };
    };

    var ok = function() {
        return {
            'status': 'ok'
        };
    };

    var _validate = function(cfg) {
        if (cfg['guard']) {
            return ok();
        } else {
            return validatorError(cfg['message']);
        }
    };

    var validatorError = function(validatorError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.VALIDATOR_ERROR,
                'validator': validatorError
            }
        };
    };

    var objectFieldError = function(fieldErrors) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.OBJECT_FIELD_ERROR,
                'fields': fieldErrors
            }
        }
    };

    var unionVariantError = function(variantError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.UNION_VARIANT_ERROR,
                'variants': variantError
            }
        }
    };

    var arrayElementError = function(elementError) {
        return {
            'status': 'error',
            'error': {
                'code': cls.EXCEPTION.ARRAY_ELEMENT_ERROR,
                'element': elementError
            }
        }
    };

    var cls = Class({
        _init: function(cfg) {
            this._typeDefs = cfg['typeDefs'];
        },

        typeCheck: function(value, type) {
            var me = this;

            if (!type) {
                return ok();
            }

            var nullable = type['nullable'];

            if (nullable) {
                if (value == null) {
                    return ok();
                } else {
                    return me._typeCheck(value, type);
                }
            } else {
                if (value == null) {
                    return simpleError(cls.EXCEPTION.MANDATORY_INPUT_IS_NULL_ERROR);
                } else {
                    return me._typeCheck(value, type);
                }
            }
        },

        _lookupType: function(alias) {
            return this._typeDefs[alias];
        },

        _typeCheck: function(value, type) {
            var me = this;

            var typeTag = type['type'];
            var validator = type['validator'];

            var validate = function(validator, value) {
                if (validator) {
                    return validator(value);
                } else {
                    return ok();
                }
            };

            switch(typeTag) {
                case 'String':
                    if (!$U.isString(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_STRING);
                    } else {
                        return validate(validator, value);
                    }
                case 'Number':
                    value = parseFloat(value);
                    if (!$U.isNumber(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_NUMBER);
                    } else {
                        return validate(validator, value);
                    }
                case 'Boolean':
                    if (!$U.isBoolean(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_BOOLEAN);
                    } else {
                        return validate(validator, value);
                    }
                case 'Date':
                    if (!$U.isNumber(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_DATE);
                    } else {
                        return validate(validator, new Date(value));
                    }
                case 'Object':
                    if (!$U.isObject(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_OBJECT);
                    } else {
                        var errors = {};
                        var hasError = false;
                        var fields = type['fields'];

                        for (var fieldName in fields) {
                            var fieldType = fields[fieldName];
                            var fieldTypeCheckResult = me.typeCheck(value[fieldName], fieldType);
                            if (fieldTypeCheckResult.status == 'ok') {

                            } else {
                                errors[fieldName] = fieldTypeCheckResult.error;
                                hasError = true;
                            }
                        }
                        if (hasError) {
                            return objectFieldError(errors);
                        } else {
                            return validate(validator, value);
                        }
                    }
                case 'Union':
                    if (!$U.isObject(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_A_UNION);
                    } else {
                        var variants = type['variants'];
                        var variantError = {};

                        for (var variantName in variants) {
                            var variantType = variants[variantName]
                            if (value[variantName]) {
                                var variantTypeCheckResult = me.typeCheck(value, variantType);
                                if (variantTypeCheckResult.status == 'ok') {
                                    return validate(validator, value);
                                } else {
                                    variantError[variantName] = variantTypeCheckResult.error;
                                    return unionVariantError(variantError);
                                }
                            }
                        }
                        return simpleError(cls.EXCEPTION.UNION_VARIANT_NOT_FOUND_ERROR);
                    }
                case 'Array':
                    if (!$U.isArray(value)) {
                        return simpleError(cls.EXCEPTION.TYPE_ERROR_NOT_AN_ARRAY);
                    } else {
                        var elemType = type['element'];
                        for (var i = 0; i < value.length; i++) {
                            var elementValue = value[i];
                            console.log('=============');
                            var elementTypeCheckResult = me.typeCheck(elementValue, elemType);

                            console.log(elementValue);
                            console.log(elemType);
                            console.log('=============');
                            if (elementTypeCheckResult.status == 'error') {
                                return arrayElementError(elementTypeCheckResult.error);
                            }
                        }
                        return validate(validator, value);
                    }
                case 'Alias':
                    var _type = me._lookupType(type['alias']);
                    if (_type) {
                        return me.typeCheck(value, _type);
                    } else {
                        return simpleError();
                    }

                default:
                    throw new Error('unsupported type tag: ' + typeTag);
            }
        }
    });

    $U.extend(cls, {
        EXCEPTION: {
            /* mandatory */
            MANDATORY_INPUT_IS_NULL_ERROR: 'mandatory_input_is_null_error',
            /* type */
            TYPE_ERROR_NOT_A_STRING: 'type_error_not_a_string',
            TYPE_ERROR_NOT_A_NUMBER: 'type_error_not_a_number',
            TYPE_ERROR_NOT_A_BOOLEAN: 'type_error_not_a_boolean',
            TYPE_ERROR_NOT_A_DATE: 'type_error_not_a_date',
            TYPE_ERROR_NOT_AN_OBJECT: 'type_error_not_an_object',
            TYPE_ERROR_NOT_A_UNION: 'type_error_not_a_union',
            TYPE_ERROR_NOT_AN_ARRAY: 'type_error_not_an_array',
            TYPE_ERROR_NOT_AN_ALIAS: 'type_error_not_an_alias',
            /* structure */
            OBJECT_FIELD_ERROR: 'object_field_error',
            UNION_VARIANT_ERROR: 'union_variant_error',
            UNION_VARIANT_NOT_FOUND_ERROR: 'union_variant_not_found_error',
            ARRAY_ELEMENT_ERROR: 'array_element_error',
            /* validate */
            VALIDATOR_ERROR: 'validator_error'
        },
        ok: ok,
        validatorError: validatorError,
        validate: _validate
    });

    return cls;
}();
