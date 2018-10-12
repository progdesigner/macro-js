exports = module.exports = MacroDebug.debug = MacroDebug['default'] = MacroDebug;

function coerce( val ) {
    if ( val instanceof Error ) return val.stack || val.message;
    return val;
}

function enabled( name ) {
    if (typeof process === 'undefined' || process.type === 'renderer' || process.browser === true || process.__nwjs) {
        let storage = localstorage();
        let DEBUG = storage.getItem('debug');
        if ( DEBUG ) {
            return true;
        }
    }
    else {
        if ( process.env.DEBUG ) {
            return true;
        }
    }

    return false;
}

function MacroDebug( namespace ) {

    function debug() {

        if ( !debug.enabled ) return;

        var self = debug;

        // turn the `arguments` into a proper Array
        var args = new Array( arguments.length );
        for ( var i = 0; i < args.length; i++ ) {
            args[ i ] = arguments[ i ];
        }

        args[ 0 ] = coerce( args[ 0 ] );

        args.unshift( namespace );

        var logFn = console.log.bind( console );
        logFn.apply( self, args );
    }

    debug.namespace = namespace;
    debug.enabled = enabled( namespace );

    return debug;
}
