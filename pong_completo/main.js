const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// PLACAR (overlay HTML simples, sem WebGL)
// --------------------------------------------------

const placar = document.createElement("div");
placar.style.position = "fixed";
placar.style.top = "12px";
placar.style.left = "50%";
placar.style.transform = "translateX(-50%)";
placar.style.color = "#fff";
placar.style.fontFamily = "monospace";
placar.style.fontSize = "28px";
document.body.appendChild(placar);

let placarEsquerda = 0;
let placarDireita = 0;

function atualizaPlacar(){
    placar.textContent = `${placarEsquerda}  x  ${placarDireita}`;
}
atualizaPlacar();

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// DIMENSÕES (usadas na colisão)
// --------------------------------------------------

const BARRA_MEIA_LARGURA = 0.05;
const BARRA_MEIA_ALTURA = 0.2;
const BOLA_RAIO = 0.05;
const LIMITE_Y = 1.0; // topo/base da tela em NDC
const LIMITE_X = 1.0; // laterais da tela em NDC

const BARRA_ESQUERDA_X = -0.9;
const BARRA_DIREITA_X = 0.9;

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let tyBarraEsquerda = 0.0;
let tyBarraDireita = 0.0;

let MbarraEsquerda = m3.translation(BARRA_ESQUERDA_X, tyBarraEsquerda);
let MbarraDireita = m3.translation(BARRA_DIREITA_X, tyBarraDireita);
let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

function drawScene(){

    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();

    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
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

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
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

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
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

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// CONTROLE DO TECLADO
// --------------------------------------------------

const teclasPressionadas = {};

window.addEventListener("keydown", (e) => {
    teclasPressionadas[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    teclasPressionadas[e.key] = false;
});

const VELOCIDADE_BARRA = 0.025;

function atualizaBarras(){
    // Barra esquerda: W (sobe) / S (desce)
    if (teclasPressionadas["w"] || teclasPressionadas["W"]) {
        tyBarraEsquerda += VELOCIDADE_BARRA;
    }
    if (teclasPressionadas["s"] || teclasPressionadas["S"]) {
        tyBarraEsquerda -= VELOCIDADE_BARRA;
    }

    // Barra direita: setas Cima / Baixo
    if (teclasPressionadas["ArrowUp"]) {
        tyBarraDireita += VELOCIDADE_BARRA;
    }
    if (teclasPressionadas["ArrowDown"]) {
        tyBarraDireita -= VELOCIDADE_BARRA;
    }

    // Impede que as barras saiam da tela
    const limite = LIMITE_Y - BARRA_MEIA_ALTURA;
    tyBarraEsquerda = Math.min(limite, Math.max(-limite, tyBarraEsquerda));
    tyBarraDireita = Math.min(limite, Math.max(-limite, tyBarraDireita));

    MbarraEsquerda = m3.translation(BARRA_ESQUERDA_X, tyBarraEsquerda);
    MbarraDireita = m3.translation(BARRA_DIREITA_X, tyBarraDireita);
}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO DA BOLA
// --------------------------------------------------

let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.012;
let tyBola_offset = 0.009;

function reiniciaBola(direcao){
    txBola = 0.0;
    tyBola = 0.0;
    txBola_offset = 0.012 * direcao;
    tyBola_offset = (Math.random() < 0.5 ? -1 : 1) * 0.009;
}

function colideComBarra(tyBarra, barraX){
    const dentroDoY =
        tyBola + BOLA_RAIO > tyBarra - BARRA_MEIA_ALTURA &&
        tyBola - BOLA_RAIO < tyBarra + BARRA_MEIA_ALTURA;

    const dentroDoX =
        txBola + BOLA_RAIO > barraX - BARRA_MEIA_LARGURA &&
        txBola - BOLA_RAIO < barraX + BARRA_MEIA_LARGURA;

    return dentroDoX && dentroDoY;
}

function atualizaAnimacao(){

    atualizaBarras();

    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // Colisão com o topo e a base da tela
    if (tyBola + BOLA_RAIO > LIMITE_Y || tyBola - BOLA_RAIO < -LIMITE_Y) {
        tyBola_offset = -tyBola_offset;
    }

    // Colisão com a barra esquerda (bola vindo da direita para a esquerda)
    if (txBola_offset < 0 && colideComBarra(tyBarraEsquerda, BARRA_ESQUERDA_X)) {
        txBola_offset = -txBola_offset;
    }

    // Colisão com a barra direita (bola vindo da esquerda para a direita)
    if (txBola_offset > 0 && colideComBarra(tyBarraDireita, BARRA_DIREITA_X)) {
        txBola_offset = -txBola_offset;
    }

    // Ponto para a direita: bola passou da barra esquerda
    if (txBola - BOLA_RAIO < -LIMITE_X) {
        placarDireita += 1;
        atualizaPlacar();
        reiniciaBola(1);
    }

    // Ponto para a esquerda: bola passou da barra direita
    if (txBola + BOLA_RAIO > LIMITE_X) {
        placarEsquerda += 1;
        atualizaPlacar();
        reiniciaBola(-1);
    }

    MbolaCentro = m3.translation(txBola, tyBola);
}


// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();