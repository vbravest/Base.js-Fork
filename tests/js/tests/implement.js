/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true */
(function() {
    'use strict';

    describe('implement()', function() {

        var spy1 = sinon.spy();
        var spy2 = sinon.spy();
        var order = [];
        var called = 0;

        beforeEach(function() {
            spy1.reset();
            spy2.reset();
            order.length = 0;
            called = 0;
        });

        var A = Base.extend({
            method: function(a) {
                order.push('A');
                spy1.apply(window, arguments);
                this.base(a);
            }
        }, {
            staticMethod: function() {
                order.push('A');
                called++;
                this.base();
            },
            staticMethodOfA: function() {}
        });

        var B = Base.extend({
            method: function() {
                order.push('B');
                spy2.apply(window, arguments);
            }
        }, {
            staticMethod: function() {
                order.push('B');
                called++;
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

        it('will fire `method` in the following order: implemented class, class implemented into (A, B)', function() {
            var klass = new B();
            klass.method(55);

            expect(order[0]).to.equal('A');
            expect(order[1]).to.equal('B');
        });

        it('will fire `staticMethod` in the following order: implemented class, class implemented into (A, B)', function() {
            B.staticMethod();

            expect(order[0]).to.equal('A');
            expect(order[1]).to.equal('B');
        });

        it('will implment static classes from the implemented class', function() {
            expect(B.staticMethodOfA).to.be.a('function');
        });

    });

})();