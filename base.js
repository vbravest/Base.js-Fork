/**
*   Base.js, version 1.1a
*   Copyright 2006-2010, Dean Edwards
*   License: http://www.opensource.org/licenses/mit-license.php
*
*   Modified by the Nerdery for improved performance and various bugfixes
*/

var Base = (function(undefined) {
    'use strict';

    /**
     * Function type
     *
     * @type {string}
     * @constant
     */
    var TYPE_FUNCTION = 'function';

    /**
     * Object type
     *
     * @type {string}
     * @constant
     */
    var TYPE_OBJECT = 'object';

    /**
     * String type
     *
     * @type {string}
     * @constant
     */
    var TYPE_STRING = 'string';

    /**
     * Flag to determine if we are currently create a clean prototype of a class
     *
     * @type {boolean}
     * @private
     */
    var _prototyping = false;

    /**
     * Method to extend manually - do not do automatically
     *
     * @type {Array}
     * @private
     */
    var _hiddenMethods = ['constructor', 'toString', 'valueOf'];

    /**
     * Lenth of hidden methods array
     *
     * @type {number}
     * @private
     */
    var _hiddenMethodsLength = _hiddenMethods.length;

    /**
     * Regex to find any calls to a parent method
     *
     * @type {RegExp}
     * @private
     */
    var _superMethodRegex = /\bbase\b/;

    /**
     * Blank function
     *
     * @type {function}
     * @private
     */
    var _blankFunction = function() {};

    /**
     * Prototype default values. When extending methods, if both sources have these values, do not copy them.
     *
     * @type {object}
     * @private
     */
    var _prototypeDefaults = { toSource: null, base: _blankFunction };

    /**
     * Base class
     *
     * A library to create a more traditional OOP interface for developers to work with
     *
     * @name Base
     * @constructor
     */
    var Base = function() {};

    /**
     * Subclass a class
     *
     * @method
     * @param {object} [_instance] Instance members/methods
     * @param {object} [_static] Static members/methods
     * @returns {function}
     */
    Base.extend = function(_instance, _static) { // subclass
        var extend = Base.prototype.extend;

        // build the prototype
        _prototyping = true;

        var proto = new this();
        extend.call(proto, _instance);

        // call this method from any other method to invoke that method's ancestor
        proto.base = _prototypeDefaults.base;

        _prototyping = false;

        // create the wrapper for the constructor function
        var constructor = proto.constructor;
        var klass = proto.constructor = function() {
            if (!_prototyping) {
                // instantiation
                if (this && (this._constructing || this.constructor === klass)) {
                    this._constructing = true;
                    constructor.apply(this, arguments);
                    this._constructing = false;

                // casting
                } else if (arguments.length) {
                    Base.cast.apply(klass, arguments);
                }
            }
        };
        // build the class interface
        extend.call(klass, this);
        klass.ancestor = this;
        klass.prototype = proto;
        klass.valueOf = function(type) {
            return (type === TYPE_OBJECT) ? klass : constructor.valueOf();
        };
        extend.call(klass, _static);

        // if static init method exists, call it
        if (typeof klass.init === TYPE_FUNCTION) {
            klass.init();
        }

        return klass;
    };

    /**
     * @name Base#extend
     *
     * @method
     * @param {string|object} source
     * @param {function} [value]
     * @returns {Base}
     */
    Base.prototype.extend = function(source, value) {
        // extending with a name/value pair
        if (typeof source === TYPE_STRING && arguments.length > 1) {
            var ancestor = this[source];
            if (
                ancestor &&
                // overriding a method?
                (typeof value === TYPE_FUNCTION) &&
                // the valueOf() comparison is to avoid circular references
                (!ancestor.valueOf || ancestor.valueOf() !== value.valueOf()) &&
                _superMethodRegex.test(value)
            ) {
                // get the underlying method
                var method = value.valueOf();

                // override
                value = function() {
                    var returnValue;
                    var previous = this.base || _prototypeDefaults.base;
                    this.base = ancestor;
                    if (arguments.length === 0) {
                        returnValue = method.call(this);
                    } else {
                        returnValue = method.apply(this, arguments);
                    }
                    this.base = previous;
                    return returnValue;
                };

                // point to the underlying method
                value.valueOf = function(type) {
                    return (type === TYPE_OBJECT) ? value : method;
                };
                value.toString = Base.toString;
            }
            this[source] = value;

        // extending with an object literal
        } else if (source) {
            var extend = Base.prototype.extend;

            // if this object has a customised extend method then use it
            if (!_prototyping && typeof this !== TYPE_FUNCTION) {
                extend = this.extend || extend;
            }

            // do hidden methods separately
            // if we are prototyping then include the constructor
            var i = _prototyping ? 0 : 1;
            var key;
            for (; i < _hiddenMethodsLength; i++) {
                key = _hiddenMethods[i];
                if (source[key] !== _prototypeDefaults[key]) {
                    extend.call(this, key, source[key]);
                }
            }

            // copy each of the source object's properties to this object
            for (key in source) {
                if (!_prototypeDefaults[key]) {
                    extend.call(this, key, source[key]);
                }
            }
        }

        return this;
    };

    // initialise
    Base = Base.extend({

        /**
         * Constructor when `new Base()` is called. It is preferred to use Base.extend over `new Base()`
         *
         * @param {object} [_instance] Instance members/methods
         * @param {object} [_static] Static members/methods
         * @returns {Base}
         */
        constructor: function(_instance, _static) {
            return this.extend(_instance, _static);
        }

    }, {

        /**
         * Default static base method
         *
         * @method
         */
        base: _prototypeDefaults.base,

        /**
         * Parent object/class
         *
         * @name Base.ancestor
         * @type {object}
         */
        ancestor: Object,

        /**
         * Base.js version
         *
         * @name Base.version
         * @type {string}
         */
        version: '1.1',

        /**
         * Iterate over all prototype properties with a function.
         * Only keys found in object will be iterrated over,
         * and only if the property does not exists in the current classes prototype.
         *
         * @method
         * @name Base.forEach
         * @param {object} object
         * @param {function} iterator
         * @param {*} context
         * @returns {Base}
         */
        forEach: function(object, iterator, context) {
            for (var key in object) {
                if (this.prototype[key] === undefined) {
                    iterator.call(context, object[key], key, object);
                }
            }

            return this;
        },

        /**
         * Extend current class into another object or class
         * If an object with no prototype is passed, only prototype methods will be cast.
         * If an a class (with constructor) is passed, both static and prototype methods will be cast.
         *
         * @method
         * @name Base.cast
         * @returns {Base}
         */
        cast: function() {
            var i = 0;
            var length = arguments.length;
            var extend;
            var caster;

            for (; i < length; i++) {
                caster = arguments[i];
                extend = caster.extend || Base.prototype.extend;

                // cast prototype and static methods
                if (typeof caster === TYPE_FUNCTION) {
                    extend = caster.prototype.extend || Base.prototype.extend;
                    extend.call(caster.prototype, this.prototype);
                    extend.call(caster, this);
                    caster.ancestor = this;

                // cast only prototype methods
                } else {
                    extend.call(caster, this.prototype);
                }
            }

            return this;
        },

        /**
         * Implement a class into the current class
         *
         * @method
         * @name Base.implement
         * @returns {Base}
         */
        implement: function() {
            for (var i = 0; i < arguments.length; i++) {
                this.cast.call(arguments[i], this);
            }

            return this;
        },

        /**
         * Get string value of class
         *
         * @method
         * @name Base.toString
         * @returns {string}
         */
        toString: function() {
            return this.valueOf() + '';
        }

    });

    return Base;
})();
