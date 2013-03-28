/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true */
(function() {
    'use strict';

    describe('this.base()', function() {

        var spy1 = sinon.spy();
        var spy2 = sinon.spy();
        var order = [];

        beforeEach(function() {
            spy1.reset();
            spy2.reset();
            order.length = 0;
        });

        var A = Base.extend({
            method: function() {
                order.push('A');
                spy1.apply(window, arguments);
            }
        });

        var B = A.extend({
            method: function(a) {
                order.push('B');
                spy2.apply(window, arguments);
                this.base(a);
            }
        });

        var C = Base.extend({
            method: function() {
                this.base();
            }
        });

        it('will silently error if this.base() is called when there is no parent method.', function() {
            var klass = new C();
            klass.method();
        });

        it('will call parent method when `this.base()` is called.', function() {
            var klass = new B();
            klass.method();

            expect(spy1.callCount).to.equal(1);
            expect(spy2.callCount).to.equal(1);
        });

        it('will pass arguments to parent method when `this.base(55)` is called.', function() {
            var klass = new B();
            klass.method(55);

            expect(spy1.callCount).to.equal(1);
            expect(spy1.calledWith(55)).to.equal(true);
            expect(spy2.callCount).to.equal(1);
            expect(spy2.calledWith(55)).to.equal(true);
        });

        it('will fire in the following order: child class, parent class (B, A)', function() {
            var klass = new B();
            klass.method();

            expect(order[0]).to.equal('B');
            expect(order[1]).to.equal('A');
        });

    });

    describe('implement()', function() {

        var spy1 = sinon.spy();
        var spy2 = sinon.spy();
        var order = [];

        beforeEach(function() {
            spy1.reset();
            spy2.reset();
            order.length = 0;
        });

        var A = Base.extend({
            method: function(a) {
                order.push('A');
                spy1.apply(window, arguments);
                this.base(a);
            }
        });

        var B = Base.extend({
            method: function() {
                order.push('B');
                spy2.apply(window, arguments);
            }
        }).implement(A);

        it('will call parent method when a method is called.', function() {
            var klass = new B();
            klass.method();

            expect(spy1.callCount).to.equal(1);
            expect(spy2.callCount).to.equal(1);
        });

        it('will pass arguments to parent method when `this.base(55)` is called.', function() {
            var klass = new B();
            klass.method(55);

            expect(spy1.callCount).to.equal(1);
            expect(spy1.calledWith(55)).to.equal(true);
            expect(spy2.callCount).to.equal(1);
            expect(spy2.calledWith(55)).to.equal(true);
        });

        it('will fire in the following order: implemented class, class implemented into (A, B)', function() {
            var klass = new B();
            klass.method(55);

            expect(order[0]).to.equal('A');
            expect(order[1]).to.equal('B');
        });

    });

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
            expect(C.staticMethod).to.be.a('function');
        });

        it('will call the parent static method when `this.base()` is called in a child static method', function() {
            D.staticMethod();
            expect(called).to.equal(2);
        });

    });

    describe('init()', function() {

        var spy1 = sinon.spy();

        beforeEach(function() {
            spy1.reset();
        });

        it('will call `init()` if a static init method is defined during the prototyping.', function() {

            Base.extend({

            }, {
                init: function(a) {
                    spy1.apply(window, arguments);
                }
            });

            expect(spy1.callCount).to.equal(1);
        });
    });

})();