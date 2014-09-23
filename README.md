radial-menu
===========

This is a tutorial on creating a circular, radial menu in JS and CSS, much like an old rotary phone. Originally created for NET Magazine (http://www.creativebloq.com/net-magazine).

# Designing and Developing Cross Platform Interactions

## Matt Keas takes a look at creating custom UI controls for interactive experiences on the web

Cross-platform web applications with custom user interface controls are notoriously difficult, and unstable, on multiple devices. When your design team has edgy and delightful design ideas – yet you don't know where to start – you may need to resort to "outside the box approaches." Most of the time, that requires pretty intimate knowledge of browser support in JavaScript and CSS, box-model tweaking, CSS positioning, and rendering optimization. Wrapping all this up in an edgy user interface can be tiresome, tedious, and taxing.

Sounds a bit rough, doesn't it?

> Assumptions of this article: you are familiar with CSS layout/positioning, CSS pseudo-elements and pseudo-classes, and JavaScript prototypes.

Let's take a deeper dive into the quirky, original UI developed for an "interactive web documentary" called Facing North (http://areyoufacingnorth.com). Interactive web documentaries are intended  to be viewed and experienced in a browser environment, typically involving some mix of interaction and audio-visual feedback. The intended audience is anyone on Android 4.2+, iOS 6+, or a desktop OS with browser that supports ECMASscript 5. For more info on this, check out http://kangax.github.io/compat-table/es5/.

> Nowadays, we can reasonably expect the majority of visitors to media-heavy sites to have IE9+, Chrome, Firefox, or Safari installed.

The main interaction of Facing North involves a rotating compass menu (see screenshot 1), which fades in when the screen is touched or the mouse is moved during video playback, and fades out after a few seconds so as not to detract from watching the videos.

![screenshot 1](./1.png)

Facing North consists of 18 separate videos, which are viewable by dragging the compass in either direction via mouse or touch. The compass will track with the cursor or finger, and the still of the selected video will be opaque and large to indicate which video is playing in the background.

> There is a newer event specification that handles both touch and mouse events introduced with IE10, called Pointer events (http://caniuse.com/#feat=pointer), but this was not used due to lack of support and a potential lack of performance with the popular polyfill library, Hand.js (http://blogs.msdn.com/b/eternalcoding/archive/2013/01/16/hand-js-a-polyfill-for-supporting-pointer-events-on-every-browser.aspx).

### The HTML

As mentioned earlier, the building blocks of custom UI controls involves intimate knowledge of layout and positioning, CSS keyframes and animation, and a "minimalist-maximus" approach to handling UI state. That is, **you need to capitalize on layout, animations, and pseudo-classes** to effectively produce code with a small footprint but a big shockwave.

Here is the HTML for this small, contrived example of the Facing North compass menu:

```
<!DOCTYPE html>
<html>

<head>
    <title>Net Magazine Tutorial - Designing and Developing Cross-Platform Interactions</title>
    <link rel="stylesheet" type="text/css" href="./style.css">
</head>

<body>
    <div class="container">
        <div class="compass">
            <!--
                18 of these will be created by JavaScript:
                <img class="orbiter" src="...">
            -->
            <div class="north-indicator"></div>
        </div>
    </div>

    <!-- <script type="text/javascript" src="http://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script> -->
    <script type="text/javascript" src="./FastQuery.js"></script>
    <script type="text/javascript" src="./app.js"></script>
</body>

</html>
```

Not much is happening here. We have a fullscreen `.container` element that acts as both the container for the compass menu and provides the dark, transparent background ("overlay effect") over the video.

There's only three other elements involved:

1. The `.compass` element, which is highlighted in screenshot 1 by a white, circular border.
2. The `.orbiter` elements, which are simply `<img>` tags that "orbit" around the compass. These will be created in our JavaScript to show how we can handle evenly distributing *any* number of orbiters around the compass, not just 18. This will involve some math.
3. The `.north-indicator` element, which sits positioned at the top center of the compass, denoting north on the compass and the selected video.

The following image (screenshot 3), will help denote the elements on the screen:

![screenshot 3](./3.png)

### The CSS

**Note**: If you want this to work on a non-Webkit or older browser (e.g. Firefox, Internet Explorer, Chrome 35-, Safari 6-) you may need to add prefixes to the CSS. For instance, the example code provided uses "transform" instead of "-webkit-transform" or "-moz-transform".

The CSS of this project is significantly more complex than the HTML. There are a number of design decisions to be considered whilst sizing and locating each of the elements, which we will cover in order of hierarchy:

1. The `.container` element will need to be positioned and sized as the full width and height of the viewport. This can be done with `vh` and `vw` units, but iOS Safari currently has some support issues, so it's best to just use `%`.
2. The design includes a horizontal "range" across the middle screen, which can be accomplished with a CSS pseudo-element.
3. The `.compass` must be small enough to fit on the screen, it must sit absolutely-centered on the `.container` (vertically and horizontally centered), and it must be perfectly circular. These constraints will be addressed.
4. The `.orbiter` elements must be evenly distributed around the `.compass` (that is, placed inside of the compass element), they must also be perfect circles, and the center of each `.orbiter` must be centered on the circular path created by the compass element.

The overall hierarchy and positioning will be best explained by the following image (screenshot 4):

![screenshot 4](./4.png)

The crux of the complexity in the UI is the transforms applied to each `.orbiter` element. This is handled in the JavaScript.

### The JavaScript

There a few major components of our JavaScript:

- A prototype (JavaScript "class") to handle logic for the entire compass UI
- A prototype (JavaScript "class") to handle logic for each Orbiter
- Polyfills (to help support older browsers - e.g. requestAnimationFrame, addEventListener)

The JavaScript initializes `onload` with:

```
window.onload = app;

function app() {
    rAFPolyfill();
    window.vendorPrefix = getVendorPrefix();
    var compass = new Compass(18, document.querySelector('.compass'));
}
```

In `app()`, there is a polyfill added for `requestAnimationFrame()`, we create a new instance of the `Compass` "class", and `getVendorPrefix()` is called to retrieve CSS prefixes of the browser. For `getVendorPrefix()`, this function returns these example results:

- When run on Chrome v37
    ```
    {
        dom: "WebKit",
        lowercase: "webkit",
        css: "-webkit-",
        js: "Webkit"
    }
    ```
- When run on Safari v7.0.6
    ```
    {
        dom: "WebKit",
        lowercase: "webkit",
        css: "-webkit-",
        js: "Webkit"
    }
    ```
- When run on Firefox v28
    ```
    {
        dom: "Moz",
        lowercase: "moz",
        css: "-moz-",
        js: "Moz"
    }
    ```

We will need these prefixes for animating the Orbiters with JavaScript.

The rest of the JavaScript is run through the constructor `new Compass()`, which takes a number `num` of Orbiters to distribute around the compass UI, and the DOM element that is our Compass. The Compass constructor is quite simple:

```
function Compass(num, compassElement) {
    this.rotation = 0;
    this.orbiters = this.addOrbiters(num, compassElement);
    this.compassElement = compassElement;
    this.rotate();
    this.handleInteractionEvents();
}
```

Most of the remaining code lies under `handleInteractionEvents()`, but first let's examine `addOrbiters()`:

```
Compass.prototype.addOrbiters = function(num, compass) {
    var i = num,
        orbiters = [];

    while (typeof i === "number" && i--) {
        orbiters.push(new Orbiter(compass, i));
    }

    return orbiters;
}
```

Quite simply, `addOrbiters()` creates an array of size `num` consisting of `Orbiter` instances. The `Orbiter()` constructor is just a contrived example of creating DOM elements with JavaScript:

```
function Orbiter(compass, index) {
    var img = document.createElement('img');
    img.className = "orbiter";
    img.src = "./images/screen" + (index % 4 + 1) + ".png";
    this.img = img;
    compass.appendChild(img);
}
```

This constructor is used to add an `<img>` tag with class `.orbiter` and an example source image to the compass UI.

There is one go-to function that is used to animate the position of each `Orbiter()`, and that is `Compass.rotate()`:

```
Compass.prototype.rotate = function(delta) {
    var self = this;
    for (var i = 0, len = self.orbiters.length; i < len; i++) {
        self.orbiters[i].setTransform(i, self.compassElement.offsetWidth, delta || 0, ~~(360 / self.orbiters.length));
    }
}
```

We will come back to this function, however take note that both in `Compass.rotate()` and `Orbiter.setTransform()` there is some "mathiness" that you will need to prepare for!

The rest of the `Compass()` constructor involves initializing touch and mouse event handlers:

```
Compass.prototype.handleInteractionEvents = function() {
    var self = this;

    function onTouchAndMouseStart(e) {
        // ...
    }

    function onTouchAndMouseEnd(e) {
        // ...
    }

    function handleDrag(e) {
        // ...
    }

    $.on('mousedown touchstart', onTouchAndMouseStart, this.compassElement);
    $.on('mouseup touchend', onTouchAndMouseEnd, window);
}
```

There are three functions for writing touch and mouse events:

1. `mousedown` / `touchstart` - handle when the interaction with the compass UI starts, and store some information about where the first event was fired; triggers `onTouchAndMouseStart()`
2. `mousemove` / `touchmove` - handle when the compass UI is 'dragged', and animate the compass UI to 'track' with the user's mouse or finger; triggers `handleDrag()`
3. `mouseup` / `touchend` - stop animating the compass UI and prepare for next interaction; handles `onTouchAndMouseEnd()`

The code for `onTouchAndMouseStart()` (with annotations):

```
function onTouchAndMouseStart(e) {

    // stop the browser from carrying out default actions (like selecting text)
    e.stopImmediatePropagation();
    e.preventDefault();

    // bind the actions for handling interaction
    $.on('mousemove touchmove', handleDrag, window);

    // sets a starting (x,y) coordinate for us to use;
    // calculates the starting degrees that the compass UI is at (see screenshot 5)
    var pX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
        pY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
        x = pX - document.body.offsetWidth / 2,
        y = -1 * (pY - document.body.offsetHeight / 2),
        theta = Math.atan2(y, x) * (180 / Math.PI),
        cssDegs = 90 - theta;
    self.draggedDegreesStart = cssDegs;

}
```

![screenshot 5](./5.png)

First, the browser is prevented from triggering any native events, such as selecting text. The event for handling a 'drag' is then bound to the window itself (in case the user drags their mouse or finger outside of the compass UI). Note that this event binding happened "late". In other words, we registered the listener for the `touchmove` and `mousemove` events only when the user has begun interacting with the compass UI, and we will remove these 'drag' listeners as soon as the user stops interacting with the page. This keeps resources light, and helps make the page run buttery-smooth.

The last bit of code in `onTouchAndMouseStart()` looks at the event data (handling both mouse and touch events) and calculates the angle that the mouse started, storing the result in a property on `self`. This property, `self.draggedDegreesStart`, will represent how many degrees the compass UI should be rotated during animation.

The code for `handleDrag()` (with annotations):

```
function handleDrag(e) {

    // again, calculate the degrees for the compass UI to be rotated
    var pX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
        pY = e.changedTouches ? e.changedTouches[0].pageY : e.pageY,
        x = pX - document.body.offsetWidth / 2,
        y = -1 * (pY - document.body.offsetHeight / 2),
        theta = Math.atan2(y, x) * (180 / Math.PI),
        cssDegs = 90 - theta;
    self.draggedDegrees2 = self.draggedDegrees || self.draggedDegreesStart;
    self.draggedDegrees = cssDegs;

    // update the rotation variable of self;
    // self.rotate() will use this to update the CSS properties of each Orbiter
    self.rotation = (self.rotation + self.draggedDegrees - self.draggedDegrees2) % 360;
    if (self.rotation < 0) self.rotation = 360 + self.rotation;

    // animate each Orbiter with a new degree of rotation
    self.rotate(self.rotation);
}
```

The first section of code is very similar to the degree calculations made in `onTouchAndMouseStart()`. After calculating the difference in degrees that the compass UI should be rotated, `self.rotation` gets the result and is 'clamped' between 0 and 359 degrees. `self.rotate()` is called again.

For the final `mouseup` / `touchend` event handler - `onTouchAndMouseEnd()`, some simple cleanup is all that is needed:

```
function onTouchAndMouseEnd(e) {

    // again, stop default events
    e.stopImmediatePropagation();
    e.preventDefault();

    // turn off the 'dragging' effect
    $.off('mousemove touchmove', handleDrag, window);

    // reset the properties used in calculating rotation
    self.draggedDegrees = self.draggedDegrees2 = 0;
}
```

Again, the default events are prevented. Then, the code unbinds the `handleDrag()` callback from the `mousemove` and `touchmove` events to turn off the 'dragging' animation (because now the user isn't touching or clicking the screen). Lastly, the properties on self that are used to store updated degrees of rotations (at start and move) are reset.

There is one final piece of JavaScript to make our compass UI animate – we need to actually change the inline styles of the Orbiters when rotating! The code above already handles calling `Compass.rotate()`, which we looked at earlier in this article:

```
Compass.prototype.rotate = function(delta) {
    var self = this;
    for (var i = 0, len = self.orbiters.length; i < len; i++) {
        self.orbiters[i].setTransform(i, self.compassElement.offsetWidth, delta || 0, +(360 / self.orbiters.length));
    }
}
```

The `Orbiter()` "class" has a function called `setTransform()` available, which takes into account (parameters, in order):

1. `i` - The spot in place (i.e. could be an integer between 0 to 17 if there are 18 Orbiters to be distributed around the compass)
2. `self.compassElement.offsetWidth` - The diameter of the compass, in pixels
3. `delta || 0` - the current rotation (in degrees, between 0 and 359) to set each `Orbiter()` (`Orbiters()` with an `i` greater than 0 will be rotated around an additional amount to distribute them evenly around the circumference of the compass UI)
4. `~~(360 / self.orbiters.length)` - The degrees by-which to spread out each `Orbiter()`; for example, for 18 Orbiters, each Orbiter will occupy a "slice" of the compass UI (360/18 or 20°). The '~~' is a shortcut that rounds a decimal number to the nearest integer.

The `Orbiter.setTransform()` code looks like this:

```
Orbiter.prototype.setTransform = function(i, container_width, rotation, deg_per_orbiter) {

    // more math!! Yey...
    // calculates how much to rotate this particular
    // Orbiter around the center of the compass
    var starting_deg = 90,
        deg = (i > 0) ? (deg_per_orbiter * i) : 0,
        deg_per_orbiter_d_2 = deg_per_orbiter * .5,
        m360 = (deg + starting_deg + rotation) % 360,
        selected = (m360 > 90 - deg_per_orbiter_d_2 && m360 < 90 + deg_per_orbiter_d_2),
        transform = 'rotate(' + m360 + 'deg) translate(-' + (container_width / 2) + 'px) rotate(-' + m360 + 'deg) translateZ(0)';

    // update the transform style of the Orbiter's associated img element in the DOM
    this.img.style[window.vendorPrefix.lowercase + 'Transform'] = transform;
    this.img.style['transform'] = transform;

    // add some cool effects, such as fading out Orbiters further away from the "North" quadrant of the compass UI
    this.img.style.opacity = (selected) ? 1 : Math.abs((m360 < 90) ? (180 - m360 - 270) : (m360 - 270)) * .002777 * 2; // 1 / 360 ~= .002777
    this.img.style.zIndex = (selected) ? 1 : 0;

    // some unfortunately hardcoded styles here...
    // changes the size of items if they are selected or not...
    if (selected) {
        this.img.style.width = '35%';
        this.img.style.margin = '-17.5%';
    } else {
        this.img.style.width = '15%';
        this.img.style.margin = '-7.5%';
    }
}
```

If you've been following along and slowly building up familiarity with how this code works, the latest comments should be primarily self-explanatory. :-)

Final thoughts:

- context-aware design

    The design isn't just responsive (works for multiple screens and devices), it is context-aware, and I was able to add more tests to the production code for browser support, add performance and feature enhancements, and for different events and platform-specific interactions (such as the Fullscreen API and handling tab-focus events).

- a DIY code-ethic / “framework free” approach

    Without researching, exploring, and prototyping the 'hard parts' (read: the Math and UI approaches), I would not have been able to make this work as smoothly as I did. From my experience, there was no 'wheel' to reinvent for this UI pattern, so I had to create my own.

- buttery smooth “do-it-and-get-out-of-the-way” animations

    Only just enough animation is done via inline-styles with JavaScript; the rest are triggered via CSS transitions, `:hover` and `:active` states, and class toggling with JavaScript. Either way, doing as much animation as possible via CSS (read: declarative animations) helps the browser optimize rendering.

- mouse and touch events (touch events and mouse events vs pointer events)

    There wasn't much extra code to handle two separate event types (mouse and touch). I could have handled pointer events and added a polyfill for unsupported browsers, but I have noticed some performance degradation with this approach.

- bind low in the DOM, unbind ASAP

    The 'drag' events were handled only when the 'start' events took place, which helps optimize memory and CPU resources whenever the compass isn't being dragged. Additionally, the 'drag' events are unbound as soon as the mouse or screen is 'released' to free up resources quickly.

- mathematics involved

    The math was both the most difficult and most rewarding piece of the UI. There was some considerable opportunity cost on this prototype, and thus we needed to make the investment count and make the context or topic of said research a primary feature of the app.

That's about it! I will #ShipIt™ and make edits later :-)

Cheers,
Matt