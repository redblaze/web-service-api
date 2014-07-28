
var $U = require('underscore');
var Class = require('better-js-class');
var cps = require('cps');

var TypeCheck = require('./TypeCheck.js');
var Err = require('./Exception.js');

module.exports = function() {
    var cls = Class({
        _init: function(cfg) {
            // this._APIs = cfg['APIs'];
            this._typeCheck = new TypeCheck({
                'typeDefs': cfg['typeDefs']
            });
            this._services = {};
        },

        add: function(serviceName, actionName, signature, def) {
            if (!this._services[serviceName]) {
                this._services[serviceName] = {};
            }

            this._services[serviceName][actionName] = {
                signature: signature,
                def: def
            }
        },

        _get: function(serviceName, actionName) {
            var service = this._services[serviceName];
            if (!service) {
                throw new Err('Service not found.', {
                    code: cls.EXCEPTION.SERVICE_NOT_FOUND_ERROR
                });
            }

            var action = service[actionName];
            if (!action) {
                throw new Err('Action not found.', {
                    code: cls.EXCEPTION.ACTION_NOT_FOUND_ERROR
                });
            }

            return action;
        },

        // handleRequests: function(context, requests, cb) {
        handleRequests: function() {
            var me = this;

            var context;
            var requests;
            var cb;

            if (arguments.length == 3) {
                context = arguments[0];
                requests = arguments[1];
                cb = arguments[2];
            } else {
                requests = arguments[0];
                cb = arguments[1];
            }

            cps.pmap(requests, function(request, cb) {
                cps.rescue({
                    'try': function(cb) {
                        cps.seq([
                            function(_, cb) {
                                me._handleRequest(context, request, cb);
                            },
                            function(res, cb) {
                                cb(null, {
                                    'status': 'ok',
                                    'data': res
                                });
                            }
                        ], cb);

                    },
                    'catch': function(err, cb) {
                        console.log('this is the wrong case.');
                        console.log(err.stack);
                        cb(null, {
                            'status': 'error',
                            'error': err.getError()
                        });
                    }
                }, cb);
            }, cb);
        },

        parallelHandleRequests: function(requests, cb) {

        },

        _validate: function(request) {
            var me = this;

            var serviceName = request['service'];
            if (!serviceName) {
                throw new Err('Service field is missing from request.', {
                    code: cls.EXCEPTION.SERVICE_FIELD_MISSING_ERROR
                });
            }
            var actionName = request['action'];
            if (!actionName) {
                throw new Err('Action field is missing from request.', {
                    code: cls.EXCEPTION.ACTION_FIELD_MISSING_ERROR
                });
            }

            var action = this._get(serviceName, actionName);

            var args = request['args'];
            var typeCheckResult = this._typeCheck.typeCheck(args, me._getInputType(action));
            if (typeCheckResult.status == 'ok') {
                return action['def'];
            } else {
                throw new Err('Request parameter failed validation.', {
                    code: cls.EXCEPTION.PARAMETER_VALIDATION_ERROR,
                    error: typeCheckResult.error
                })
            }
        },

        _getInputType: function(action) {
            if (action['signature']['args'] == null) {
                return null;
            } else {
                var inputType = {
                    'type': 'Object',
                    'fields': action['signature']['args']
                };

                if (action['signature']['validator']) {
                    inputType['validator'] = action['signature']['validator'];
                }

                return inputType;
            }
        },

        _handleRequest: function(context, request, cb) {
            var fn = this._validate(request);

            var args = request['args'];

            cps.rescue({
                'try': function(cb) {
                    fn(context, args, cb);
                },
                'catch': function(err, cb) {
                    if (err.stack) {
                        console.log(err.stack);
                    } else {
                        if (err.printStack) {
                            err.printStack();
                        }
                    }

                    throw new Err('Service call error.', {
                        code: cls.EXCEPTION.SERVICE_CALL_ERROR,
                        error: err._error? err._error : err
                    });
                }
            }, cb);

        }
    });

    $U.extend(cls, {
        EXCEPTION: {
            SERVICE_FIELD_MISSING_ERROR: 'service_field_missing_error',
            ACTION_FIELD_MISSING_ERROR: 'action_field_missing_error',
            SERVICE_NOT_FOUND_ERROR: 'service_not_found_error',
            ACTION_NOT_FOUND_ERROR: 'action_not_found_error',
            PARAMETER_VALIDATION_ERROR: 'parameter_validation_error',
            SERVICE_CALL_ERROR: 'service_call_error'
        }
    });

    return cls;
}();