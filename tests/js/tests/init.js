/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true */
(function() {
    'use strict';

    describe('init()', function() {

        var spy1 = sinon.spy();

        beforeEach(function() {
            spy1.reset();
        });

        it('will call `init()` if a static init method is defined during the prototyping.', function() {
            Base.extend({}, {
                init: function() {
                    spy1();
                }
            });

            expect(spy1.callCount).to.equal(1);
        });

        it('will call `init()` if a static init method is defined during the prototyping in the parent.', function() {
            var A = Base.extend({}, {
                init: function() {
                    spy1();
                }
            });

            var B = A.extend({
                method: function() {}
            });

            expect(spy1.callCount).to.equal(2);
        });

        it('will call `init()` if a static init method is defined during the prototyping and call parent with `this.base()`.', function() {
            var A = Base.extend({}, {
                init: function() {
                    spy1();
                }
            });

            var B = A.extend({
                method: function() {}
            }, {
                init: function() {
                    spy1();
                    this.base();
                }
            });

            expect(spy1.callCount).to.equal(3);
        });
    });

})();