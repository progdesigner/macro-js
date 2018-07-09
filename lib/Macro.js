
'use strict';

const Debug = require('debug');
const MacroManager = require('./MacroManager.js');

class Macro {

    get sequenceQueue() {
        return this._manager.sequenceQueue;
    }

    get numerOfSequences() {
        return this._manager.numerOfSequences;
    }

    constructor( tag, options = {} ) {

        options.tag = tag || 'default';

        this._debug = new Debug( 'macro:' + options.tag );

        this._manager = new MacroManager(options);
        this._manager.register("_DIRECT_COMMAND_", (command, info) => {
            this._manager._performChange();
        });

        this._manager.register("_DELAY_COMMAND_", (command, info) => {
            this._manager._performChange();
        });
    }

    onChange( callback ) {

        this._manager.onChange( (manager, currentSequence) => {
            callback(this);
        });
    }

    add( tag, callback ) {
        this._debug( "add", tag );

        callback = typeof tag === 'function' ? tag : callback;
        tag = typeof tag === 'function' ? '_' : tag;

        let command = this._manager.commandByName("_DIRECT_COMMAND_");
        let sequence = this._manager.add( command, (_, info) => {
            this._debug( "execute >> ", tag );
            setTimeout(() => {
                callback(sequence, info, null);
            }, 0);
        }, tag);

        if (!sequence) {
            this._debug( 'adding macro sequence was fail' );
            setTimeout(() => {
                let error = new Error('adding macro sequence is failed');
                callback(null, null, error);
            }, 0);
            return;
        }
    }

    delay( time ) {
        this._debug( "add delay", time );

        let command = this._manager.commandByName("_DELAY_COMMAND_");
        let sequence = this._manager.add( command, (_, info) => {
            this._debug( "delay >> ", time );
            setTimeout(() => {
                sequence.complete();
            }, time);
        });
        if (!sequence) {
            this._debug( 'adding macro sequence was fail' );
            return;
        }
    }

    start( callback = null ) {
        this._debug( "start" );
        this._manager.start( (error) => {

            this._debug( "finish: ", error );

            if (typeof callback === 'function') {
                setTimeout(() => {
                    callback(error);
                }, 0);
            }
        });
    }

    clear() {
        this._debug( "clear" );
        this._manager.clear();
    }

    cancel() {
        this._debug( "cancel" );
        this._manager.cancel();
    }
}

module.exports = Macro;
