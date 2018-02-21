## Information

<table>
<tr>
<td>Package</td><td>macrojs</td>
</tr>
<tr>
<td>Description</td>
<td>Macro Command Pattern Module for nodejs</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

## Usage

```javascript

import Macro from 'node-macro'

let macro = new Macro("TAG_NAME");

macro.add("Action-Basic", (command, info, error) => {
    command.complete();
});

macro.add("Action-DelayCompletion", (command, info, error) => {
    setTimeout(() => {
        command.complete();
    }, 500);
});

macro.delay(750);

macro.add("Action-Retry", (command, info, error) => {

    setTimeout(() => {
        if (command.executeCount < 3) {
            command.retry();
        }
        else {
            command.complete();
        }
    }, 500);
});

macro.add("Action-Error", (command, info, error) => {
    let customError = new Error("error test");
    command.error(customError);
});

macro.start((error) => {
    console.log( "finish", error );
});

```

## Examples

You can view further examples in the [example folder.](https://github.com/progdesigner/macro-js/tree/master/examples)

## LICENSE

(MIT License)

Copyright (c) 2018 ProgDesigner <me@progdesigner.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
