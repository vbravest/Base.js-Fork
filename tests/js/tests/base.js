/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true, Base:true */
(function() {
    'use strict';

    describe('base()', function() {

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

        it('will fire `method` in the following order: child class, parent class (B, A)', function() {
            var klass = new B();
            klass.method();

            expect(order[0]).to.equal('B');
            expect(order[1]).to.equal('A');
        });

        it('will call parent constructor when `this.base()` is in a constructor method', function() {
            var called = 0;

            var A = Base.extend({
                constructor: function() {
                    called++;
                }
            });

            var B = A.extend({
                constructor: function() {
                    called++;
                    this.base();
                }
            });

            new B();

            expect(called).to.equal(2);
        });

        it('will call parent 3 levels deep', function() {
            var called = 0;

            var A = Base.extend({
                method: function() {
                    called++;
                }
            });

            var B = A.extend({
                method: function() {
                    called++;
                    this.base();
                }
            });

            var C = B.extend({
                method: function() {
                    called++;
                    this.base();
                }
            });

            var klass = new C();
            klass.method();

            expect(called).to.equal(3);
        });

    });

})();