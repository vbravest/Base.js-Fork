/**
*   Base.js, version 1.1a
*   Copyright 2006-2010, Dean Edwards
*   License: http://www.opensource.org/licenses/mit-license.php
*
*   Modified by the Nerdery for improved performance and various bugfixes
*/

var Base = (function() {
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
     * Blank function
     *
     * @type {function}
     * @private
     */
    var _noop = function() {};

    /**
     * Prototype default values. When extending methods, if both sources have these values, do not copy them.
     *
     * @type {object}
     * @private
     */
    var _prototypeDefaults = { toSource: null, base: _noop };

    /**
     * Base class
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

        var proto = new this;
        extend.call(proto, _instance);

        // call this method from any other method to invoke that method's ancestor
        proto.base = _prototypeDefaults.base;

        _prototyping = false;

        // create the wrapper for the constructor function
        var constructor = proto.constructor;
        var klass = proto.constructor = function() {
            if (!_prototyping) {
                if (this && (this._constructing || this.constructor === klass)) { // instantiation
                    this._constructing = true;
                    constructor.apply(this, arguments);
                    this._constructing = false;
                } else if (arguments.length) { // casting
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

        // class initialisation
        if (typeof klass.init === TYPE_FUNCTION) klass.init();

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
        if (arguments.length > 1) {
            var ancestor = this[source];
            if (ancestor && (typeof value === TYPE_FUNCTION) && // overriding a method?
                // the valueOf() comparison is to avoid circular references
                (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
                /\bbase\b/.test(value)) {
                // get the underlying method
                var method = value.valueOf();
                // override
                value = function() {
                    var returnValue;
                    var previous = this.base || Base.prototype.base;
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

            // do the "toString" and other methods manually
            // if we are prototyping then include the constructor
            var i = _prototyping ? 0 : 1;
            while (key = _hiddenMethods[i++]) {
                if (source[key] !== _prototypeDefaults[key]) {
                    extend.call(this, key, source[key]);
                }
            }
            // copy each of the source object's properties to this object
            for (var key in source) {
                if (!_prototypeDefaults[key]) extend.call(this, key, source[key]);
            }
        }

        return this;
    };

    // initialise
    Base = Base.extend({

        constructor: function() {
            this.extend(arguments[0]);
        }

    }, {

        /**
         * Default base method
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
         * Iterate over all prototype properties
         *
         * @method
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
         * Extend class into current class
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
         * @returns {Base}
         */
        toString: function() {
            return this.valueOf() + '';
        }

    });

    return Base;
})();
