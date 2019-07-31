import { ThreeComponent, Vector3, Color, LineDashedMaterial, VertexColors, LineBasicMaterial } from "three-component-ts";
import { createLine, randomColor, random, createCircle } from "./util";
import { TimelineMax, TweenMax, Expo } from "gsap";


// http://wayneparrott.com/groot-clock---animating-simulated-hand-drawn,-gradient-colored,-three-js-lines-(part-1)

export class CrookedLinesExample extends ThreeComponent {

    private timeline = new TimelineMax();

    constructor() {
        super();

        const canvas = document.getElementById("scene");
        this.initThree(canvas);
    }

    start() {
        this.startRenderer();

        TweenMax.to('#cover', 0.5, { opacity: 0, ease: Expo.easeIn });
        this.timeline.play();
    }

    protected populateScene(): void {

        this.camera.position.setZ(30);

        const line1 = createLine(
            new Vector3(-19, 8, 0), //origin
            0, // angle
            12 //length
        );
        this.scene.add(line1);

        const line2 = createLine(
            new Vector3(-6, 8, 0), //origin
            0,   // angle
            12,  //length
            1,   // linewidth
            new Color('black'), // color
            random(0, 0.4),     // perturbance
            10  // number of segments
        );
        this.scene.add(line2);

        const line3 = createLine(
            new Vector3(7, 8, 0), //origin
            0,   // angle
            12,  //length
            3,   // linewidth
            [new Color('red'), new Color('darkgreen')], // color
            random(0.1, 0.5),                             // perturbance
            30   // number of segments
        );
        this.scene.add(line3);

        const circle1 = createCircle(
            new Vector3(-13, 0, 0),
            6
        );
        this.scene.add(circle1);

        const circle2 = createCircle(
            new Vector3(0, 0, 0),
            6, 1,
            new Color('black'),
            0.25,
            15
        );
        this.scene.add(circle2);

        const circle3 = createCircle(
            new Vector3(13, 0, 0),
            6, 3,
            new Color('red'),
            0.5,
            30
        );
        this.scene.add(circle3);

    }

}