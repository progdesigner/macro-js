var Macro = require('../');

let macro = new Macro("BASIC-TEST", {skipError:true, debug: true});
let data = [];
let reseted = false;

macro.onChange((macro) => {
    renderData();
});

function renderData() {
    //console.clear();

    data.forEach( (sequence) => {
        let status = 'Unknown';
        if (sequence.hasError) {
            status = 'Error';
        }
        else if (sequence.isDone) {
            status = 'Done';
        }
        else if (sequence.isRunning) {
            status = 'Running' + ' (' + sequence.executeCount + ')';
        }
        else {
            status = 'Ready';
        }
        // console.log( sequence.tag, status );
    });
}

function reset( autoStart ) {

    // console.log( "reset", autoStart );

    macro.add("Action #1 - Basic", (command, info, error) => {
        data.push( command );
        renderData();
        command.complete();
    });

    macro.add("Action #2 - DelayCompletion", (command, info, error) => {
        data.push( command );
        renderData();

        setTimeout(() => {
            command.complete();
        }, 500);
    });

    macro.delay(750);

    macro.add("Action #3 - After Delay", (command, info, error) => {
        data.push( command );
        command.complete();
    });

    macro.add("Action #4 - Retry", (command, info, error) => {
        if (command.executeCount === 1) {
            data.push( command );
            renderData();
        }

        setTimeout(() => {
            if (command.executeCount < 3) {
                command.retry();
            }
            else {
                command.complete();
            }
        }, 500);
    });

    macro.add("Action #5 - Reset", (command, info, error) => {
        data.push( command );
        renderData();

        if (reseted === false) {
            reseted = true;
            reset(true);
        }

        command.complete();
    });

    macro.add("Action #6 - Error", (command, info, error) => {
        data.push( command );
        renderData();

        let customError = new Error("error test");
        command.error(customError);
        renderData();

        command.complete();
    });

    if (autoStart === true) {
        macro.start((error) => {

        });
    }
}

reset(true);
