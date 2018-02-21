
const __DEBUG__ = 1;

export default class MacroSequence {
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
        reutrn this._currentError;
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

    constructor( props ) {
        this._command = typeof props.command === 'object' ? props.command : {/* GhostCommand */ execute: () => {} };
        this._manager = typeof props.manager === 'object' ? props.manager : {/* GhostManager */  _errorQueue: () => {}, _nextQueue: () => {}, queueID: '' };
        this._queueID = this._manager.queueID;
        this._currentError = null;
        this._currentInfo = null;
        this._executeCount = 0;
        this._running = false;
        this._expired = false;
        this._done = false;
    }

    retry() {
        setTimeout(() => {
            this.execute(this._currentInfo);
        }, 100);
    }

    error( error ) {
        if ( this._expired === true ) {
            console.log( "this queue was already expired. ignore error" );
            return;
        }

        this._currentError = error;
        this._running = false;
        this._expired = true;

        if (_manager.queueID !== this._queueID) {
            console.log( 'this queue was already expired' );
            return;
        }

        if (__DEBUG__) {
            console.log( "MacroSequence - error : ", this._tag, error );
        }

        this._manager._errorQueue(this);
    }

    complete() {
        if (this._expired === true) {
            console.log('this queue was already expired. ignore error');
            return;
        }

        if (this._running === false) {
            console.log('this queue isn\'t running');
            return;
        }

        this._expired = true;
        this._running = false;

        if (this._manager.queueID !== this._queueID) {
            console.log( 'this queue was already expired' );
            return;
        }

        if (__DEBUG__) {
            console.log( "MacroSequence - complete : ", this._tag );
        }

        this._done = true;

        this._manager._nextQueue(this);
    }
}
