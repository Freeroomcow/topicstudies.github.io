(function () {
    var d = document;
    var c = {
        COCOS2D_DEBUG: 0, //0: debug off, 1: basic debug, 2: full debug
        box2d: true,
        showFPS: false,
        frameRate: 60,
        tag: 'viewport',
        SingleEnginFile: '//www.funhtml5games.com/angrybirds/cocos2d/cocos2dx.min.js',
        /* engineDir:'cocos2d/', */
        appFiles: ['game.js']
    };
    window.addEventListener('DOMContentLoaded', function () {
        var s = d.createElement('script');
        s.src = c.SingleEnginFile;
        //s.src = c.engineDir + 'platform/jsloader.js';
        d.body.appendChild(s);
        s.c = c;
        s.id = 'cocos2d-html5';
    });
})();