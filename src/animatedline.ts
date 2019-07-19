import { Line, ThreeComponent, Vector2, Mesh, LineDashedMaterial, Color, OrbitControls } from "./three.component";
import { create2DLine, randomColor, random, create2DCircle } from "./util";
import { TweenMax, Expo, TimelineMax } from "gsap";
import { VertexColors, FrontSide } from "three";


// incrementally reveal individual lines
// by animating each lines growth from 0 to line.length
export class AnimatedLines extends ThreeComponent {

    fraction = 0;

    line2: Line;


    constructor() {
        super();
        //this.lines = [];
        const canvas = document.getElementById("scene");
        this.initThree(canvas);
    }

    start() {
        //this.updateHandPositions();
        this.startRenderer();
        TweenMax.to('#cover', 0, { opacity: 0, ease: Expo.easeIn });

    }

    protected populateScene(): void {
        const colorGradient: [Color,Color] = [new Color('red'), new Color('blue')]

        this.camera.position.setZ(30);

        const timeline = new TimelineMax();

        const material = new LineDashedMaterial({
            vertexColors: VertexColors,
            dashSize: 0,
            gapSize: 1e10,
            //side: FrontSide   //DoubleSide
        })

        // const line = create2DLine(
        //     new Vector2(-10, 0),
        //     0,
        //     20,
        //     colorGradient,
        //     random(0, 0.75),
        //         5,
        //         //material
        // );
        // this.scene.add(line);
        // timeline.to(line.material, 2, { dashSize: 20 }, 0);

        // const line1 = create2DLine(
        //     new Vector2(-10, 0),
        //     0,
        //     20,
        //     randomColor(),
        //     random(0, 1.75),
        //     10,
        //     material.clone());

        // this.scene.add(line1);
        // timeline.to(line1.material, 2, { dashSize: 20 }, 0);

        this.line2 = create2DLine(
            new Vector2(-10, 0),
            0,
            20,
            [ new Color('yellow'), new Color('darkgreen')],
            random(0, 1),
            10,
            material.clone());

        this.scene.add(this.line2);
        timeline.to(this.line2.material, 3, { dashSize: 20 }, 0);

        // const line3 = create2DLine(
        //     new Vector2(-10, 0),
        //     0,
        //     20,
        //     new Color(1, 0, 0),
        //     random(0, 1),
        //     10);

        // this.scene.add(line3);
        // timeline.to(line3.material, 3, { dashSize: 20 }, 0);

        const circle1 = create2DCircle(
            new Vector2(),
            10,
            //new Color(1, 0, 0),
            colorGradient,
            random(0, 1),
            15, Math.PI/2,
            //material.clone()
        );

        this.scene.add(circle1);
        //timeline.to(circle1.material, 3, { dashSize: Math.PI * 20 }, 0);


        timeline.play();
    }


    animate() {
        super.animate();
        this.line2.rotation.z += 0.005;
    }

    createControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.update();
    }
}