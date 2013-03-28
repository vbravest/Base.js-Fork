/**
*   Base.js, version 1.1a
*   Copyright 2006-2010, Dean Edwards
*   License: http://www.opensource.org/licenses/mit-license.php
*
*   Modified by the Nerdery for improved performance and various bugfixes
*/

var Base = function() {
    // dummy
};

Base.extend = function(_instance, _static) { // subclass
    var extend = Base.prototype.extend;

    // build the prototype
    Base._prototyping = true;

    var proto = new this;
    extend.call(proto, _instance);

    // call this method from any other method to invoke that method's ancestor
    proto.base = function() {};

    Base._prototyping = false;
    
    // create the wrapper for the constructor function
    var constructor = proto.constructor;
    var klass = proto.constructor = function() {
        if (!Base._prototyping) {
            if (this._constructing || this.constructor == klass) { // instantiation
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
    klass.base = function() {};
    klass.ancestor = this;
    klass.prototype = proto;
    klass.valueOf = function(type) {
        return (type == "object") ? klass : constructor.valueOf();
    };
    extend.call(klass, _static);

    // class initialisation
    if (typeof klass.init == "function") klass.init();

    return klass;
};

Base.prototype = {	
    extend: function(source, value) {
        // extending with a name/value pair
        if (arguments.length > 1) {
            var ancestor = this[source];
            if (ancestor && (typeof value == "function") && // overriding a method?
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
                    return (type == "object") ? value : method;
                };
                value.toString = Base.toString;
            }
             this[source] = value;

        // extending with an object literal
        } else if (source) {
            var extend = Base.prototype.extend;
            // if this object has a customised extend method then use it
            if (!Base._prototyping && typeof this != "function") {
                extend = this.extend || extend;
            }
            var proto = {toSource: null, base: Base.prototype.base};
            // do the "toString" and other methods manually
            var hidden = ["constructor", "toString", "valueOf"];
            // if we are prototyping then include the constructor
            var i = Base._prototyping ? 0 : 1;
            while (key = hidden[i++]) {
                if (source[key] != proto[key]) {
                    extend.call(this, key, source[key]);
                }
            }
            // copy each of the source object's properties to this object
            for (var key in source) {
                if (!proto[key]) extend.call(this, key, source[key]);
            }
        }
        return this;
    }
};

// initialise
Base = Base.extend({
    constructor: function() {
        this.extend(arguments[0]);
    }
}, {
    ancestor: Object,

    version: "1.1",
    
    forEach: function(object, block, context) {
        for (var key in object) {
            if (this.prototype[key] === undefined) {
                block.call(context, object[key], key, object);
            }
        }

        return this;
    },

    cast: function() {
        var i = 0;
        var length = arguments.length;
        var extend;
        var caster;

        for (; i < length; i++) {
            caster = arguments[i];
            extend = caster.extend || Base.prototype.extend;

            // cast prototype and static methods
            if (typeof caster == "function") {
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
        
    implement: function() {
        for (var i = 0; i < arguments.length; i++) {
            this.cast.call(arguments[i], this);
        }

        return this;
    },
    
    toString: function() {
        return this.valueOf() + '';
    }
});
