
var Class = require('better-js-class');

module.exports = function() {
    var cls = Class({
        _init: function(msg, error) {
            this._stackError = new Error(msg);
            this._error = error;
        },

        getError: function() {
            return this._error;
        },

        printStack: function() {
            console.log(this._stackError.stack);
        }
    });

    return cls;
}();