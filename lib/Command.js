
class Command {
    get name() {
        return this._name;
    }

    set name( value ) {
        this._name = value;
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
        this._name = typeof props.name === 'string' ? props.name : '';
        this._handler = typeof props.callback === 'function' ? props.callback : () => {};
    }

    execute( info ) {
        this._handler(this, info);
    }
}

module.exports = Command;
