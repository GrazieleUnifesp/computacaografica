const canvas = document.getElementById("canvas");

const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL não é suportado!");
}


const vertexShaderSource = `

    attribute vec2 position;

    void main() {

        gl_Position = vec4(position, 0.0, 1.0);

    }

`;


const fragmentShaderSource = `

    precision mediump float;

    uniform vec4 color;

    void main(){

        gl_FragColor = color;

    }

`;


function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    return shader;
}


const vertexShader = createShader(
    gl.VERTEX_SHADER,
    vertexShaderSource
);


const fragmentShader = createShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


const program = gl.createProgram();

gl.attachShader(program, vertexShader);

gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

gl.useProgram(program);


const positionLocation =
    gl.getAttribLocation(program, "position");

const colorLocation =
    gl.getUniformLocation(program, "color");


function createCircle(cx, cy, radius, segments = 30) {

    const vertices = [];

    vertices.push(cx, cy);

    for (let i = 0; i <= segments; i++) {

        const angle =
            i * 2 * Math.PI / segments;

        const x =
            cx + Math.cos(angle) * radius;

        const y =
            cy + Math.sin(angle) * radius;

        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}

function drawShape(vertices, color) {

    const buffer = gl.createBuffer();

    gl.bindBuffer(
        gl.ARRAY_BUFFER,
        buffer
    );

    gl.bufferData(
        gl.ARRAY_BUFFER,
        vertices,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(
        positionLocation
    );

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform4fv(
        colorLocation,
        color
    );

    gl.drawArrays(
        gl.TRIANGLE_FAN,
        0,
        vertices.length / 2
    );
}


const petalas = 6;

for (let i = 0; i < petalas; i++) {

    const angle = i * 2 * Math.PI / petalas;

    const x = Math.cos(angle) * 0.40;
    const y = Math.sin(angle) * 0.40;

    const sombra = createCircle(
        x + 0.04,
        y - 0.04,
        0.31
    );

    drawShape(
        sombra,
        [0.45, 0.03, 0.15, 1.0]
    );
}


for (let i = 0; i < petalas; i++) {

    const angle = i * 2 * Math.PI / petalas;

    const x = Math.cos(angle) * 0.40;
    const y = Math.sin(angle) * 0.40;

    const petal = createCircle(
        x,
        y,
        0.3
    );

    drawShape(
        petal,
        [1.0, 0.2, 0.5, 1.0]
    );
}

const sombraCentro = createCircle(
    0.03,
    -0.04,
    0.26
);

drawShape(
    sombraCentro,
    [0.6, 0.3, 0.0, 1.0]
);


const centro = createCircle(
    0,
    0,
    0.25
);

drawShape(
    centro,
    [1.0, 0.8, 0.0, 1.0]
);