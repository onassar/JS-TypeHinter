JS-TypeHinter
===
TypeHinter is a statically accessible class which provides PHP-inspired type
hinting to functions &amp; methods. Type hinting in PHP is infact a form of
programmatic validation, so the expect result from the development of this kind
of class is to in fact introduce errors when arguments do not match their
defined signature.

Basically, before you do anything in a function or method, you make a call to
the TypeHinter, set up some benchmarking info (so you know what
file/function/method crashed), and then make a call to check the function.

In this call, you pass along your arguments, and what type of objects they can be.

### MooTools Example

``` javascript


// some node
$('node').addEvent('click', function(event) {

    // benchmark what file/method is performing the check
    TypeHinter.benchmark('prepare.js', '(anonymous-1)');

    /**
     * Ensure that the <event> object passed is an instance of the
     * <Event> class
     */
    TypeHinter.check(
        [event, Event]
    );
    
    // further logic, assuming successful TypeHinter checks
});

```

The above example showcases a typical example, and while being done on the
client side, it just as easily ports over to Node as well. The hook to export
the script is already included in the class definition (look at the end of the
file).

In the example above, if the argument passed in was a different type, or not
passed at all (eg. another method runs $('node').fireEvent('click')), the
TypeHinter would throw an error, with details on which file/method is at the
cause of it.
