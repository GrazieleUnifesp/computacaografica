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
        mode,
        0,
        vertices.length / 2
    );
}

const corpo = createRectangle(
    0,
    0,
    0.5,
    0.6
);

drawShape(
    corpo,
    [0.5, 0.5, 0.5, 1.0],
    gl.TRIANGLES
);

const cabeca = createRectangle(
    0,
    0.55,
    0.6,
    0.4
);

drawShape(
    cabeca,
    [0.5, 0.5, 0.5, 1.0],
    gl.TRIANGLES
);

const olhoEsquerdo = createCircle(
    -0.15,
    0.58,
    0.06
);

drawShape(
    olhoEsquerdo,
    [1.0, 0.0, 0.0, 1.0],
    gl.TRIANGLE_FAN
);


const olhoDireito = createCircle(
    0.15,
    0.58,
    0.06
);

drawShape(
    olhoDireito,
    [1.0, 0.0, 0.0, 1.0],
    gl.TRIANGLE_FAN
);

const bracoEsquerdo = createRectangle(
    -0.35,
    0.08,
    0.15,
    0.4
);

drawShape(
    bracoEsquerdo,
    [0.0, 0.3, 1.0, 1.0],
    gl.TRIANGLES
);

const bracoDireito = createRectangle(
    0.35,
    0.08,
    0.15,
    0.4
);

drawShape(
    bracoDireito,
    [0.0, 0.3, 1.0, 1.0],
    gl.TRIANGLES
);

const pernaEsquerda = createRectangle(
    -0.12,
    -0.42,
    0.20,
    0.15
);

drawShape(
    pernaEsquerda,
    [0.0, 0.3, 1.0, 1.0],
    gl.TRIANGLES
);

const pernaDireita = createRectangle(
    0.12,
    -0.42,
    0.20,
    0.15
);

drawShape(
    pernaDireita,
    [0.0, 0.3, 1.0, 1.0],
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