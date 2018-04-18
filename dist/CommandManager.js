
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Command = require('./Command.js');

var CommandManager = function () {
    _createClass(CommandManager, [{
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
            this._handler = value;
        }
    }]);

    function CommandManager(props) {
        _classCallCheck(this, CommandManager);

        this._commandMap = {};
    }

    _createClass(CommandManager, [{
        key: 'hasCommand',
        value: function hasCommand(command) {
            return _typeof(this._commandMap[command]) === 'object' ? true : false;
        }
    }, {
        key: 'register',
        value: function register(command, callback) {
            if (this.hasCommand(command)) {
                return;
            }
            var commandObject = new Command({ name: command, callback: callback });
            this._commandMap[command] = commandObject;
        }
    }, {
        key: 'unregister',
        value: function unregister(command) {
            if (this._commandMap[command]) {
                this._commandMap[command] = null;
                delete this._commandMap[command];
            }
        }
    }, {
        key: 'commandByName',
        value: function commandByName(command) {
            if (!this.hasCommand(command)) {
                return null;
            }

            return this._commandMap[command];
        }
    }, {
        key: 'execute',
        value: function execute(command, info) {
            if (!this.hasCommand(command)) {
                return;
            }

            var commandObject = this.commandByName(command);
            commandObject.execute(info);
        }
    }]);

    return CommandManager;
}();

module.exports = CommandManager;