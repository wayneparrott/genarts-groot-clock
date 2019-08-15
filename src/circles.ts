import { ThreeComponent, Line, Vector3, Color } from "three-component-ts";
import { TweenMax, Expo, TimelineMax } from "gsap";
import { ThreeUtils } from "./util";



export class Circles extends ThreeComponent {

    private timeline = new TimelineMax();

    private circle1: Line;
    private circle2: Line;

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

        this.circle1 = ThreeUtils.createCircle2D(
            new Vector3(0, 0, 0), 6,
            {
                width: 1,
                color: new Color('red'),
                //perturbance: 0.25,
                segmentCount: 15
            });
        this.scene.add(this.circle1);

        this.circle2 = ThreeUtils.createCircle2D(
            new Vector3(0, 0, 0), 6,
            {
                width: 1.5,
                color: new Color('blue'),
                //perturbance: 0.25,
                segmentCount: 15
            });
        this.scene.add(this.circle2);

    }

    render() {
        super.render();

        this.circle1.rotation.x += 0.05;
        //this.circle1.rotation.y += 0.05;
        //this.circle.rotation.z += 0.01;

        //this.circle2.rotation.x += 0.025;
        this.circle2.rotation.y += 0.025;
    }


}

