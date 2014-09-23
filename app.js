window.onload = app;

function app() {
    rAFPolyfill();
    window.vendorPrefix = getVendorPrefix();
    var compass = new Compass(18, document.querySelector('.compass'));
}

function debounce(func, wait) {
    var timeout, result;
    return function() {
        var context = this,
            args = arguments;

        var later = function() {
            timeout = null;
            func.apply(context, args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

//requestAnimationFrame polyfill
function rAFPolyfill() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    window.RAF = window.requestAnimationFrame;
    window.CAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;

    if (window.RAF && window.CAF) return;

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.RAF = window[vendors[x] + 'RequestAnimationFrame'];
        window.CAF = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.RAF)
        window.RAF = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() {
                    callback(currTime + timeToCall);
                },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.CAF)
        window.CAF = function(id) {
            clearTimeout(id);
        };
}

/**
 * gets vendor prefixed names for style properties (i.e. '-webkit-' or '-moz-')
 * @return {[type]} [description]
 */

function getVendorPrefix() {
    var styles = window.getComputedStyle(document.documentElement, ''),
        pre = (Array.prototype.slice
            .call(styles)
            .join('')
            .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1],
        dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
    return {
        dom: dom,
        lowercase: pre,
        css: '-' + pre + '-',
        js: pre[0].toUpperCase() + pre.substr(1)
    };
}

function Compass(num, compassElement) {
    this.rotation = 0;
    this.orbiters = this.addOrbiters(num, compassElement);
    this.compassElement = compassElement;
    this.rotate();
    this.handleInteractionEvents();
}

Compass.prototype.rotate = function(delta) {
    var self = this;
    RAF(function() {
        for (var i = 0, len = self.orbiters.length; i < len; i++) {
            self.orbiters[i].setTransform(i, self.compassElement.offsetWidth, delta || 0, ~~(360 / self.orbiters.length));
        }
    })
}

Compass.prototype.addOrbiters = function(num, compass) {
    var i = num,
        orbiters = [];

    while (typeof i === "number" && i--) {
        orbiters.push(new Orbiter(compass, i));
    }

    return orbiters;
}

Compass.prototype.handleInteractionEvents = function() {
    var self = this;

    $.on('resize orientationchange', function() {
        self.rotate(self.rotation);
    }, window);

    $.on('mousewheel DOMMouseScroll', function(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        self.rotation = (self.rotation + Math.min(5, Math.max(-5, e.wheelDelta || e.detail))) % 360;
        if (self.rotation < 0) self.rotation = 360 + self.rotation;

        requestAnimationFrame(function() {
            self.rotate(self.rotation);
        });
    }, this.compassElement.parentElement);

    function onTouchAndMouseStart(e) {
        e.stopImmediatePropagation();
        e.preventDefault();

        $.on('mousemove touchmove', handleDrag, window);

        var pX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
            pY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
            x = pX - document.body.offsetWidth / 2,
            y = -1 * (pY - document.body.offsetHeight / 2),
            theta = Math.atan2(y, x) * (180 / Math.PI),
            cssDegs = 90 - theta;
        self.draggedDegreesStart = cssDegs;
    }

    function onTouchAndMouseEnd(e) {
        e.stopImmediatePropagation();
        e.preventDefault();

        $.off('mousemove touchmove', handleDrag, window);

        self.draggedDegrees = self.draggedDegrees2 = 0;
    }

    function handleDrag(e) {
        var pX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
            pY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
            x = pX - document.body.offsetWidth / 2,
            y = -1 * (pY - document.body.offsetHeight / 2),
            theta = Math.atan2(y, x) * (180 / Math.PI),
            cssDegs = 90 - theta;

        self.draggedDegrees2 = self.draggedDegrees || self.draggedDegreesStart;
        self.draggedDegrees = cssDegs;

        self.rotation = (self.rotation + self.draggedDegrees - self.draggedDegrees2) % 360;
        if (self.rotation < 0) self.rotation = 360 + self.rotation;

        self.rotate(self.rotation);
    }

    $.on('mousedown touchstart', onTouchAndMouseStart, this.compassElement);
    $.on('mouseup touchend', onTouchAndMouseEnd, document.body);
}

/**
 * Orbiter class, represents each item
 *
 *
 * @param {[type]} compass [description]
 * @param {[type]} index   [description]
 */

function Orbiter(compass, index) {
    var img = document.createElement('img');
    img.className = "orbiter";
    img.src = "./images/screen" + (index % 4 + 1) + ".png";
    this.img = img;
    compass.appendChild(img);
}

Orbiter.prototype.setTransform = function(i, container_width, rotation, deg_per_orbiter) {
    var starting_deg = 90,
        deg = (i > 0) ? (deg_per_orbiter * i) : 0,
        deg_per_orbiter_d_2 = deg_per_orbiter * .5,
        m360 = (deg + starting_deg + rotation) % 360,
        selected = (m360 > 90 - deg_per_orbiter_d_2 && m360 < 90 + deg_per_orbiter_d_2),
        transform = 'rotate(' + m360 + 'deg) translate(-' + (container_width / 2) + 'px) rotate(-' + m360 + 'deg) translateZ(0)';

    this.img.style[window.vendorPrefix.lowercase + 'Transform'] = transform;
    this.img.style['transform'] = transform;

    this.img.style.opacity = (selected) ? 1 : Math.abs((m360 < 90) ? (180 - m360 - 270) : (m360 - 270)) * .002777 * 2; // 1 / 360 ~= .002777
    this.img.style.zIndex = (selected) ? 1 : 0;

    if (selected) {
        this.img.style.width = '35%';
        this.img.style.margin = '-17.5%';
    } else {
        this.img.style.width = '15%';
        this.img.style.margin = '-7.5%';
    }
}
