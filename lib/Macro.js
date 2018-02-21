
import MacroManager from './MacroManager'

export default class Macro {

    get sequenceQueue() {
        return this._manager.sequenceQueue;
    }

    get numerOfSequences() {
        return this._manager.numerOfSequences;
    }

    constructor( tag ) {
        this._manager = new MacroManager({tag:tag});
        this._manager.register("_DIRECT_COMMAND_", (command, info) => {

        });

        this._manager.register("_DELAY_COMMAND_", (command, info) => {

        });
    }

    onChange( callback ) {

        this._manager.onChange( (manager, currentSequence) => {
            callback(this);
        });
    }

    add( tag, callback ) {

        let command = this._manager.commandByName("_DIRECT_COMMAND_");
        let sequence = this._manager.add( command, (_, info) => {
            setTimeout(() => {
                callback(sequence, info, null);
            }, 0);
        });
        if (!sequence) {
            console.log( 'adding macro sequence was fail' );
            setTimeout(() => {
                let error = new Error('adding macro sequence is failed');
                callback(null, null, error);
            }, 0);
            return;
        }
        sequence.tag = tag;
    }

    delay( time ) {

        let command = this._manager.commandByName("_DELAY_COMMAND_");
        let sequence = this._manager.add( command, (_, info) => {
            setTimeout(() => {
                sequence.complete();
            }, time);
        });
        if (!sequence) {
            console.log( 'adding macro sequence was fail' );
            return;
        }
    }

    start( callback = null ) {
        this._manager.start( (error) => {
            setTimeout(() => {
                callback(error);
            }, 0);
        });
    }

    clear() {
        this._manager.clear();
    }

    cancel() {
        this._manager.cancel();
    }
}
