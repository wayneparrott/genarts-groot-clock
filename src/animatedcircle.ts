import { ThreeComponent, Vector2, Object3D, Vector3, CatmullRomCurve3, BufferGeometry, LineBasicMaterial, Line } from "./three.component";
import { randomColor, random } from "./Util";
import { BufferAttribute, Color, CircleBufferGeometry, MeshBasicMaterial, MeshPhongMaterial, DoubleSide, Mesh } from "three";
import { TweenMax, Expo, Ease, Circ, Power4 } from "gsap";


export class AnimatedCircle extends ThreeComponent {

    ptCnt = 0;
    geometry: BufferGeometry;

    constructor() {
        super();

        const canvas = document.getElementById("scene");
        this.initThree(canvas);
    }

    protected populateScene(): void {

        this.camera.position.setZ(30);

        const segmentCount = 30;
        const peturbance = 0.1;
        const radius = 10;
        const origin = new Vector3();
        const color = new Color(1, 0, 0); //randomColor();

        // generate points
        const segmentRads = 2 * Math.PI / segmentCount;
        const segmentPoints = new Array<Vector3>();

        for (let i = 0; i < segmentCount; i++) {
            const radiusPrime = radius + random(-peturbance, peturbance);
            const x = origin.x + radiusPrime * Math.cos(i * segmentRads);
            const y = origin.y + radiusPrime * Math.sin(i * segmentRads);
            segmentPoints.push(new Vector3(x, y, 0));
        }

        const curveType = "chordal"; // chordal, centripetal, catmullrom
        const stemCurve = new CatmullRomCurve3(segmentPoints, true);
        const splinePoints = stemCurve.getPoints(359);
        this.geometry = new BufferGeometry().setFromPoints(splinePoints);
        //this.geometry.
        const material = new LineBasicMaterial({ color: color, transparent: true, opacity: 1 });

        // return circle
        const line = new Line(this.geometry, material);
        this.scene.add(line);

        const positions = this.geometry.attributes.position as BufferAttribute;
        console.log('cnt', positions.count);
        positions.count = 0;
        positions.dynamic = true;
        //positions.needsUpdate = true;
        TweenMax.to(positions, 3.0, {
            count: 360,
            onUpdate: () => positions.needsUpdate = true,
            ease: Expo.easeInOut
        });

        TweenMax.to(material, 8, {
            opacity: 0,
            ease: Power4.easeOut
        });

        // if (positions.count <= 359) {
        // positions.count+=2;
        positions.needsUpdate = true;

        const coverDiv = document.getElementById('cover');
        TweenMax.to(coverDiv, 3,
            {
                opacity: 0,
                onComplete: () => {
                    //   this.updateHandPositions();
                    //     this.startRenderer();
                }
            });

        const geometry = new CircleBufferGeometry(5, 30);
        const mat = new MeshPhongMaterial({
            side: DoubleSide,
        });

        const hue = Math.random();
        const saturation = 1;
        const luminance = .5;
        mat.color.setHSL(hue, saturation, luminance);
        const mesh = new Mesh(geometry, mat);
        mesh.position.set(3,3,0);
        this.scene.add(mesh);

    }

    animate() {
        super.animate();



    }
}

// const positions = this.geometry.attributes.position.array as Float32Array;
// (this.geometry.attributes.position as BufferAttribute).needsUpdate = true;

