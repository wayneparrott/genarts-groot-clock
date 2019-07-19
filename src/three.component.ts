
// inspired by https://github.com/makimenko/angular-three-examples/blob/master/src/app/scene/scene.component.ts

import {
  WebGLRenderer, PerspectiveCamera, Scene, AmbientLight, BoxGeometry, MeshBasicMaterial,
  Mesh, WebGLRendererParameters, Camera
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export {OrbitControls};
export * from 'three';


// override and extend populateScend(), animate()

/**
 * Provides a simple typescript framework for creating and managing a three.js scene.
 * Subclasses must implement the abstract populateScene() method.
 * Overridable defaults include use of a PerspectiveCamera, AmbientLight and OrbitControls.
 * These defaults can be overridden by overriding createCamera(), createLight() and
 * createControls() respectively.
 *
 * To setup a three.js secend call the initThree(domElement) method. with either a canvas object
 * which three.js should use directly or a DOM element that will serve as the parent for a canvas
 * element that will be created dynamicaally.  If this class is used in an Angular app call initThree()
 * from the ngAfterViewInit() component lifecycle method or later in event.
 *
 * This class was inspired by
 * https://github.com/makimenko/angular-three-examples/blob/master/src/app/scene/scene.component.ts
 */
export abstract class ThreeComponent {

  /** The canvas element rendered into by three.js */
  protected canvas: HTMLCanvasElement;

  /** The three.js Scene container */
  protected scene: Scene;

  /** three.js Renderer */
  protected renderer: WebGLRenderer;

  /** this animationFrame reference */
  private animationFrameRef: number = 0;

  /** three.js camera, PerspectiveCamera is created by default */
  protected camera: Camera;

  /** three.js light */
  protected light: AmbientLight;


  /** three.js controls for the scene, OrbitControls is create by default */
  protected controls: any;


  public fieldOfView = 75;
  public nearClippingPane = 1;
  public farClippingPane = 1000;

  public updateCanvasStyleOnResize = false;



  /**
   * Creates the three.js Scene, it's components (camera, light, object3d, controls...) and
   * renderer. The three.js library requires a canvas element into which it will render the scene.
   * The domElement parameter can be either a HTMLCanvasElement which three.js will render into
   * directly or it can be a general HTMLElement into which a canvas element will be created and
   * appended as a child node.
   *
   * @param domElement?  HTMLCanvasElement | HTMLElement
   */
  public initThree(domElement?: HTMLCanvasElement | HTMLElement) {

    // assign or create the canvas element required by three.js
    this.initCanvas(domElement);

    // initial the scene and all related parts
    this.createScene();
    this.createLight();
    this.createCamera();
    this.createRenderer();
    this.populateScene();
    this.createControls();
  }

  /**
   * Initiate the rendering loop. 
   * Successful completion of initScene() is a prerequisite.
   */
  public startRenderer(): void {
    if (this.animationFrameRef) {
      this.stopRenderer();
    }
    this.render();
  }

  /**
   * Stop the rendering loop.
   * this.animationFrameRef is reset to 0;
   */
  public stopRenderer(): void {
    cancelAnimationFrame(this.animationFrameRef);
    this.animationFrameRef = 0;
  }
  

  /**
   * Provide the canvas element or create a <canvas> element into which three.js 
   * will render this.scene. When the domElement parameter is an HTMLElement other
   * than a canvas a new canvas element is created and appended to it. If
   * the domElement parameter is undefined then a canvas element is created and 
   * appended directly to the <body> element.
   *
   * @param domElement? HTMLCanvasElement | HTMLElement.
   */
  protected initCanvas(domElement?: HTMLCanvasElement | HTMLElement) {

    if (!domElement) {
      // find and create canvas element appended to <body>
      const body = document.getElementsByTagName('body')[0] as HTMLBodyElement;
      return this.initCanvas(body);
    }

    if (domElement instanceof HTMLCanvasElement) {
      this.canvas = domElement as HTMLCanvasElement;
      return;
    }

    // create and append <canvas> to domElement
    if (domElement instanceof HTMLElement) {
      this.canvas = document.createElement('canvas') as HTMLCanvasElement;
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      domElement.appendChild(this.canvas);
    }
  }

  /**
   * Create an empty three.js scene and save it internally
   */
  protected createScene() {
    this.scene = new Scene();
  }

  /**
   * Create a smple ambient light and save it internally as this.light.
   * Overriding implementations should save a light to this.light
   * prior to completion.
   */
  protected createLight() {
    // soft white light
    this.light = new AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);
  }

  /**
   * Create a PerspectiveCamera and save as this.camera.
   * Overriding implementations should save a camera to this.camera
   * prior to completion.
   */
  protected createCamera() {
    this.camera = new PerspectiveCamera(
      this.fieldOfView,
      this.getAspectRatio(),
      this.nearClippingPane,
      this.farClippingPane
    );

    // Set position and look at
    this.camera.position.z = 5;

    this.scene.add(this.camera);
  }

  /**
   * Create a WebGlRenderer and save as this.renderer.
   * Overriding implementations should save their renderer to this.renderer
   * prior to completion.
   *
   * @param optons an optional WebGLRendererParameters
   */
  protected createRenderer(options?: WebGLRendererParameters) {

    const stdOptions = {
      canvas: this.canvas,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    } as WebGLRendererParameters;

    let config = options || {} as WebGLRendererParameters;
    config = {
      ...stdOptions,
      ...config
    };

    this.renderer = new WebGLRenderer(config);
    // this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
  }

  /**
   * Add custom three.js entities to this.scene.
   * Subclassers must implement this method.
   *
   */
  protected abstract populateScene(): void;


  /**
   * Create a user control and save as this.renderer.
   * By default an OrbitControl is created. Override to create a different
   * form of control. Overriding implementations should save their control
   * to this.controls prior to completion.
   *
   * @param optons an optional WebGLRendererParameters
   */
  protected createControls() {
    this.createOrbitControls();
  }

  protected createOrbitControls() {
    //this.controls = new OrbitControls(this.camera as any, this.renderer.domElement);

    // this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    // this.controls.dampingFactor = 0.25;
    // this.controls.screenSpacePanning = true;
    // this.controls.minDistance = 100;
    // this.controls.maxDistance = 500;
    // this.controls.maxPolarAngle = Math.PI / 2;
  }

  /**
   * NOP implementation - override this method to animate zero or more scene entities.
   */
  protected animate(): void {
  }

  /**
   * Compute the aspect ratio of this.canvas
   * 
   * return number
   */
  protected getAspectRatio(): number {
    const height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  /**
   * Start rendering and animating the scene.
   */
  protected render() {
    this.resizeIfNeeded();

    this.animationFrameRef = requestAnimationFrame(() => {
      this.render();
    });

    this.animate();

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Resize the canvas if it's client area has changed size.
   * Updates the camera and renderer if needed.
   */
  protected resizeIfNeeded() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (this.canvas.width === width &&
      this.canvas.height === height) {
      return;
    }

    if (this.camera instanceof PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.setSize(width, height, this.updateCanvasStyleOnResize);
  }

}



  // /**
  //  * Find and return the first HTMLCanvasElement child of a parent HTMLElement;
  //  * otherwise return null;
  //  *
  //  * @param parentNode
  //  */
  // private findCanvasElement(parentNode: Node): Node {
  //   if (parentNode && parentNode.hasChildNodes) {
  //     const nodes = parentNode.childNodes;
  //     // tslint:disable-next-line: prefer-for-of
  //     for (let i = 0; i < nodes.length; i++) {
  //       const node = nodes[i];
  //       if (node.nodeName.toLowerCase() === 'canvas') { return node; }
  //       if (node.hasChildNodes) {
  //         return this.findCanvasElement(node);
  //       }
  //     }
  //     return null;
  //   }
  // }
  
