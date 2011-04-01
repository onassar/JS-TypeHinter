/**
 * TypeHinter. A singleton class/object that allows for argument enforcement
 *     (aka. type hinting).
 * 
 * @author Oliver Nassar <onassar@gmail.com>
 * @version 1.0
 * @todo return boolean from `check` method incase `__strict` is set to `false`
 * @todo add ability to pass function to `check`, which gets run when an error
 *     occurs
 * @todo add ability to define json-object signatures (eg. {name: String})
 * @todo add `relax` property/setters
 * @todo add normalizer method?
 * @todo add method for passing in custom-class instance names for better error
 *     messages
 * @public
 * @var Object
 */
var TypeHinter = (function() {

    /**
     * __active. Whether or not enforcement is active; useful for disabling
     *     in production-environments.
     *
     * @private
     * @var Boolean
     */
    var __active = true;

    /**
     * __callee. String referencing to the method that is having it's arguments
     *     checked/enforced.
     *
     * @private
     * @var String
     */
    var __callee;

    /**
     * __filename. String referencing the filename/path whose function/method is
     *     having it's arguments checked/enforced.
     *
     * @private
     * @var String
     */
    var __filename;

    /**
     * __natives. A hash used for mapping primitive/native data types.
     *
     * @note null-case for `htmlImageElement` and `htmlOptionElement` objects
     *     provided to allow for server-side (nodejs) usage of class
     * @see http://www.learn-javascript-tutorial.com/QuickRecap.cfm
     * @see http://www.howtocreate.co.uk/tutorials/javascript/variables
     * @private
     * @var Object
     */
    var __natives = {
        'object': Object,
        'function': Function,
        'string': String,
        'number': Number,
        'boolean': Boolean,
        'null': null,
        'undefined': undefined,
        'date': Date,
        'array': Array,
        'regexp': RegExp,
        'error': Error,
        'typeError': TypeError,
        'htmlImageElement': typeof HTMLImageElement === 'undefined' ? null : HTMLImageElement,
        'htmlOptionElement': typeof HTMLOptionElement === 'undefined' ? null : HTMLOptionElement
    };

    /**
     * __strict. Boolean keeping track of whether-or-not to error-out upon an
     *     argument-type-violation.
     *
     * @private
     * @var Boolean
     */
    var __strict = true;

    /**
     * __error. Outputs or throws an error.
     * 
     * @private
     * @param String msg message to either throw or output to the console
     * @return void
     */
    function __error(msg) {
        msg = '[' + __filename + '::' + __callee + ']\n' + msg + '\n';
        if (__strict === true) {
            throw msg;
        } else {
            console.log(msg);
        }
    }

    /**
     * __getType. Returns a string representing the passed in argument's type.
     *     If argument is an instance of custom-class, object will *not* be
     *     returned; rather the string '(custom-class instance)'.
     * 
     * @note helper for error-message-handling
     * @private
     * @param mixed arg 'object' whose type should be determined
     * @return String passed in objects type-string
     */
    function __getType(arg) {

        // if undefined of null (can't perform constructor checks ont hem)
        if (arg === null) {
            return 'null';
        } else if (arg === undefined) {
            return 'undefined';
        }

        // loop over possible types in hash set privately above
        var type;
        for (var key in __natives) {
            type = __natives[key];

            /**
             * if the type being checked against is null or undefined, continue
             *     with the loop, as their constructors can't be checked.
             */
            if (
                type === null
                || type === undefined
            ) {
                continue;
            }

            // argument constructor is equal to the object-literal reference
            if (arg.constructor === type) {
                return key;
            }
        }

        /**
         * assume custom class (since checked against all [?] possible object
         *     types)
         */
        return '(custom-class instance)';
    }

    /**
     * __getTypes. Returns an array of types for a passed in array of objects.
     * 
     * @note helper for error-message-handling
     * @private
     * @param Array arg array of objects who's types should be returned in the
     *     same order
     * @return Array array of strings, representing the passed in arguments
     *     object-types
     */
    function __getTypes(args) {

        /**
         * set reference for array argument, object type and response-array;
         *     iterator presets
         */
        var obj, type, types = [], x = 0, l = args.length;

        /**
         * note that an iterative loop must be used here, rather than a for/var
         *     loop, since unlike in nodejs, the array's method are iterated
         *     over with the for/var variety
         */
        for (x; x < l; ++x) {
            obj = args[x];

            /**
             * if object is null or undefined, store string values as cannot
             *     create new object-instances for `__getType` method
             */
            if (obj === null) {
                type = 'null';
            } else if (obj === undefined) {
                type = 'undefined';
            }
            /**
             * object isn't null or undefined; get type by creating a new
             *     instance of it; grab type
             */
            else {
                type = __getType(new obj);
            }
            types.push(type);
        }
        return types;
    }

    // return singelton 
    return {

        /**
         * benchmark. Stores references to the filename and callee being
         *     checked. Must be called before a call to `check`, otherwise
         *     an error will be thrown.
         * 
         * @public
         * @param String filename name of the file currently performing the check
         * @param String callee name of the method (or some other identifier)
         *     performing the check; used for error logging
         * @return void
         */
        benchmark: function(filename, callee) {
            __filename = filename;
            __callee = callee;
        },

        /**
         * check. Performs the check on an array of arguments passed in.
         * 
         * @public
         * @return void
         */
        check: function() {

            // if filename and callee havn't been specified to benchmark against
            if (
                __filename === undefined
                || __callee === undefined
            ) {
                __error(
                    'TypeHinter::benchmark must be called before any checks.'
                );
            } else {

                // if checks are turned on
                if (__active === true) {
    
                    // local references
                    var args = arguments,
                        arg, obj, type, types, valid,
                        x = 0, y, l = args.length;

                    for (x; x < l; ++x) {
                        arg = args[x];
                        param = arg[0];
                        types = arg.slice(1);
                        valid = false;
                        y = 0;

                        /**
                         * if no types supplied (eg. must be defined, but not
                         *     restricted to object-type)
                         */
                        if (types.length === 0) {
                            if (param === undefined) {

                                // error out since not supplied at-all
                                __error(
                                    'Invalid argument passed. Argument *' +
                                    (x + 1) + '* was not supplied; required'
                                );
                            }
                        }

                        /**
                         * loop through the possible acceptable types for the
                         *     argument; iterative loop must be used here,
                         *     rather than a for/var loop, since unlike in
                         *     nodejs, the array's method are iterated over with
                         *     the for/var variety
                         */
                        for (y; y < types.length; ++y) {

                            /**
                             * the parameter being checked is undefined or null,
                             *     check against the acceptable types manually
                             *     since the constructor for the parameter
                             *     wouldn't be accessible
                             */
                            if (
                                param === undefined
                                || param === null
                            ) {
                                if (param === types[y]) {
                                    valid = true;
                                    break;
                                }
                            } else if (param.constructor === types[y]) {
                                valid = true;
                                break;
                            }
                        }

                        // if a valid type wasn't found
                        if (valid === false) {

                            // error out since no type in acceptable range was found
                            __error(
                                'Invalid argument type. Argument *' +
                                (x + 1) + '* is of type: _' + __getType(param) + '_\n' +
                                'Should be of type: _' + __getTypes(types).join('_, _') + '_'
                            );
                        }
                    }
                }
            }
        },

        /**
         * off. Switch the checking off (useful for production environments)
         * 
         * @public
         * @return void
         */
        off: function() {
            __active = false;
        },

        /**
         * on. Switch the checking on (useful for development environments)
         * 
         * @public
         * @return void
         */
        on: function() {
            __active = true;
        },

        /**
         * strict. Switches the strict flag either on or off, which controls
         *     whether or not an error is throw versus logged. Useful for
         *     production versus development environments.
         * 
         * @public
         * @param Booean on whether or not strict enforcement should should be
         *     applied
         * @return void
         */
        strict: function(on) {
            __strict = (on === true);
        }
    };
})();

// nodejs check/extension
if (typeof exports !== 'undefined') {
    exports.TypeHinter = TypeHinter;
}

