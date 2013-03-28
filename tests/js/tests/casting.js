/*global describe:true, beforeEach:true, sinon:true, it:true, expect:true, afterEach:true */
(function() {
    'use strict';

    describe('cast()', function() {

        var KlassA;
        var KlassB;
        var Obj;
        var Obj2;

        beforeEach(function() {
            KlassA = Base.extend({
                method: function() {}
            });

            KlassB = Base.extend({
                method2: function() {}
            }, {
                staticMethod: function() {}
            });

            Obj = {
                method3: function() {}
            };

            Obj2 = {
                method4: function() {}
            };
        });

        it('will copy prototype methods into a casted plain object by calling constructor as a function', function() {
            KlassA(Obj);

            expect(Obj.method).to.be.a('function');
            expect(Obj.method3).to.be.a('function');
        });

        it('will copy prototype methods into multiple casted plain object by calling constructor as a function', function() {
            KlassA(Obj, Obj2);

            expect(Obj.method).to.be.a('function');
            expect(Obj.method3).to.be.a('function');
            expect(Obj2.method).to.be.a('function');
            expect(Obj2.method4).to.be.a('function');
        });

        it('will copy prototype methods into a casted plain object by calling the `cast()` method', function() {
            KlassA.cast(Obj);

            expect(Obj.method).to.be.a('function');
            expect(Obj.method3).to.be.a('function');
        });

        it('will copy prototype methods into multiple casted plain object by calling the `cast()` method', function() {
            KlassA.cast(Obj, Obj2);

            expect(Obj.method).to.be.a('function');
            expect(Obj.method3).to.be.a('function');
            expect(Obj2.method).to.be.a('function');
            expect(Obj2.method4).to.be.a('function');
        });

        it('will copy prototype and static methods to a casted klass when prototype is provided by calling constructor as a function', function() {
            KlassB(KlassA);

            expect(KlassA.prototype.method).to.be.a('function');
            expect(KlassA.prototype.method2).to.be.a('function');
            expect(KlassA.staticMethod).to.be.a('function');
        });

        it('will copy prototype and static methods to a casted klass when prototype is provided by calling the `cast()` method', function() {
            KlassB.cast(KlassA);

            expect(KlassA.prototype.method).to.be.a('function');
            expect(KlassA.prototype.method2).to.be.a('function');
            expect(KlassA.staticMethod).to.be.a('function');
        });

    });

})();