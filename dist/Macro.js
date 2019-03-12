
'use strict';

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

    function Macro(tag) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, Macro);

        options.tag = tag || 'default';

        this._debug = new MacroDebug('macro:' + options.tag);
        this._debug.enabled = typeof options.debug === 'boolean' ? options.debug : this._debug.enabled;

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
                    sequence.complete();
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
            this._manager.start(function (error) {

                _this5._debug("finish: ", error);

                if (typeof callback === 'function') {
                    setTimeout(function () {
                        callback(error);
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