
import { ThreeComponent, AxesHelper, Geometry, Vector3, Color, Mesh, BufferGeometry } from "./three.component";
import { MeshLine, MeshLineMaterial } from 'three.meshline';


export class Tree extends ThreeComponent {
    geometry: BufferGeometry;

    constructor() {
        super();
        const canvas = document.getElementById("scene");
        this.initThree(canvas);
    }

    protected populateScene(): void {

        // this.scene.add(new AxesHelper(100));

        // // meshline
        // this.geometry = new BufferGeometry();
        // this.geometry.vertices.push(
        //     new Vector3(10, 0, 0)
        // );
        // this.geometry.vertices.push(
        //     new Vector3(10, 10, 0)
        // );
        // const line = new MeshLine();
        // line.setGeometry(this.geometry, (p: any) => 0.5);
        // const lineMaterial = new MeshLineMaterial({
        //     transparent: true,
        //     lineWidth: 3,
        //     color: new Color('#ff0000')
        // });
    
        // const mesh = new Mesh(line.geometry, lineMaterial);
        // this.scene.add(mesh);


        // this.camera.position.x = 5;
        // this.camera.position.y = 0;
        // this.camera.position.z = 10;

        // this.scene.translateY(-60);
    }

    animate() {

        // const positions = this.geometry.attributes.position.array as Float32Array;
        
        // this.geometry.vertices[1].y += 0.5;
        // console.log(this.geometry.vertices[1].y);
        // this.geometry.verticesNeedUpdate = true;
        // this.controls.update();
    }
}

