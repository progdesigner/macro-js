
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = function () {
    _createClass(Command, [{
        key: 'name',
        get: function get() {
            return this._name;
        },
        set: function set(value) {
            this._name = value;
        }
    }, {
        key: 'handler',
        get: function get() {
            return this._handler;
        },
        set: function set(value) {
            if (typeof value === 'function') {
                this._handler = value;
            }
        }
    }]);

    function Command(props) {
        _classCallCheck(this, Command);

        this._name = typeof props.name === 'string' ? props.name : '';
        this._handler = typeof props.callback === 'function' ? props.callback : function () {};
    }

    _createClass(Command, [{
        key: 'execute',
        value: function execute(info) {
            this._handler(this, info);
        }
    }]);

    return Command;
}();

module.exports = Command;