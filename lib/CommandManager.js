
const Command = require('./Command.js');

class CommandManager {
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
        this._handler = value;
    }

    constructor( props ) {
        this._commandMap = {};
    }

    hasCommand( command ) {
        return typeof this._commandMap[command] === 'object' ? true : false;
    }

    register( command, callback ) {
        if ( this.hasCommand(command) ) {
            return;
        }
        let commandObject = new Command({name: command, callback: callback });
        this._commandMap[command] = commandObject;
    }

    unregister( command ) {
        if (this._commandMap[command]) {
            this._commandMap[command] = null;
            delete this._commandMap[command];
        }
    }

    commandByName( command ) {
        if ( ! this.hasCommand( command ) ) {
            return null;
        }

        return this._commandMap[command];
    }

    execute( command, info ) {
        if ( ! this.hasCommand( command ) ) {
            return;
        }

        let commandObject = this.commandByName( command );
        commandObject.execute(info);
    }
}

module.exports = CommandManager;
