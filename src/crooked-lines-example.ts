import { ThreeComponent, Vector3, Color, LineDashedMaterial, VertexColors, LineBasicMaterial, OrbitControls, AxesHelper } from "three-component-ts";
import { createLine2D, randomColor, random, createCircle2D } from "./util";
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

        const line1 = createLine2D(
            new Vector3(-19, 8, 0), //origin
            12, //length
            0 // theta
        );
        this.scene.add(line1);

        const line2 = createLine2D(
            new Vector3(-6, 8, 0), //origin
            12,  //length
            0,   // theta
            {
                width: 1,
                color: new Color('black'),
                perturbance: random(0, 0.4),
                segmentCount: 10
            }
        );
        this.scene.add(line2);

        const line3 = createLine2D(
            new Vector3(7, 8, 0), //origin
            12,  //length
            0,   // theta
            {
                width: 3,
                color: [new Color('red'), new Color('darkgreen')],
                perturbance: random(0.1, 0.5),
                segmentCount: 30
            }
        );
        this.scene.add(line3);

        const circle1 = createCircle2D(new Vector3(-13, 0, 0), 6);
        circle1.rotateX(-0.2);
        this.scene.add(circle1);

        const circle2 = createCircle2D(
            new Vector3(0, 0, 0), 6,
            {
                width: 1,
                color: new Color('black'),
                perturbance: 0.25,
                segmentCount: 15
            });
        this.scene.add(circle2);

        const circle3 = createCircle2D(
            new Vector3(13, 0, 0), 6,
            {
                width: 3,
                color: new Color('orange'),
                perturbance: 0.5,
                segmentCount: 30
            });
        circle3.rotateX(0.2);
        this.scene.add(circle3);

        this.scene.add(new AxesHelper(20));
    }

    protected createOrbitControls() {
        super.createOrbitControls();

        this.controls.minDistance = 10;
        this.controls.maxDistance = 1500;
        this.controls.maxPolarAngle = Math.PI;
    }


    animate() {
        this.controls.update();
    }

}