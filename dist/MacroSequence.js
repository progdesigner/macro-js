
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MacroDebug = require('./MacroDebug');
var UUID = require('uuid/v1');

var __DEBUG__ = 0;

var MacroSequence = function () {
    _createClass(MacroSequence, [{
        key: 'tag',
        get: function get() {
            return this._tag;
        }
    }, {
        key: 'queueID',
        get: function get() {
            return this._queueID;
        }
    }, {
        key: 'command',
        get: function get() {
            return this._command;
        }
    }, {
        key: 'currentError',
        get: function get() {
            return this._currentError;
        }
    }, {
        key: 'executeCount',
        get: function get() {
            return this._executeCount;
        }
    }, {
        key: 'isDone',
        get: function get() {
            return this._done;
        }
    }, {
        key: 'isRunning',
        get: function get() {
            return this._running;
        }
    }, {
        key: 'isExpired',
        get: function get() {
            return this._expired;
        }
    }, {
        key: 'hasError',
        get: function get() {
            return this._currentError ? true : false;
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

    function MacroSequence() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MacroSequence);

        this._tag = typeof props.tag === 'string' ? props.tag : UUID();
        this._command = _typeof(props.command) === 'object' ? props.command : { /* GhostCommand */execute: function execute() {} };
        this._manager = _typeof(props.manager) === 'object' ? props.manager : { /* GhostManager */_errorQueue: function _errorQueue() {}, _nextQueue: function _nextQueue() {}, queueID: '' };
        this._handler = typeof props.callback === 'function' ? props.callback : null;
        this._queueID = this._manager.queueID;
        this._currentError = null;
        this._currentInfo = null;
        this._executeCount = 0;
        this._running = false;
        this._expired = false;
        this._done = false;

        this._debug = new MacroDebug('macro-sequence:' + this._manager.tag + ':' + this._tag);
        this._debug.enabled = typeof props.debug === 'boolean' ? props.debug : this._debug.enabled;
    }

    _createClass(MacroSequence, [{
        key: 'execute',
        value: function execute() {
            var info = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            if (this._done === true) {
                this._debug('this queue is already finished. ignore execute');
                return;
            }

            this._running = true;
            this._currentInfo = info;
            this._executeCount = this._executeCount + 1;

            this._manager._performChange();

            this._command.execute(info);

            if (this._handler) {
                this._handler(this._command, this._currentInfo);
            }
        }
    }, {
        key: 'retry',
        value: function retry() {
            var _this = this;

            setTimeout(function () {
                _this.execute(_this._currentInfo);
            }, 100);
        }
    }, {
        key: 'error',
        value: function error(_error) {
            if (this._expired === true) {
                this._debug("this queue was already expired. ignore error");
                return;
            }

            this._currentError = _error;
            this._running = false;
            this._expired = true;

            if (this._manager.queueID !== this._queueID) {
                this._debug('this queue was already expired');
                return;
            }

            if (__DEBUG__) {
                this._debug("MacroSequence - error : ", this._tag, _error);
            }

            this._manager._errorQueue(this);
        }
    }, {
        key: 'complete',
        value: function complete() {
            if (this._expired === true) {
                this._debug('this queue was already expired. ignore error');
                return;
            }

            if (this._running === false) {
                this._debug('this queue isn\'t running');
                return;
            }

            this._expired = true;
            this._running = false;

            if (this._manager.queueID !== this._queueID) {
                this._debug('this queue was already expired');
                return;
            }

            this._debug("MacroSequence - complete : ", this._tag);

            this._done = true;

            this._manager._nextQueue(this);
        }
    }]);

    return MacroSequence;
}();

module.exports = MacroSequence;