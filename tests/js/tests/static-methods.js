/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true */
(function() {
    'use strict';

    describe('static methods', function() {

        var called = 0;

        beforeEach(function() {
            called = 0;
        });

        var A = Base.extend({}, {
            staticMethod: function() {
                called++;
            }
        });

        var B = A.extend({}, {
            staticMethod2: function() {}
        });

        var C = B.extend({}, {
            staticMethod3: function() {}
        });

        var staticMethod = function() {
            called++;
            this.base();
        };

        var D = C.extend({}, {
            staticMethod: staticMethod
        });

        it('will override parent static methods', function() {
            expect(D.staticMethod.toString()).to.equal(staticMethod.toString());
        });

        it('will add static methods to the constructor', function() {
            expect(A.staticMethod).to.be.a('function');
        });

        it('will add extend static methods to child classes', function() {
            expect(B.staticMethod).to.be.a('function');
            expect(B.staticMethod2).to.be.a('function');
            expect(C.staticMethod).to.be.a('function');
            expect(C.staticMethod2).to.be.a('function');
            expect(C.staticMethod3).to.be.a('function');
        });

        it('will call the parent static method when `this.base()` is called in a child static method', function() {
            D.staticMethod();
            expect(called).to.equal(2);
        });

    });

})();