# Rotating Elements Around Circles in CSS

CSS Transforms can facilitate some really edgy designs. Facing North's compass UI, for instance, involves orbiting elements that animate and revolve around the center of a circle. Let's assume that our container element (with class `.compass`) has `border-radius: 50%` and is horizontally and vertically centered on the screen. Any `.orbiter` element on the interface can rotate around the edge of the circle.

This is easily done with CSS transforms, as well!

Consider the following HTML:

```
<div class="compass">
    <img class="orbiter" src="./images/screen1.png">
</div>
```

... and CSS:

```
.compass {
    width: 500px; height: 500px;
    border-radius: 50%;
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%) translateZ(0);
}

.orbiter {
    position: absolute;
    width: 15%; margin: -7.5%;
    top: 50%; left: 50%;
    border-radius: 50%;
}
```

This puts the `.orbiter` smack dab in the center of the `.compass`. We can easily rotate the `.orbiter` and then move it 250px (the radius size of the `.compass`) with this extra line.

```
transform: rotate(25deg) translate(-250px);
```

Unfortunately, you'll notice that the `.orbiter` doesn't keep it's vertical orientation. The more we rotate it around, the more it will flip upside-down.

![The `.orbiter` is positioned along the circumference of the compass UI, but is not "upright"](./boxout2-1.png)

This is undesired with the Facing North UI, and to fix it, we can add a an extra and equal rotation to the `.orbiter`:

```
transform: rotate(25deg) translate(-250px) rotate(-25deg);
```

Rotating 25 degrees, translating the `.orbiter`, and the rotating back keeps the `.orbiter` in the same spot, but re-orients the `.orbiter` element to be vertically aligned again. This is a nifty trick with transforms.

![The `.orbiter` is positioned along the circumference of the compass UI, and it is "upright"](./boxout2-2.png)