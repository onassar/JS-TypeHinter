Type hinting for JavaScript
===

JS class that provides PHP-inspired type hinting in functions & methods. Works in both client and server side environments.

Basically, before you do anything in a function or method, you make a call to the Enforcer, set up some benchmarking info (so you know what file/function/method crashed), and then make a call to check the function.

In this call, you pass along your arguments, and what type of objects they can be.

### Examples
MooTools event example:

    $('login').addEvent(
        'click',
        function (event) {

            // type hinting/enforcement
            Enforcer.benchmark('file.js', 'function::anon');
            Enforcer.check(
                [event, Event]
            );

            // function logic
            event.stop();
            // ...
        }
    );

