// Generated by CoffeeScript 1.3.1
(function() {
  var CompileProgram, InitBuffers, MobiusTube, NORMAL, POSITION, Render, Slices, Stacks, TEXCOORD, TWOPI, VERTEXID, abs, cos, pow, programs, root, sgn, sin, theta, vbos, _ref;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  VERTEXID = 0;

  POSITION = 0;

  NORMAL = 1;

  TEXCOORD = 2;

  Slices = 32;

  Stacks = 96;

  TWOPI = 2 * Math.PI;

  theta = 0;

  programs = {};

  vbos = {};

  _ref = [Math.sin, Math.cos, Math.pow, Math.abs], sin = _ref[0], cos = _ref[1], pow = _ref[2], abs = _ref[3];

  sgn = function(x) {
    if (x > 0) {
      return +1;
    } else {
      if (x < 0) {
        return -1;
      } else {
        return 0;
      }
    }
  };

  Render = function() {
    var aspect, canvas, eye, far, fov, gl, h, model, modelview, near, normalMatrix, offset, program, projection, stride, target, up, view, w;
    projection = mat4.perspective(fov = 45, aspect = 1, near = 5, far = 90);
    view = mat4.lookAt(eye = [0, -5, 5], target = [0, 0, 0], up = [0, 1, 0]);
    model = mat4.create();
    modelview = mat4.create();
    mat4.identity(model);
    mat4.rotateY(model, theta);
    mat4.multiply(view, model, modelview);
    normalMatrix = mat4.toMat3(modelview);
    theta += 0.02;
    gl = root.gl;
    canvas = $("canvas");
    w = parseInt(canvas.css('width'));
    h = parseInt(canvas.css('height'));
    program = programs.vignette;
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(program);
    gl.uniform2f(program.viewport, w, h);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.bigtri);
    gl.enableVertexAttribArray(VERTEXID);
    gl.vertexAttribPointer(VERTEXID, 2, gl.FLOAT, false, stride = 8, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(VERTEXID);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    program = programs.mesh;
    gl.useProgram(program);
    gl.uniformMatrix4fv(program.projection, false, projection);
    gl.uniformMatrix4fv(program.modelview, false, modelview);
    gl.uniformMatrix3fv(program.normalmatrix, false, normalMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.mesh);
    gl.enableVertexAttribArray(POSITION);
    gl.enableVertexAttribArray(NORMAL);
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, stride = 32, 0);
    gl.vertexAttribPointer(NORMAL, 3, gl.FLOAT, false, stride = 32, offset = 12);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbos.faces);
    gl.drawElements(gl.TRIANGLES, vbos.faces.count, gl.UNSIGNED_SHORT, 0);
    gl.disableVertexAttribArray(POSITION);
    gl.disableVertexAttribArray(NORMAL);
    if (gl.getError() !== gl.NO_ERROR) {
      return glerr("Render");
    }
  };

  InitBuffers = function() {
    var A, B, BmA, C, CmA, EPSILON, N, corners, faceCount, gl, i, j, msg, n, next, p, ptr, rawBuffer, slice, stack, tri, u, v, vbo, vertex, _ref1, _ref2, _ref3, _ref4;
    rawBuffer = new Float32Array(Slices * Stacks * 8);
    _ref1 = [-1, 0], slice = _ref1[0], i = _ref1[1];
    BmA = CmA = n = N = vec3.create();
    EPSILON = 0.00001;
    while (++slice < Slices) {
      _ref2 = [slice * TWOPI / (Slices - 1), -1], v = _ref2[0], stack = _ref2[1];
      while (++stack < Stacks) {
        u = stack * TWOPI / (Stacks - 1);
        A = p = MobiusTube(u, v);
        B = MobiusTube(u + EPSILON, v);
        C = MobiusTube(u, v + EPSILON);
        BmA = vec3.subtract(B, A);
        CmA = vec3.subtract(C, A);
        n = vec3.cross(BmA, CmA);
        n = vec3.normalize(n);
        _ref3 = [rawBuffer.subarray(i, i + 8), i + 8], vertex = _ref3[0], i = _ref3[1];
        vertex[0] = p[0];
        vertex[1] = p[1];
        vertex[2] = p[2];
        vertex[3] = n[0];
        vertex[4] = n[1];
        vertex[5] = n[2];
        vertex[6] = u;
        vertex[7] = v;
      }
    }
    msg = "" + i + " floats generated from " + Slices + " slices and " + Stacks + " stacks.";
    console.log(msg);
    gl = root.gl;
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW);
    vbos.mesh = vbo;
    faceCount = (Slices - 1) * Stacks * 2;
    rawBuffer = new Uint16Array(faceCount * 3);
    _ref4 = [0, 0, 0], i = _ref4[0], ptr = _ref4[1], v = _ref4[2];
    while (++i < Slices) {
      j = -1;
      while (++j < Stacks) {
        next = (j + 1) % Stacks;
        tri = rawBuffer.subarray(ptr + 0, ptr + 3);
        tri[2] = v + next + Stacks;
        tri[1] = v + next;
        tri[0] = v + j;
        tri = rawBuffer.subarray(ptr + 3, ptr + 6);
        tri[2] = v + j;
        tri[1] = v + j + Stacks;
        tri[0] = v + next + Stacks;
        ptr += 6;
      }
      v += Stacks;
    }
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW);
    vbos.faces = vbo;
    vbos.faces.count = rawBuffer.length;
    corners = [-1, 3, -1, -1, 3, -1];
    rawBuffer = new Float32Array(corners);
    vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW);
    return vbos.bigtri = vbo;
  };

  MobiusTube = function(u, v) {
    var R, n, x, y, z, _ref1;
    _ref1 = [1.5, 3], R = _ref1[0], n = _ref1[1];
    x = (1.0 * R + 0.125 * sin(u / 2) * pow(abs(sin(v)), 2 / n) * sgn(sin(v)) + 0.5 * cos(u / 2) * pow(abs(cos(v)), 2 / n) * sgn(cos(v))) * cos(u);
    y = (1.0 * R + 0.125 * sin(u / 2) * pow(abs(sin(v)), 2 / n) * sgn(sin(v)) + 0.5 * cos(u / 2) * pow(abs(cos(v)), 2 / n) * sgn(cos(v))) * sin(u);
    z = -0.5 * sin(u / 2) * pow(abs(cos(v)), 2 / n) * sgn(cos(v)) + 0.125 * cos(u / 2) * pow(abs(sin(v)), 2 / n) * sgn(sin(v));
    return [x, y, z];
  };

  CompileProgram = function(vName, fName, attribs, uniforms) {
    var fs, key, program, value, vs;
    vs = getShader(gl, vName);
    fs = getShader(gl, fName);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    for (key in attribs) {
      value = attribs[key];
      gl.bindAttribLocation(program, value, key);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      glerr('Could not link #{vName} with #{fName}');
    }
    for (key in uniforms) {
      value = uniforms[key];
      program[value] = gl.getUniformLocation(program, key);
    }
    return program;
  };

  root.AppInit = function() {
    var attribs, canvas, gl, h, unif, uniforms, w;
    canvas = $("canvas");
    w = parseInt(canvas.css('width'));
    h = parseInt(canvas.css('height'));
    canvas.css('margin-left', -w / 2);
    canvas.css('margin-top', -h / 2);
    root.gl = gl = canvas.get(0).getContext("experimental-webgl", {
      antialias: true
    });
    if (!gl.getExtension("OES_texture_float")) {
      glerr("Your browser does not support floating-point textures.");
    }
    if (!gl.getExtension("OES_standard_derivatives")) {
      glerr("Your browser does not support GLSL derivatives.");
    }
    InitBuffers();
    attribs = {
      Position: POSITION,
      Normal: NORMAL
    };
    unif = {
      Projection: 'projection',
      Modelview: 'modelview',
      NormalMatrix: 'normalmatrix'
    };
    programs.mesh = CompileProgram("VS-Scene", "FS-Scene", attribs, unif);
    attribs = {
      VertexID: VERTEXID
    };
    uniforms = {
      Viewport: 'viewport'
    };
    programs.vignette = CompileProgram("VS-Vignette", "FS-Vignette", attribs, uniforms);
    gl.disable(gl.CULL_FACE);
    if (gl.getError() !== gl.NO_ERROR) {
      glerr("OpenGL error during init");
    }
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    root.gl = gl;
    return setInterval(Render, 15);
  };

}).call(this);
