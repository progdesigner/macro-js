'use strict';

exports = module.exports = MacroDebug.debug = MacroDebug['default'] = MacroDebug;

function coerce(val) {
    if (val instanceof Error) return val.stack || val.message;
    return val;
}

function enabled(name) {
    if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
        var storage = window.localStorage ? window.localStorage : { getItem: function getItem() {} };
        var DEBUG = storage.getItem('debug');
        if (DEBUG) {
            return true;
        }
    } else {
        if (process.env.DEBUG) {
            return true;
        }
    }

    return false;
}

function MacroDebug(namespace, enabledFlag) {

    var logger = function debug() {

        if (!logger.enabled) return;

        var self = logger;

        // turn the `arguments` into a proper Array
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; i++) {
            args[i] = arguments[i];
        }

        args[0] = coerce(args[0]);

        args.unshift(namespace);

        var logFn = console.log.bind(console);
        logFn.apply(self, args);
    };

    logger.namespace = namespace;
    logger.enabled = typeof enabledFlag === 'boolean' ? enabledFlag : enabled(namespace);

    return logger;
}