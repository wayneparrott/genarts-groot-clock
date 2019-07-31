import {
    Color, Vector2, Texture, Vector3, SplineCurve,
    BufferGeometry, LineBasicMaterial, Line, LineLoop, CatmullRomCurve3,
    LineDashedMaterial, BufferAttribute, VertexColors
} from "three-component-ts";


export class AnimatedVector extends Vector3 {
    public isActive = false;
    public startTime: number;
    public velocity = new Vector3();
    public colorFadeOutRate = 0;
    public color: Color;

    public start() {
        this.startTime = Date.now();
    }

    public stop() {
        this.isActive = false;
    }

    /**
     * Return the number of milliseconds since start()'ed.
     * Must be active otherwise return -1.
     */
    public elapsedRuntime(): number {
        if (!this.isActive) return -1;
        return Date.now() - this.startTime;
    }
}

// returns random 0 or 1
export function flipCoin(): number {
    return random(0, 499) < 250 ? 0 : 1;
}

// return random float number between min and max
export function random(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

// create a random three Color
export function randomColor(): Color {
    return new Color(Math.random(), Math.random(), Math.random());
}

// select a randomly distributed point with in a circle
export function randomPointInCircle(radius: number, x = 0, y = 0): Vector2 {
    const angle = random(0, 2 * Math.PI);
    const distance = Math.sqrt(Math.random()) * radius;

    return new Vector2(x + distance * Math.cos(angle),
        y + distance * Math.sin(angle));
}

// 
export function createImageData(base64ImageUrl: string): Promise<ImageData> {

    return new Promise((resolve, reject) => {


        const image = new Image();
        image.src = base64ImageUrl;
        image.onload = () => {

            const canvas = document.createElement("canvas") as HTMLCanvasElement;
            canvas.width = image.width;
            canvas.height = image.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0);

            const data = ctx.getImageData(0, 0, image.width,
                image.height);


            resolve(data);
        }

        image.onerror = reject;
    });
}

// from https://2pha.com/blog/threejs-easy-round-circular-particles/
// createCircleTexture('#00ff00', 256)
// createCircleTexture('rgba(100,255,100,0.5', 256)
//
export function createCircleTexture(color: string, size: number): Texture {
    var matCanvas = document.createElement('canvas');
    matCanvas.width = matCanvas.height = size;
    var matContext = matCanvas.getContext('2d');

    // create texture object from canvas.
    var texture = new Texture(matCanvas);

    // Draw a circle
    var center = size / 2;
    matContext.beginPath();
    matContext.arc(center, center, size / 2, 0, 2 * Math.PI, false);
    matContext.closePath();
    matContext.fillStyle = color;
    matContext.fill();

    // flag texture for a required update
    texture.needsUpdate = true;

    // return a texture made from the canvas
    return texture;
}

/**
 * Creates a wavy colored three.js line. 
 * 
 * @remarks
 * This method creates a wavy three.js Line. The perturbance and segmentCount 
 * determine the wavyiness of the resulting line. 
 * 
 * How it works: the segmentCount specifies how many equal length segments to divide
 * the line length into. Then each segment vertex is offset by a random value between
 * 0 and the peturbance parameter. Then a cubic spline is fit through the segment
 * vertices. If the color parameter is a [Color,Color] then a gradient of colors starting
 * with the 1st element and ending with the 2nd element is evenly distributed across each 
 * internal line segment. The resulting three.js Line is created using a geometry based
 * on the line segments vertices and a line-material.  
 * 
 * @param origin - starting point of Line
 * @param angle - angle (radians) of the line extending from the origin
 * @param length - length of the line to create, must be > 0.0
 * @param width? - width of the new line, default = 1 
 * @param color? - line color, a three.js Color or [Color,Color] specifying start and end 
 *                 gradient colors. default = random Color
 * @param perturbance? - maximum displacement of a segment vertex from the centerline of the line,
 *                       default = 0.0
 * @param segmentCount? - number of internal segments to divide the line, default = 1;
 * @param material? - line-material to use for the Line. Default = new LineBasicMaterial
 
 * @returns A new three.js Line
 *
 * @example
 * createLine(
 *     new Vector(),
 *     Math.PI/4.0,
 *     10.5)
 * 
 * createLine(
 *     new Vector10,30,-5(),
 *     Math.PI/4.0,
 *     50,
 *     3,
 *     [new Color(1,0,0),new Color(0,1,0]),
 *     0.5,
 *     25,
 *     new LineDashedMaterial({
 *          dashSize: 2,
 *          gapSize: 2}) )
 */
export function createLine(origin: Vector3, angle: number, length: number, width = 1,
    color: Color | [Color, Color] = randomColor(), perturbance = 0.0, segmentCount = 1,
    material?: LineBasicMaterial | LineDashedMaterial): Line {

    // generate points
    const segmentLength = length / segmentCount;
    const segmentPoints = new Array<Vector2>();
    const deltaX = segmentLength * Math.cos(angle);
    const deltaY = segmentLength * Math.sin(angle);

    for (let i = 0; i < segmentCount + 1; i++) {
        segmentPoints.push(
            new Vector2(
                origin.x + i * deltaX + random(-perturbance, perturbance),
                origin.y + i * deltaY + random(-perturbance, perturbance)));
    }

    const spline = new SplineCurve(segmentPoints);
    const splinePoints = spline.getPoints(segmentPoints.length);
    const geometry = new BufferGeometry().setFromPoints(splinePoints);

    if (Array.isArray(color)) {
        const vertCnt = geometry.getAttribute('position').count;
        const colors = createColorGradientBufferAttribute(color[0], color[1], vertCnt);
        geometry.addAttribute('color', colors);
    }

    const mat = material ?
        material :
        new LineBasicMaterial( {linewidth: width} );

    if (!Array.isArray(color)) {
        mat.color = color;
    } else {
        mat.vertexColors = VertexColors;
    }

    // create line and return it
    const line = new Line(geometry, mat);
    line.position.z = origin.z;
    line.computeLineDistances();

    return line;
}


// todo: revise color gradient logic such that start & end color are the same
export function createCircle(origin: Vector3, radius: number, lineWidth = 1,
    color: Color | [Color, Color] = randomColor(), perturbance = 0.0,
    segmentCount = 360, startAngle = 0,
    material?: LineBasicMaterial | LineDashedMaterial): Line {

    // generate points
    const segmentRads = 2 * Math.PI / segmentCount;
    const segmentPoints = new Array<Vector3>();

    if (flipCoin()) {
        for (let i = 0; i < segmentCount; i++) {
            const radiusPrime = radius + random(-perturbance, perturbance);
            const x = origin.x + radiusPrime * Math.cos(i * segmentRads + startAngle);
            const y = origin.y + radiusPrime * Math.sin(i * segmentRads + startAngle);
            segmentPoints.push(new Vector3(x, y, origin.z));
        }
    } else {
        for (let i = segmentCount - 1; i >= 0; i--) {
            const radiusPrime = radius + random(-perturbance, perturbance);
            const x = origin.x + radiusPrime * Math.cos(i * segmentRads + startAngle);
            const y = origin.y + radiusPrime * Math.sin(i * segmentRads + startAngle);
            segmentPoints.push(new Vector3(x, y, origin.z));
        }
    }

    const curveType = "chordal"; // chordal, centripetal, catmullrom
    const stemCurve = new CatmullRomCurve3(segmentPoints, true);
    const splinePoints = stemCurve.getPoints(360);

    const geometry = new BufferGeometry().setFromPoints(splinePoints);
    if (Array.isArray(color)) {
        const vertCnt = geometry.getAttribute('position').count;
        const colors = createColorGradientBufferAttribute(color[0], color[1], vertCnt);
        geometry.addAttribute('color', colors);
    }

    const mat = material ? material : new LineBasicMaterial({linewidth: lineWidth});

    if (!Array.isArray(color)) {
        mat.color = color;
    } else {
        mat.vertexColors = VertexColors;
    }

    // create circle Line and return it
    const circle = new LineLoop(geometry, mat);
    circle.computeLineDistances();

    return circle;
}

export function createColorGradientBufferAttribute(startColor: Color, endColor: Color, segments: number) {
    const colorCnt = segments * 3;
    let colors = new Float32Array(colorCnt);
    const lerpInc = 1.0 / segments;

    const lerpColor = startColor;
    for (let i = 0; i < colorCnt; i += 3) {

        lerpColor.lerpHSL(endColor, lerpInc);

        colors[i] = lerpColor.r;
        colors[i + 1] = lerpColor.g;
        colors[i + 2] = lerpColor.b;
    }

    return new BufferAttribute(colors, 3);
}

// do not use, buggy impl
export function createColorGradientBufferAttribute1(gradColors: Color[], segments: number) {
    const colorCnt = segments * 3;
    let colors = new Float32Array(colorCnt);

    const lerpInc = 1.0 / segments;
    const colorBreakPts = Math.min(gradColors.length - 1, segments);
    const segmentsPerBreak = Math.floor(segments / colorBreakPts);
    let idx = 0;

    console.log(colorBreakPts, segmentsPerBreak);

    for (let i = 0; i < colorBreakPts; i++) {
        const startColor = gradColors[i];
        const endColor = gradColors[i + 1];
        const lerpColor = new Color(startColor);

        for (let j = 0; j < segmentsPerBreak; j++ , idx++) {

            lerpColor.lerpHSL(endColor, lerpInc);

            colors[idx * 3] = lerpColor.r;
            colors[idx * 3 + 1] = lerpColor.g;
            colors[idx * 3 + 2] = lerpColor.b;

            //console.log(i/3, lerpAlpha, lerpColor.getHexString());
        }
    }

    //fill remaining color slots with endColor
    console.log(idx);
    for (; idx < segments; idx++) {
        const color = gradColors[gradColors.length - 1];
        colors[idx * 3] = color.r;
        colors[idx * 3 + 1] = color.g;
        colors[idx * 3 + 2] = color.b;
    }

    return new BufferAttribute(colors, 3);
}

export function addClassToBody(className: string) {
    const body = document.getElementsByTagName("BODY")[0];
    body.classList.add(className);
}

export function removeClassFromBody(className: string) {
    const body = document.getElementsByTagName("BODY")[0];
    body.classList.remove(className);
}

// https://stackoverflow.com/questions/23842320/get-all-style-attribute-colors
export const RGB_COLORS =
    [
        new Color('rgb(240, 248, 255)'),  // 'aliceblue',
        new Color('rgb(250, 235, 215)'),  // 'antiquewhite',
        new Color('rgb(0, 255, 255)'),  // 'aqua',
        new Color('rgb(127, 255, 212)'),  // 'aquamarine',
        new Color('rgb(240, 255, 255)'),  // 'azure',
        new Color('rgb(245, 245, 220)'),  // 'beige',
        new Color('rgb(255, 228, 196)'),  // 'bisque',
        new Color('rgb(0, 0, 0)'),  // 'black',
        new Color('rgb(255, 235, 205)'),  // 'blanchedalmond',
        new Color('rgb(0, 0, 255)'),  // 'blue',
        new Color('rgb(138, 43, 226)'),  // 'blueviolet',
        new Color('rgb(165, 42, 42)'),  // 'brown',
        new Color('rgb(222, 184, 135)'),  // 'burlywood',
        new Color('rgb(95, 158, 160)'),  // 'cadetblue',
        new Color('rgb(127, 255, 0)'),  // 'chartreuse',
        new Color('rgb(210, 105, 30)'),  // 'chocolate',
        new Color('rgb(255, 127, 80)'),  // 'coral',
        new Color('rgb(100, 149, 237)'),  // 'cornflowerblue',
        new Color('rgb(255, 248, 220)'),  // 'cornsilk',
        new Color('rgb(220, 20, 60)'),  // 'crimson',
        new Color('rgb(0, 0, 139)'),  // 'darkblue',
        new Color('rgb(0, 139, 139)'),  // 'darkcyan',
        new Color('rgb(184, 134, 11)'),  // 'darkgoldenrod',
        new Color('rgb(169, 169, 169)'),  // 'darkgray',
        new Color('rgb(0, 100, 0)'),  // 'darkgreen',
        new Color('rgb(189, 183, 107)'),  // 'darkkhaki',
        new Color('rgb(139, 0, 139)'),  // 'darkmagenta',
        new Color('rgb(85, 107, 47)'),  // 'darkolivegreen',
        new Color('rgb(255, 140, 0)'),  // 'darkorange',
        new Color('rgb(153, 50, 204)'),  // 'darkorchid',
        new Color('rgb(139, 0, 0)'),  // 'darkred',
        new Color('rgb(233, 150, 122)'),  // 'darksalmon',
        new Color('rgb(143, 188, 143)'),  // 'darkseagreen',
        new Color('rgb(72, 61, 139)'),  // 'darkslateblue',
        new Color('rgb(47, 79, 79)'),  // 'darkslategray',
        new Color('rgb(0, 206, 209)'),  // 'darkturquoise',
        new Color('rgb(148, 0, 211)'),  // 'darkviolet',
        new Color('rgb(255, 20, 147)'),  // 'deeppink',
        new Color('rgb(0, 191, 255)'),  // 'deepskyblue',
        new Color('rgb(105, 105, 105)'),  // 'dimgray',
        new Color('rgb(30, 144, 255)'),  // 'dodgerblue',
        new Color('rgb(178, 34, 34)'),  // 'firebrick',
        new Color('rgb(255, 250, 240)'),  // 'floralwhite',
        new Color('rgb(34, 139, 34)'),  // 'forestgreen',
        new Color('rgb(255, 0, 255)'),  // 'fuchsia',
        new Color('rgb(220, 220, 220)'),  // 'gainsboro',
        new Color('rgb(248, 248, 255)'),  // 'ghostwhite',
        new Color('rgb(255, 215, 0)'),  // 'gold',
        new Color('rgb(218, 165, 32)'),  // 'goldenrod',
        new Color('rgb(128, 128, 128)'),  // 'gray',
        new Color('rgb(0, 128, 0)'),  // 'green',
        new Color('rgb(173, 255, 47)'),  // 'greenyellow',
        new Color('rgb(240, 255, 240)'),  // 'honeydew',
        new Color('rgb(255, 105, 180)'),  // 'hotpink',
        new Color('rgb(205, 92, 92)'),  // 'indianred',
        new Color('rgb(75, 0, 130)'),  // 'indigo',
        new Color('rgb(255, 255, 240)'),  // 'ivory',
        new Color('rgb(240, 230, 140)'),  // 'khaki',
        new Color('rgb(230, 230, 250)'),  // 'lavender',
        new Color('rgb(255, 240, 245)'),  // 'lavenderblush',
        new Color('rgb(124, 252, 0)'),  // 'lawngreen',
        new Color('rgb(255, 250, 205)'),  // 'lemonchiffon',
        new Color('rgb(173, 216, 230)'),  // 'lightblue',
        new Color('rgb(240, 128, 128)'),  // 'lightcoral',
        new Color('rgb(224, 255, 255)'),  // 'lightcyan',
        new Color('rgb(250, 250, 210)'),  // 'lightgoldenrodyellow',
        new Color('rgb(211, 211, 211)'),  // 'lightgray',
        new Color('rgb(144, 238, 144)'),  // 'lightgreen',
        new Color('rgb(255, 182, 193)'),  // 'lightpink',
        new Color('rgb(255, 160, 122)'),  // 'lightsalmon',
        new Color('rgb(32, 178, 170)'),  // 'lightseagreen',
        new Color('rgb(135, 206, 250)'),  // 'lightskyblue',
        new Color('rgb(119, 136, 153)'),  // 'lightslategray',
        new Color('rgb(176, 196, 222)'),  // 'lightsteelblue',
        new Color('rgb(255, 255, 224)'),  // 'lightyellow',
        new Color('rgb(0, 255, 0)'),  // 'lime',
        new Color('rgb(50, 205, 50)'),  // 'limegreen',
        new Color('rgb(250, 240, 230)'),  // 'linen',
        new Color('rgb(128, 0, 0)'),  // 'maroon',
        new Color('rgb(102, 205, 170)'),  // 'mediumaquamarine',
        new Color('rgb(0, 0, 205)'),  // 'mediumblue',
        new Color('rgb(186, 85, 211)'),  // 'mediumorchid',
        new Color('rgb(147, 112, 219)'),  // 'mediumpurple',
        new Color('rgb(60, 179, 113)'),  // 'mediumseagreen',
        new Color('rgb(123, 104, 238)'),  // 'mediumslateblue',
        new Color('rgb(0, 250, 154)'),  // 'mediumspringgreen',
        new Color('rgb(72, 209, 204)'),  // 'mediumturquoise',
        new Color('rgb(199, 21, 133)'),  // 'mediumvioletred',
        new Color('rgb(25, 25, 112)'),  // 'midnightblue',
        new Color('rgb(245, 255, 250)'),  // 'mintcream',
        new Color('rgb(255, 228, 225)'),  // 'mistyrose',
        new Color('rgb(255, 228, 181)'),  // 'moccasin',
        new Color('rgb(255, 222, 173)'),  // 'navajowhite',
        new Color('rgb(0, 0, 128)'),  // 'navy',
        new Color('rgb(253, 245, 230)'),  // 'oldlace',
        new Color('rgb(128, 128, 0)'),  // 'olive',
        new Color('rgb(107, 142, 35)'),  // 'olivedrab',
        new Color('rgb(255, 165, 0)'),  // 'orange',
        new Color('rgb(255, 69, 0)'),  // 'orangered',
        new Color('rgb(218, 112, 214)'),  // 'orchid',
        new Color('rgb(238, 232, 170)'),  // 'palegoldenrod',
        new Color('rgb(152, 251, 152)'),  // 'palegreen',
        new Color('rgb(175, 238, 238)'),  // 'paleturquoise',
        new Color('rgb(219, 112, 147)'),  // 'palevioletred',
        new Color('rgb(255, 239, 213)'),  // 'papayawhip',
        new Color('rgb(255, 218, 185)'),  // 'peachpuff',
        new Color('rgb(205, 133, 63)'),  // 'peru',
        new Color('rgb(255, 192, 203)'),  // 'pink',
        new Color('rgb(221, 160, 221)'),  // 'plum',
        new Color('rgb(176, 224, 230)'),  // 'powderblue',
        new Color('rgb(128, 0, 128)'),  // 'purple',
        new Color('rgb(255, 0, 0)'),  // 'red',
        new Color('rgb(188, 143, 143)'),  // 'rosybrown',
        new Color('rgb(65, 105, 225)'),  // 'royalblue',
        new Color('rgb(139, 69, 19)'),  // 'saddlebrown',
        new Color('rgb(250, 128, 114)'),  // 'salmon',
        new Color('rgb(244, 164, 96)'),  // 'sandybrown',
        new Color('rgb(46, 139, 87)'),  // 'seagreen',
        new Color('rgb(255, 245, 238)'),  // 'seashell',
        new Color('rgb(160, 82, 45)'),  // 'sienna',
        new Color('rgb(192, 192, 192)'),  // 'silver',
        new Color('rgb(135, 206, 235)'),  // 'skyblue',
        new Color('rgb(106, 90, 205)'),  // 'slateblue',
        new Color('rgb(112, 128, 144)'),  // 'slategray',
        new Color('rgb(255, 250, 250)'),  // 'snow',
        new Color('rgb(0, 255, 127)'),  // 'springgreen',
        new Color('rgb(70, 130, 180)'),  // 'steelblue',
        new Color('rgb(210, 180, 140)'),  // 'tan',
        new Color('rgb(0, 128, 128)'),  // 'teal',
        new Color('rgb(216, 191, 216)'),  // 'thistle',
        new Color('rgb(255, 99, 71)'),  // 'tomato',
        new Color('rgb(64, 224, 208)'),  // 'turquoise',
        new Color('rgb(238, 130, 238)'),  // 'violet',
        new Color('rgb(245, 222, 179)'),  // 'wheat',
        new Color('rgb(255, 255, 255)'),  // 'white',
        new Color('rgb(245, 245, 245)'),  // 'whitesmoke',
        new Color('rgb(255, 255, 0)'),  // 'yellow',
        new Color('rgb(154, 205, 50)'),  // 'yellowgreen'
    ];


