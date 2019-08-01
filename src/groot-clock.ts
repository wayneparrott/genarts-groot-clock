import {
    ThreeComponent, Object3D, Vector3,
    LineDashedMaterial, VertexColors, OrbitControls,
    TextureLoader, SpriteMaterial, Sprite, Color, REVISION
} from "three-component-ts";
import { random, randomColor, createCircle2D, createLine2D } from "./util";
import { TweenMax } from "gsap/TweenMax";
import { Expo, TimelineMax } from "gsap";



const FACE_RADIUS = 10;
const HOUR_HAND_LEN = FACE_RADIUS * 0.55;
const MINUTE_HAND_LEN = FACE_RADIUS * 0.9;
const SECOND_HAND_LEN = MINUTE_HAND_LEN;
const CENTER_PT_LEN = 0.25;

const CIRCLE_LINES = 50;
const HOUR_HAND_LINES = 20;
const MIN_HAND_LINES = 15;
const SEC_HAND_LINES = 2;
const CENTER_PT_LINES = 12;
const LINE_WIDTH = 1;
const INSET = 1.5;

const INCLUDE_LEAFS = true;
const LEAFS = 1250;
const HOUR_HAND_LEAFS = 5;
const MINUTE_HAND_LEAFS = 10;
const SECOND_HAND_LEAFS = 10;

const RAD_PER_DEG = Math.PI / 180.0;
const DEG_PER_SEC = 6.0;
const DEG_PER_MIN = 6.0;
const DEG_PER_HOUR = 30.0;
const CIRCUMFERENCE = 2 * FACE_RADIUS * Math.PI * 1.5; //scaled by 150%

const TWO_PI = 2 * Math.PI;

const LEAF_IMG_BASE64 = 'data:image/png;base64,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';



export class GrootClock extends ThreeComponent {

    private prevTime: Date;
    private tic = false;

    private face = new Object3D();
    private hourHand = new Object3D();
    private minuteHand = new Object3D();
    private secondHand = new Object3D();

    private timeline = new TimelineMax();

    private loader = new TextureLoader();
    private leafMaterial = new SpriteMaterial(
        {
            color: 0xffffff,
            transparent: true,
            //depthWrite: false
        });


    constructor() {
        super();

        this.prevTime = new Date();
        this.prevTime.setSeconds(0);
        this.prevTime.setMinutes(0);
        this.prevTime.setHours(0);

        this.leafMaterial.map = this.loader.load(LEAF_IMG_BASE64);

        const canvas = document.getElementById("scene");
        this.initThree(canvas);

        console.log(REVISION);
    }

    protected populateScene(): void {

        this.camera.position.setZ(30);

        const material = new LineDashedMaterial({
            vertexColors: VertexColors,
            dashSize: 0,
            gapSize: 1e10,
            //side: FrontSide   //DoubleSide
        })

        // draw clock face
        for (let i = 0; i < CIRCLE_LINES; i++) {
            const circle = createCircle2D(
                new Vector3(),
                random(FACE_RADIUS, FACE_RADIUS + 0.75),
                {
                    width: LINE_WIDTH,
                    color: [randomColor(), randomColor()],
                    perturbance: random(0, 1.5),
                    segmentCount: 25,
                    startAngle: random(0, TWO_PI),
                    material: material.clone()
                }
            );
            //circle.position.z = random(0, 5);
            circle.rotateX(random(-0.2,0.2));
            circle.rotateY(random(-0.2,0.2));
            this.face.add(circle);
            this.timeline.to(circle.material, random(2, 6), { dashSize: CIRCUMFERENCE }, random(3, 15));
        }
        this.scene.add(this.face);

        // draw hour hand
        for (let i = 0; i < HOUR_HAND_LINES; i++) {
            const line = createLine2D(
                new Vector3(),
                random(HOUR_HAND_LEN - 1, HOUR_HAND_LEN),
                Math.PI / 2,
                {
                    width: LINE_WIDTH,
                    color: [randomColor(), randomColor()],
                    perturbance: random(0, 0.7),
                    segmentCount: 10,
                    material: material.clone()
                }
            );
            this.hourHand.add(line);
            this.timeline.to(line.material, 6, { dashSize: HOUR_HAND_LEN }, random(3, 15));
        }
        this.hourHand.position.z = -INSET;
        this.scene.add(this.hourHand);

        // draw minute hand
        for (let i = 0; i < MIN_HAND_LINES; i++) {
            const line = createLine2D(
                new Vector3(),
                random(MINUTE_HAND_LEN - 1, MINUTE_HAND_LEN),
                Math.PI / 2,
                {
                    width: LINE_WIDTH,
                    color: [randomColor(), randomColor()],
                    perturbance: random(0, 0.5),
                    segmentCount: 10,
                    material: material.clone()
                });
            this.minuteHand.add(line);
            this.timeline.to(line.material, 6, { dashSize: MINUTE_HAND_LEN }, random(3, 15));
        }
        this.minuteHand.position.z = -INSET;
        this.scene.add(this.minuteHand);


        // draw secondHand
        for (let i = 0; i < SEC_HAND_LINES; i++) {
            const line = createLine2D(
                new Vector3(0, 0, 0),
                SECOND_HAND_LEN,
                Math.PI / 2,
                {
                    width: LINE_WIDTH,
                    color: [randomColor(), randomColor()],
                    perturbance: random(0, 0.45),
                    segmentCount: 10,
                    material: material.clone()
                });
            this.secondHand.add(line);
            this.timeline.to(line.material, 6, { dashSize: SECOND_HAND_LEN }, random(3, 15));
        }
        this.secondHand.position.z = -INSET;
        this.scene.add(this.secondHand);

        // add center pt
        const centerPt = new Object3D();
        for (let i = 0; i < CENTER_PT_LINES; i++) {
            const circle = createCircle2D(
                new Vector3(),
                CENTER_PT_LEN,
                {
                    width: LINE_WIDTH,
                    color: [new Color('yellow'), new Color('darkgreen')],
                    perturbance: random(0, 1.0),
                    segmentCount: 25
                });
            centerPt.add(circle);
        }
        centerPt.position.z = -INSET;
        this.scene.add(centerPt);


        if (INCLUDE_LEAFS) {
            // create leafs
            for (let i = 0; i < LEAFS; i++) {
                const angle = random(0, TWO_PI);
                const radius = random(FACE_RADIUS - 0.5, FACE_RADIUS + 1.1);
                const rotation =
                    (radius < FACE_RADIUS ? angle + Math.PI : angle) +
                    random(-Math.PI / 3, Math.PI / 3);
                const leaf = this.createLeaf(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    //randomColor());
                    new Color(1.0, 0.6 + random(0, 0.4), 0));
                const scale = random(0.5, 1.0);
                leaf.scale.set(scale, scale, 1);
                leaf.material.rotation = rotation;
                leaf.position.z = random(-2.5,2.5);
                leaf.material.opacity = 0;

                this.face.add(leaf);
                this.timeline.to(
                    leaf.material,
                    random(2, 6),
                    { opacity: random(0.1, 0.9) },
                    random(6.5, 20));
            }

            //second hand leafs
            for (let i = 0; i < SECOND_HAND_LEAFS; i++) {
                const x = random(-0.15, 0.15);
                const leaf = this.createLeaf(
                    x, random(2, SECOND_HAND_LEN - 1),
                    new Color(0.5, 0.6 + random(0, 0.4), 0.5));
                const scale = random(0.5, 0.75);
                leaf.scale.set(scale, scale, 1);
                leaf.material.rotation =
                    Math.PI + (x < 0 ? random(0, 0.5) : random(-0.5, 0));
                //leaf.position.z = -INSET;
                leaf.material.opacity = 0;

                this.secondHand.add(leaf);
                this.timeline.to(
                    leaf.material,
                    random(2, 5),
                    { opacity: random(0.2, 0.9) },
                    random(12, 20));
            }

            //minute hand leafs
            for (let i = 0; i < MINUTE_HAND_LEAFS; i++) {
                const leaf = this.createLeaf(
                    random(-0.25, 0.25), random(2, MINUTE_HAND_LEN),
                    new Color(0.5, 0.6 + random(0, 0.4), 0.5));
                const scale = random(0.5, 0.75);
                leaf.scale.set(scale, scale, 1);
                leaf.material.rotation = random(0, TWO_PI);
                //leaf.position.z = -INSET; //random(0, 5);
                leaf.material.opacity = 0;

                this.minuteHand.add(leaf);
                this.timeline.to(
                    leaf.material,
                    random(2, 5),
                    { opacity: random(0.2, 0.9) },
                    random(12, 20));
            }

            //hour hour leafs
            for (let i = 0; i < HOUR_HAND_LEAFS; i++) {
                const leaf = this.createLeaf(
                    random(-0.25, 0.25), random(2, HOUR_HAND_LEN),
                    new Color(0, 0.75, random(0.5, 1)));
                const scale = random(0.5, 0.75);
                leaf.scale.set(scale, scale, 1);
                leaf.material.rotation = random(0, TWO_PI);
                //leaf.position.z = -INSET; //random(0, 5);
                leaf.material.opacity = 0;

                this.hourHand.add(leaf);
                this.timeline.to(
                    leaf.material,
                    random(2, 5),
                    { opacity: random(0.2, 0.9) },
                    random(12, 20));
            }
        }
    }

    start() {

        // controls
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.minDistance = 10;
        controls.maxDistance = 100;

        this.startRenderer();
        TweenMax.to('#cover', 1.5, { opacity: 0, ease: Expo.easeIn });
        // start animation
        this.updateHandPositions();
        this.timeline.play();

    }

    protected createOrbitControls() {
        super.createOrbitControls();
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        // this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        // this.controls.dampingFactor = 0.25;
        // this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 1500;
        // this.controls.maxPolarAngle = Math.PI / 2;

        //this.controls.update();
    }

    animate() {
        super.animate();
        //if (this.controls) this.controls.update();
        if (this.tic) {
            this.updateHandPositions();
            this.tic = false;
        }

        this.controls.update();
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

    createLeaf(x = 0, y = 0, color = new Color(0xffffff)): Sprite {
        let material = this.leafMaterial;
        if (!color.equals(this.leafMaterial.color)) {
            material = material.clone();
            material.color = color;
        }
        const sprite = new Sprite(material);
        sprite.position.x = x;
        sprite.position.y = y;
        return sprite;
    }

}


