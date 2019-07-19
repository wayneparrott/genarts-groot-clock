import {
    ThreeComponent, Object3D, SplineCurve, Vector2, BufferGeometry, Line,
    LineBasicMaterial, AxesHelper, Vector, CatmullRomCurve3, Vector3, Color,
    LineDashedMaterial, VertexColors, OrbitControls
} from "./three.component";

import { random, randomColor, create2DCircle, create2DLine } from "./util";
import { TweenMax } from "gsap/TweenMax";
import { Circ, Expo, TimelineMax } from "gsap";


const FACE_RADIUS = 10;
const HOUR_HAND_LEN = FACE_RADIUS * 0.6;
const MINUTE_HAND_LEN = FACE_RADIUS * 0.95;
const SECOND_HAND_LEN = MINUTE_HAND_LEN;

const RAD_PER_DEG = Math.PI / 180.0;
const DEG_PER_SEC = 6.0;
const DEG_PER_MIN = 6.0;
const DEG_PER_HOUR = 30.0;
const HOUR_DEG_PER_MIN = DEG_PER_HOUR / 60.0;

const TWO_PI = 2 * Math.PI;

export class GrootClock extends ThreeComponent {
    // private inited = false;
    private prevTime: Date;

    private secAngle = 0;
    private minAngle = 0;
    private hourAngle = 0;

    private hourHand = new Object3D();
    private minuteHand = new Object3D();
    private secondHand = new Object3D();

    private tic = false;


    constructor() {
        super();

        this.prevTime = new Date();
        this.prevTime.setSeconds(0);
        this.prevTime.setMinutes(0);
        this.prevTime.setHours(0);

        const canvas = document.getElementById("scene");
        this.initThree(canvas);
    }

    protected populateScene(): void {

        this.camera.position.setZ(30);

        const timeline = new TimelineMax();

        const material = new LineDashedMaterial({
            vertexColors: VertexColors,
            dashSize: 0,
            gapSize: 1e10,
            //side: FrontSide   //DoubleSide
        })

        // draw clock face
        const circleContainer = new Object3D();
        for (let i = 0; i < 100; i++) {
            const circle = create2DCircle(
                new Vector2(),
                random(FACE_RADIUS, FACE_RADIUS + 1.0),
                [randomColor(), randomColor()],
                random(0, 1.5),
                25, random(0, TWO_PI),
                i % 99 == 0 ? null : material.clone()
            );
            circleContainer.add(circle);
            timeline.to(circle.material, random(2, 6), { dashSize: 20 }, random(3, 15));
        }
        this.scene.add(circleContainer);

        // draw hour hand
        for (let i = 0; i < 20; i++) {
            const line = create2DLine(
                new Vector2(0, 0),
                Math.PI / 2,
                random(HOUR_HAND_LEN - 1, HOUR_HAND_LEN),
                [randomColor(), randomColor()],
                random(0, 0.7),
                10,
                material.clone()
            );
            this.hourHand.add(line);
            timeline.to(line.material, 6, { dashSize: 20 }, random(3, 15));
        }
        this.scene.add(this.hourHand);

        // draw minute hand
        for (let i = 0; i < 15; i++) {
            const line = create2DLine(
                new Vector2(0, 0),
                Math.PI / 2,
                random(MINUTE_HAND_LEN - 1, MINUTE_HAND_LEN),
                [randomColor(), randomColor()],
                random(0, 0.5),
                10,
                material.clone());
            this.minuteHand.add(line);
            timeline.to(line.material, 6, { dashSize: 20 }, random(3, 15));
        }
        this.scene.add(this.minuteHand);


        // draw secondHand
        for (let i = 0; i < 2; i++) {
            const line = create2DLine(
                new Vector2(0, 0),
                Math.PI / 2,
                SECOND_HAND_LEN,
                [randomColor(), randomColor()],
                random(0, 0.45),
                10,
                material.clone());
            this.secondHand.add(line);
            timeline.to(line.material, 6, { dashSize: 20 }, random(3, 15));
        }
        this.scene.add(this.secondHand);

        // add center pt
        const centerPt = new Object3D();
        for (let i = 0; i < 13; i++) {
            const circle = create2DCircle(
                new Vector2(),
                0.25,
                [new Color('yellow'), new Color('darkgreen')],
                random(0, 1.0),
                25);
            centerPt.add(circle);
        }
        this.scene.add(centerPt);

        //---------
        timeline.play();

    }

    start() {

        // controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 100;


        this.updateHandPositions();
        this.startRenderer();
        TweenMax.to('#cover', 1.5, { opacity: 0, ease: Expo.easeIn });
    }



    animate() {
        super.animate();
        //if (this.controls) this.controls.update();
        if (this.tic) {
            this.updateHandPositions();
            this.tic = false;
        }
    }

    updateHandPositions() {
        const time = new Date();

        try {
            // avoid nop if within the same second as previous execution
            if (time.getSeconds() == this.prevTime.getSeconds()) return;

            // move secondHand by 6 deg per tick. Crossing he 0-pt is a special case:
            // to avoid a quick reversal from -2PI to 0, never tween across zero. 
            // Instead tween right up to 0 and then jump across 0 to 0.0001 and
            // resume nomral secondHand animation. 
            let secAngle = (time.getSeconds() * -DEG_PER_SEC) * RAD_PER_DEG;
            let onSecsTweenComplete = null;
            if (secAngle == 0) {
                secAngle = -(TWO_PI - 0.0001);
                onSecsTweenComplete = () => this.secondHand.rotation.z = 0.0000;
            }
            TweenMax.to(this.secondHand.rotation, 0.3, {
                z: secAngle,
                onComplete: onSecsTweenComplete
            });

            // move minuteHand by 6 deg every minute. Crossing the 0-pt is a special case.
            // Handled similar to secondHand's 0-pt logic.
            if (time.getMinutes() == this.prevTime.getMinutes()) return;
            let minsAngle = (time.getMinutes() * -DEG_PER_MIN) * RAD_PER_DEG;
            let onMinsTweenComplete = null;
            if (minsAngle == 0) {
                minsAngle = -(TWO_PI - 0.0001);
                onMinsTweenComplete = () => this.minuteHand.rotation.z = 0.0000;
            }
            TweenMax.to(this.minuteHand.rotation, 0.3, {
                z: minsAngle,
                onComplete: onMinsTweenComplete
            });

            // animate the hourHand every hour to move 30 deg. Crossing the 0-pt is a special case.
            // Used similar logic as above.
            if (time.getHours() == this.prevTime.getHours()) return;
            //let hoursAngle = ((time.getHours() * 60 + time.getMinutes()) * -HOUR_DEG_PER_MIN) * RAD_PER_DEG;
            let hoursAngle = (time.getHours() * -DEG_PER_HOUR) * RAD_PER_DEG;
            let onHoursTweenComplete = null;
            if (hoursAngle == 0) {
                hoursAngle = -(TWO_PI - 0.0001);
                onHoursTweenComplete = () => this.minuteHand.rotation.z = 0.0000;
            }
            TweenMax.to(this.hourHand.rotation, 0.3, {
                z: hoursAngle,
                onComplete: onHoursTweenComplete
            });
        } finally {
            this.prevTime = time;
        }
    }

    startRenderer() {
        super.startRenderer();

        setInterval(() => this.tic = true, 1000);
    }

    // createControls() {
    //     super.createControls();
    //     this.controls.minDistance = 10;
    //     this.controls.maxDistance = 50;
    // }

}


