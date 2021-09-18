"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // look up the text canvas.
  var textCanvas = document.querySelector("#text");

  // make a 2D context for it
  var ctx = textCanvas.getContext("2d");

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);

  // lookup uniforms
  var matrixLocation = gl.getUniformLocation(program, "u_matrix");

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  var translation = [0, 30, -360];
  var rotation = [degToRad(190), degToRad(0), degToRad(0)];
  var fieldOfViewRadians = degToRad(60);

  var then = 0;

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(clock) {
    // Convert to seconds
    clock *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = clock - then;
    // Remember the current time for the next frame.
    then = clock;

    // Every frame increase the rotation a little.
    rotation[2] += deltaTime;

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    webglUtils.resizeCanvasToDisplaySize(ctx.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Clear the 2D canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Compute the matrices
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
        m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    var spread = 130;
    for (var yy = -1; yy <= 1; ++yy) {
      for (var xx = -2; xx <= 2; ++xx) {
        var matrix = m4.translate(projectionMatrix,
            translation[0] + xx * spread, translation[1] + yy * spread, translation[2]);
        matrix = m4.zRotate(matrix, -(rotation[2] + (yy * 3 + xx) * 0.1));
       
        // Set the matrix.
        gl.uniformMatrix4fv(matrixLocation, false, matrix);

        // compute a clipspace position
        // using the matrix we computed
        var clipspace = m4.transformVector(matrix, [100, 0, 0, 1]);

        // divide X and Y by W just like the GPU does.
        clipspace[0] /= clipspace[3];
        clipspace[1] /= clipspace[3];

        // convert from clipspace to pixels
        var pixelX = (clipspace[0] *  0.5 + 0.5) * gl.canvas.width;
        var pixelY = (clipspace[1] * -0.5 + 0.5) * gl.canvas.height;
        ctx.font = "18px arial";
        ctx.fillText("Hello World!", pixelX, pixelY);
      }
    }
    requestAnimationFrame(drawScene);
  }
}

main();
