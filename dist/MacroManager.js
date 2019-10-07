
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CommandManager = require('./CommandManager.js');
var MacroSequence = require('./MacroSequence.js');
var MacroDebug = require('./MacroDebug');
var UUID = require('uuid/v1');

var MacroManager = function (_CommandManager) {
    _inherits(MacroManager, _CommandManager);

    _createClass(MacroManager, [{
        key: '_performChange',
        value: function _performChange() {
            if (this._changeHandler) {
                this._changeHandler(this, this.currentSequence);
            }
        }
    }, {
        key: '_done',
        value: function _done() {
            this._performChange();

            this._running = false;
            if (this._completion) {
                this._completion(null);
            }

            this.clear();
        }
    }, {
        key: '_cancelQueue',
        value: function _cancelQueue(reason) {
            this._performChange();

            this._running = false;
            if (this._completion) {
                var error = new Error(reason);
                this._completion(error);
            }

            this.clear();
        }
    }, {
        key: '_errorQueue',
        value: function _errorQueue(fromSequence) {
            this._performChange();

            if (this._skipError === true) {
                this._nextQueue(fromSequence);
                return;
            }

            if (!fromSequence.currentError) {
                console.log('current error is null');
                return;
            }

            this._running = false;
            if (this._completion) {
                var error = typeof fromSequence.currentError === 'string' ? new Error(fromSequence.currentError) : fromSequence.currentError;
                this._completion(error);
            }

            this.clear();
        }
    }, {
        key: '_nextQueue',
        value: function _nextQueue(fromSequence) {
            var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            this._performChange();

            if (this._sequenceQueue.length === 0) {
                this._done();
                return;
            }

            if (fromSequence) {
                if (fromSequence.queueID !== this._queueID) {
                    this._debug('this sequence was expired queue');
                    return;
                }

                if (this.currentSequence !== fromSequence) {
                    this._debug('this queue is broken');
                    return;
                }

                if (this._sequenceQueue.length > 0) {
                    this._sequenceQueue.shift();
                }
            }

            var nextSequence = this.currentSequence;
            if (!nextSequence) {
                this._done();
                return;
            }

            if (nextSequence.queueID !== this._queueID) {
                this._debug('this sequence was expired queue');
                return;
            }

            nextSequence.execute(result);

            this._performChange();
        }
    }, {
        key: '_startQueue',
        value: function _startQueue() {
            this._performChange();

            if (this._running === true) {
                return;
            }

            this._running = true;
            this._nextQueue(null);
        }
    }, {
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
        key: 'currentSequence',
        get: function get() {
            return this._sequenceQueue.length > 0 ? this._sequenceQueue[0] : null;
        }
    }, {
        key: 'sequenceQueue',
        get: function get() {
            return this._sequenceQueue;
        }
    }, {
        key: 'numerOfSequences',
        get: function get() {
            return this._sequenceQueue.length;
        }
    }, {
        key: 'isRunning',
        get: function get() {
            return this._running;
        }
    }]);

    function MacroManager() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, MacroManager);

        var _this = _possibleConstructorReturn(this, (MacroManager.__proto__ || Object.getPrototypeOf(MacroManager)).call(this, props));

        _this._tag = typeof props.tag === 'string' ? props.tag : 'default';
        _this._skipError = props.skipError === true ? true : false;
        _this._running = false;
        _this._changeHandler = null;
        _this._completion = null;
        _this._timeout = typeof props.timeout === "number" ? props.timeout : 0;
        _this._timeoutInstance = null;
        _this._queueID = UUID();
        _this._sequenceQueue = [];

        _this._debug = new MacroDebug('macro:' + _this._tag);
        _this._debug.enabled = typeof props.debug === 'boolean' ? props.debug : _this._debug.enabled;
        return _this;
    }

    _createClass(MacroManager, [{
        key: 'onChange',
        value: function onChange(callback) {
            if (typeof callback === 'function') {
                this._changeHandler = callback;
            }
        }
    }, {
        key: 'timeout',
        value: function timeout(time) {
            this._timeout = time;
        }
    }, {
        key: 'add',
        value: function add(command, callback, tag) {

            if (typeof command === 'string') {
                if (!this.hasCommand(command)) {
                    this._debug("command is not registered", command);
                    return null;
                }

                command = this.commandByName(command);
            } else if ((typeof command === 'undefined' ? 'undefined' : _typeof(command)) === 'object') {
                if (!this.hasCommand(command.name)) {
                    this._debug("command is not registered", command);
                    return null;
                }
            }

            var sequence = new MacroSequence({
                tag: tag,
                command: command,
                manager: this,
                callback: callback,
                debug: this._debug.enabled
            });
            this._sequenceQueue.push(sequence);
            return sequence;
        }
    }, {
        key: 'insertAtIndex',
        value: function insertAtIndex(command, index, tag) {

            if (typeof command === 'string') {
                if (!this.hasCommand(command)) {
                    this._debug("command is not registered", command);
                    return null;
                }

                command = this.commandByName(command);
            } else if ((typeof command === 'undefined' ? 'undefined' : _typeof(command)) === 'object') {
                if (!this.hasCommand(command.name)) {
                    this._debug("command is not registered", command);
                    return null;
                }
            }
            var sequence = new MacroSequence({
                tag: tag,
                command: command,
                manager: this,
                callback: callback,
                debug: this._debug.enabled
            });
            this._sequenceQueue.splice(index, 0, sequence);
            return sequence;
        }
    }, {
        key: 'start',
        value: function start(callback) {
            var _this2 = this;

            if (this._running === true) {
                return;
            }

            this._completion = callback;
            this._startQueue();

            if (this._timeoutInstance) {
                clearTimeout(this._timeoutInstance);
                this._timeoutInstance = null;
            }

            if (this._timeout > 0) {
                this._timeoutInstance = setTimeout(function () {
                    _this2._cancelQueue("timeout");
                }, this._timeout);
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._performChange();

            this._queueID = UUID();
            this._running = false;
            this._completion = null;
            this._sequenceQueue = [];

            this._performChange();
        }
    }, {
        key: 'cancel',
        value: function cancel() {

            this._cancelQueue("cancelled");
        }
    }]);

    return MacroManager;
}(CommandManager);

module.exports = MacroManager;