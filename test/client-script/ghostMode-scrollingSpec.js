describe("Ghost Mode: Scrolling", function () {

    var ghost;
    var scope;
    var spy;
    var browserSync;

    before(function () {
        scope = {
            ghostMode: {
                enabled: true
            }
        };
        ghost = window.ghost;
        browserSync = window.bs;

        spy = sinon.spy(ghost, "emitEvent");
    });
    before(function(){

        document.body.style.cssText = "height:2000px;";
        window.scrollTo(0, 0); //reset scroll position after each test.
    });

    afterEach(function () {
        spy.reset();
        window[ghost.utils.removeEventListener](ghost.utils.prefix + "scroll", ghost.listeners.scroll);
    });

    after(function () {
        spy.restore();
    });

    it("can Set the scroll position of a window", function () {

        ghost.setScrollTop(scope.ghostMode, 100);
        assert.equal(ghost.getScrollTop(), 100);
    });

    it("can disable ghost mode when setting it's own scroll top. (ie, when it's received an event from server)", function () {
        ghost.setScrollTop(scope.ghostMode, 100);
        assert.equal(scope.ghostMode.enabled, false);
    });

    it("can emit an event to the server when the window is scrolled (1)", function (done) {

        var space = ghost.getScrollSpace()[1];

        window.setTimeout(function () {

            window.scrollTo(0, space/2); // 50%
            ghost.listeners.scroll();

        }, 100);

        window.setTimeout(function () {

            var actual = spy.calledWith("scroll", {
                pos: 0.5,
                url: window.location.host + window.location.pathname
            });

            assert.equal(actual, true);
            done();
        }, 200);
    });

    it("should emit multiple scroll events when they happen outside of the threshold", function (done) {

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 200);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 300);

        window.setTimeout(function () {
            assert.equal(spy.callCount, 3);
            done();
        }, 1000);
    });

    it("should not emit the event if scroll events happen too fast", function (done) {

        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 55); // second scroll too fast

        window.setTimeout(function () {
            assert.equal(spy.callCount, 1);
            done();
        }, 200);
    });

    it("SHOULD emit another event after a previous one was denied", function (done) {
        window.setTimeout(function () {
            window.scrollTo(0, 200);
            ghost.listeners.scroll();
        }, 50);

        window.setTimeout(function () {
            window.scrollTo(0, 300);
            ghost.listeners.scroll();
        }, 55); // second scroll too fast

        window.setTimeout(function () {
            window.scrollTo(0, 250);
            ghost.listeners.scroll();
        }, 200); // Third scroll not too fast!

        window.setTimeout(function () {
            assert.equal(spy.callCount, 2);
            done();
        }, 300);
    });
});