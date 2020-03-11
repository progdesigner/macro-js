
'use strict';

const CommandManager = require('./CommandManager.js');
const MacroSequence = require('./MacroSequence.js');
const MacroDebug = require('./MacroDebug');
const { v1: UUID } = require('uuid');

class MacroManager extends CommandManager {
    get tag() {
        return this._tag;
    }

    get queueID() {
        return this._queueID;
    }

    get currentSequence() {
        return this._sequenceQueue.length > 0 ? this._sequenceQueue[0] : null;
    }

    get sequenceQueue() {
        return this._sequenceQueue;
    }

    get numerOfSequences() {
        return this._sequenceQueue.length;
    }

    get isRunning() {
        return this._running;
    }

    _performChange() {
        if (this._changeHandler) {
            this._changeHandler(this, this.currentSequence);
        }
    }

    _done() {
        this._performChange();

        this._running = false;
        if (this._completion) {
            this._completion(null);
        }

        this.clear();
    }

    _cancelQueue( reason ) {
        this._performChange();

        this._running = false;
        if (this._completion) {
            let error = new Error(reason);
            this._completion(error);
        }

        this.clear();
    }

    _errorQueue( fromSequence ) {
        this._performChange();

        if (this._skipError === true) {
            this._nextQueue(fromSequence);
            return;
        }

        if (!fromSequence.currentError) {
            console.log( 'current error is null' );
            return;
        }

        this._running = false;
        if (this._completion) {
            let error = typeof fromSequence.currentError === 'string' ? new Error(fromSequence.currentError) : fromSequence.currentError;
            this._completion(error);
        }

        this.clear();
    }

    _nextQueue( fromSequence, result = null ) {
        this._performChange();

        if (this._sequenceQueue.length === 0) {
            this._done();
            return;
        }

        if (fromSequence) {
            if (fromSequence.queueID !== this._queueID) {
                this._debug( 'this sequence was expired queue' );
                return;
            }

            if ( this.currentSequence !== fromSequence ) {
                this._debug( 'this queue is broken' );
                return;
            }

            if (this._sequenceQueue.length > 0) {
                this._sequenceQueue.shift();
            }
        }

        let nextSequence = this.currentSequence;
        if (!nextSequence) {
            this._done();
            return;
        }

        if (nextSequence.queueID !== this._queueID) {
            this._debug( 'this sequence was expired queue' );
            return;
        }

        nextSequence.execute(result);

        this._performChange();
    }

    _startQueue() {
        this._performChange();

        if (this._running === true) {
            return;
        }

        this._running = true;
        this._nextQueue(null);
    }

    constructor( props = {} ) {
        super( props );

        this._tag = typeof props.tag === 'string' ? props.tag : 'default';
        this._skipError = props.skipError === true ? true : false;
        this._running = false;
        this._changeHandler = null;
        this._completion = null;
        this._timeout = typeof props.timeout === "number" ? props.timeout : 0;
        this._timeoutInstance = null;
        this._queueID = UUID();
        this._sequenceQueue = [];

        let logNameSpace = 'macro:' + this._tag;
        let logEnabled = props.debug === true ? true : false;
        this._debug = new MacroDebug( logNameSpace, logEnabled );
    }

    onChange( callback ) {
        if (typeof callback === 'function') {
            this._changeHandler = callback;
        }
    }

    timeout( time ) {
        this._timeout = time;
    }

    add( command, callback, tag ) {

        if (typeof command === 'string') {
            if (!this.hasCommand(command)) {
                this._debug( "command is not registered", command );
                return null;
            }

            command = this.commandByName(command);
        }
        else if (typeof command === 'object') {
            if (!this.hasCommand(command.name)) {
                this._debug( "command is not registered", command );
                return null;
            }
        }

        let sequence = new MacroSequence({
            tag: tag,
            command: command,
            manager: this,
            callback: callback,
            debug: this._debug.enabled
        });
        this._sequenceQueue.push(sequence);
        return sequence;
    }

    insertAtIndex( command, index, tag ) {

        if (typeof command === 'string') {
            if (!this.hasCommand(command)) {
                this._debug( "command is not registered", command );
                return null;
            }

            command = this.commandByName(command);
        }
        else if (typeof command === 'object') {
            if (!this.hasCommand(command.name)) {
                this._debug( "command is not registered", command );
                return null;
            }
        }
        let sequence = new MacroSequence({
            tag: tag,
            command: command,
            manager: this,
            callback: callback,
            debug: this._debug.enabled
        });
        this._sequenceQueue.splice(index, 0, sequence);
        return sequence;
    }

    start( callback ) {
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
            this._timeoutInstance = setTimeout(() => {
                this._cancelQueue("timeout");
            }, this._timeout);
        }
    }

    clear() {
        this._performChange();

        this._queueID = UUID();
        this._running = false;
        this._completion = null;
        this._sequenceQueue = [];

        this._performChange();
    }

    cancel() {

        this._cancelQueue("cancelled");
    }
}

module.exports = MacroManager;
