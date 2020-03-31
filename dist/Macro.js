
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MacroManager = require('./MacroManager.js');
var MacroDebug = require('./MacroDebug.js');

var Macro = function () {
    _createClass(Macro, [{
        key: 'sequenceQueue',
        get: function get() {
            return this._manager.sequenceQueue;
        }
    }, {
        key: 'numerOfSequences',
        get: function get() {
            return this._manager.numerOfSequences;
        }
    }, {
        key: 'isRunning',
        get: function get() {
            return this._manager.isRunning;
        }
    }]);

    function Macro(_arg1, _arg2) {
        var _this = this;

        _classCallCheck(this, Macro);

        var options = (typeof _arg1 === 'undefined' ? 'undefined' : _typeof(_arg1)) === 'object' ? _arg1 : (typeof _arg2 === 'undefined' ? 'undefined' : _typeof(_arg2)) === 'object' ? _arg2 : {};
        options.tag = typeof _arg1 === 'string' ? _arg1 : options.tag || 'default';

        var logNameSpace = 'macro:' + options.tag;
        var logEnabled = options.debug === true ? true : false;
        this._debug = new MacroDebug(logNameSpace, logEnabled);

        this._manager = new MacroManager(options);
        this._manager.register("_DIRECT_COMMAND_", function (command, info) {
            _this._manager._performChange();
        });

        this._manager.register("_DELAY_COMMAND_", function (command, info) {
            _this._manager._performChange();
        });
    }

    _createClass(Macro, [{
        key: 'onChange',
        value: function onChange(callback) {
            var _this2 = this;

            this._manager.onChange(function (manager, currentSequence) {
                callback(_this2);
            });
        }
    }, {
        key: 'add',
        value: function add(tag, callback) {
            var _this3 = this;

            this._debug("add", tag);

            callback = typeof tag === 'function' ? tag : callback;
            tag = typeof tag === 'function' ? '_' : tag;

            var command = this._manager.commandByName("_DIRECT_COMMAND_");
            var sequence = this._manager.add(command, function (_, info) {
                _this3._debug("execute >> ", tag);
                setTimeout(function () {
                    callback(sequence, info, null);
                }, 0);
            }, tag);

            if (!sequence) {
                this._debug('adding macro sequence was fail');
                setTimeout(function () {
                    var error = new Error('adding macro sequence is failed');
                    callback(null, null, error);
                }, 0);
                return;
            }
        }
    }, {
        key: 'delay',
        value: function delay(time) {
            var _this4 = this;

            this._debug("add delay", time);

            var command = this._manager.commandByName("_DELAY_COMMAND_");
            var sequence = this._manager.add(command, function (_, info) {
                _this4._debug("delay >> ", time);
                setTimeout(function () {
                    sequence.complete(info);
                }, time);
            });
            if (!sequence) {
                this._debug('adding macro sequence was fail');
                return;
            }
        }
    }, {
        key: 'start',
        value: function start() {
            var _this5 = this;

            var callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

            this._debug("start");
            this._manager.start(function (error, info) {

                _this5._debug("finish: ", error, info);

                if (typeof callback === 'function') {
                    setTimeout(function () {
                        callback(error, info);
                    }, 0);
                }
            });
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._debug("clear");
            this._manager.clear();
        }
    }, {
        key: 'cancel',
        value: function cancel() {
            this._debug("cancel");
            this._manager.cancel();
        }
    }]);

    return Macro;
}();

module.exports = Macro;