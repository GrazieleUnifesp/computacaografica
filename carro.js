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

    void main() {

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

function createRectangle(x, y, width, height) {

    return new Float32Array([

        x - width / 2, y - height / 2,
        x + width / 2, y - height / 2,
        x + width / 2, y + height / 2,

        x - width / 2, y - height / 2,
        x + width / 2, y + height / 2,
        x - width / 2, y + height / 2

    ]);
}

function drawShape(vertices, color, mode) {

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

    gl.enableVertexAttribArray(positionLocation);

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
        mode,
        0,
        vertices.length / 2
    );
}

const carroceria = createRectangle(
    0,
    -0.1,
    0.8,
    0.35
);

drawShape(
    carroceria,
    [1.0, 0.2, 0.6, 1.0],
    gl.TRIANGLES
);

const cabine = createRectangle(
    0,
    0.15,
    0.5,
    0.25
);

drawShape(
    cabine,
    [1.0, 0.2, 0.6, 1.0],
    gl.TRIANGLES
);

const vidroEsquerdo = createRectangle(
    -0.13,
    0.15,
    0.18,
    0.15
);

drawShape(
    vidroEsquerdo,
    [0.2, 0.7, 1.0, 1.0],
    gl.TRIANGLES
);


const vidroDireito = createRectangle(
    0.13,
    0.15,
    0.18,
    0.15
);

drawShape(
    vidroDireito,
    [0.2, 0.7, 1.0, 1.0],
    gl.TRIANGLES
);

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

const rodaEsquerda = createCircle(
    -0.25,
    -0.28,
    0.12
);

drawShape(
    rodaEsquerda,
    [0.3, 0.3, 0.3, 1.0],
    gl.TRIANGLE_FAN
);

const rodaDireita = createCircle(
    0.25,
    -0.28,
    0.12
);

drawShape(
    rodaDireita,
    [0.3,0.30, 0.30, 1.0],
    gl.TRIANGLE_FAN
);