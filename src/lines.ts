import { ThreeComponent, Mesh, Line, CatmullRomCurve3, Vector3, Color, BufferGeometry, LineBasicMaterial, VertexColors, BufferAttribute, LineSegments, CircleGeometry } from "three-component-ts";
import { TweenMax, Expo, TimelineMax } from "gsap";
import { ThreeUtils } from "./util";



export class Lines extends ThreeComponent {

    private timeline = new TimelineMax();

    private line: Line;

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

        // this.line = ThreeUtils.createLine2D(new Vector3(-15, 0, 0), 30, 0);
        // this.scene.add(this.line);

        // this.circle2 = ThreeUtils.createCircle2D(
        //     new Vector3(0, 0, 0), 6,
        //     {
        //         width: 1.5,
        //         color: new Color('blue'),
        //         //perturbance: 0.25,
        //         segmentCount: 15
        //     });
        // this.scene.add(this.circle2);

        // this.createLine();
        this.createCircle();
    }


    private createLine() {

        // create geometry
        const geometry = new BufferGeometry();

        // create 3 line segmemnts, 4 end points and and to geometry
        const vertices = new Float32Array([
            0, 0, 0,   // (0,0,0)
            20, 10, 0,   // (50,50,0)
            40, -10, 0,   // (40,0,0)
            60, 0, 0    // (60,10,0)
        ]);
        geometry.addAttribute('position', new BufferAttribute(vertices, 3));

        // create color of each end point (vertice) and to geometry
        const colors = new Float32Array([
            1.0, 0.0, 0.0,  // red
            1.0, 1.0, 0.0,  // yellow
            0.0, 1.0, 1.0,  // purple
            0.0, 0.0, 1.0,  // blue

        ]);
        geometry.addAttribute('color', new BufferAttribute(colors, 3));

        // create material
        const material = new LineBasicMaterial({
            vertexColors: VertexColors,
            linewidth: 8
        });

        // create line 
        const line = new Line(geometry, material);
        line.position.x = -25;

        line.computeLineDistances();

        this.scene.add(line);
    }


    private createCircle() {

        const radius = 20;
        const segmentCount = 60
        const segmentPoints = new Array<Vector3>();

        // compute vertices on the perimeter of the circle
        const SEG_RADS = 2 * Math.PI / segmentCount;
        for (let i = 0; i < segmentCount; i++) {
            const x = radius * Math.cos(i * SEG_RADS);
            const y = radius * Math.sin(i * SEG_RADS);
            segmentPoints.push(new Vector3(x, y, 0));
        }

        // create a smooth close spline
        const stemCurve = new CatmullRomCurve3(segmentPoints, true);
        const splinePoints = stemCurve.getPoints(360);

        // create geometry using 360 points on the circle
        const geometry = new BufferGeometry().setFromPoints(splinePoints);

        // Need to create 1 gradient color for each vertx. 
        // Color gradient for circle starts and ends with the startColor.
        // Compute gradient colors from startColor to endColor on 180 degress
        // using linear interpolation.
        // Then mirror colors on [180-0] degress to [180-360]
        const startColor = new Color('red');
        const endColor = new Color('green');

        const vertCnt = geometry.getAttribute('position').count;
        let hemisphereSegmentCount = Math.ceil(vertCnt / 2.0);
        const lerpInc = 1.0 / hemisphereSegmentCount;

        const colors = new Float32Array(vertCnt * 3);
        for (let i = 0; i <= hemisphereSegmentCount; i++) {
            const lerpColor = new Color(startColor);
            lerpColor.lerpHSL(endColor, i * lerpInc);

            colors[i * 3] = lerpColor.r;
            colors[i * 3 + 1] = lerpColor.g;
            colors[i * 3 + 2] = lerpColor.b;
        }

        // gradient color computed for top half of circle. 
        // Now mirror top half colors onto bottom half of circle
        for (let i = 1, j = (vertCnt-1) * 3; i < j; i += 3, j -= 3) {
            colors[j] = colors[i];
            colors[j+1] = colors[i+1];
            colors[j+2] = colors[i+2]
        }

        geometry.addAttribute('color', new BufferAttribute(colors, 3));

        // create material
        const material = new LineBasicMaterial({
            vertexColors: VertexColors,
            linewidth: 2
        });

        // create line 
        const circle = new Line(geometry, material);
        circle.computeLineDistances();

        this.scene.add(circle);
    }

    animate() {
        this.controls.update();
    }


}

