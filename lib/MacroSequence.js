
'use strict';

const MacroDebug = require('./MacroDebug');
const UUID = require('uuid/v1');

const __DEBUG__ = 0;

class MacroSequence {
    get tag() {
        return this._tag;
    }

    get queueID() {
        return this._queueID;
    }

    get command() {
        return this._command;
    }

    get currentError() {
        return this._currentError;
    }

    get executeCount() {
        return this._executeCount;
    }

    get isDone() {
        return this._done;
    }

    get isRunning() {
        return this._running;
    }

    get isExpired() {
        return this._expired;
    }

    get hasError() {
        return this._currentError ? true : false;
    }

    get handler() {
        return this._handler;
    }

    set handler( value ) {
        if (typeof value === 'function') {
            this._handler = value;
        }
    }

    constructor( props = {} ) {
      this._tag = typeof props.tag === 'string' ? props.tag : UUID();
      this._command = typeof props.command === 'object' ? props.command : {/* GhostCommand */ execute: () => {} };
      this._manager = typeof props.manager === 'object' ? props.manager : {/* GhostManager */  _errorQueue: () => {}, _nextQueue: () => {}, queueID: '' };
      this._handler = typeof props.callback === 'function' ? props.callback : null;
      this._queueID = this._manager.queueID;
      this._currentError = null;
      this._currentInfo = null;
      this._executeCount = 0;
      this._running = false;
      this._expired = false;
      this._done = false;

      let logNameSpace = 'macro-sequence:' + this._manager.tag + ':' + this._tag;
      let logEnabled = props.debug === true ? true : false;
      this._debug = new MacroDebug( logNameSpace, logEnabled );
    }

    execute( info = null ) {
      if (this._done === true) {
          this._debug( 'this queue is already finished. ignore execute' );
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

    retry( info = null ) {

        setTimeout(() => {
            this._currentInfo = info || this._currentInfo
            this.execute(this._currentInfo);
        }, 100);
    }

    error( error ) {
        if ( this._expired === true ) {
            this._debug( "this queue was already expired. ignore error" );
            return;
        }

        this._currentError = error;
        this._running = false;
        this._expired = true;

        if (this._manager.queueID !== this._queueID) {
            this._debug( 'this queue was already expired' );
            return;
        }

        if (__DEBUG__) {
            this._debug( "MacroSequence - error : ", this._tag, error );
        }

        this._manager._errorQueue(this);
    }

    complete( result = null ) {
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
            this._debug( 'this queue was already expired' );
            return;
        }

        this._debug( "MacroSequence - complete : ", this._tag );

        this._done = true;

        this._manager._nextQueue(this, result);
    }
}

module.exports = MacroSequence;
