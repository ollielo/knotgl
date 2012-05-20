// Generated by CoffeeScript 1.3.1
(function() {
  var Renderer, Style, TWOPI, abs, cos, dot, f, pow, root, sgn, sin, staticRender, _ref;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Style = {
    WIREFRAME: 0,
    SILHOUETTE: 1,
    RINGS: 2
  };

  Renderer = (function() {

    Renderer.name = 'Renderer';

    function Renderer(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;
      this.radiansPerSecond = 0.0003;
      this.spinning = true;
      this.style = Style.WIREFRAME;
      this.sketchy = true;
      this.theta = 0;
      this.vbos = {};
      this.programs = {};
      this.tubeGen = new root.TubeGenerator;
      this.tubeGen.polygonSides = 10;
      this.tubeGen.bézierSlices = 3;
      this.tubeGen.tangentSmoothness = 3;
      this.compileShaders();
      this.gl.disable(this.gl.CULL_FACE);
      if (this.gl.getError() !== this.gl.NO_ERROR) {
        glerr("OpenGL error during init");
      }
      this.downloadSpines();
    }

    Renderer.prototype.onDownloadComplete = function(data) {
      var rawVerts;
      rawVerts = data['centerlines'];
      this.spines = new Float32Array(rawVerts);
      this.vbos.spines = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbos.spines);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.spines, this.gl.STATIC_DRAW);
      if (this.gl.getError() !== this.gl.NO_ERROR) {
        glerr("Error when trying to create spine VBO");
      }
      toast("downloaded " + (this.spines.length / 3) + " verts of spine data");
      this.genVertexBuffers();
      return this.render();
    };

    Renderer.prototype.downloadSpines = function() {
      var worker;
      worker = new Worker('js/downloader.js');
      worker.renderer = this;
      worker.onmessage = function(response) {
        return this.renderer.onDownloadComplete(response.data);
      };
      return worker.postMessage(document.URL + 'data/centerlines.bin');
    };

    Renderer.prototype.compileShaders = function() {
      var fs, metadata, name, vs, _ref, _ref1, _results;
      _ref = root.shaders;
      _results = [];
      for (name in _ref) {
        metadata = _ref[name];
        if (name === "source") {
          continue;
        }
        _ref1 = metadata.keys, vs = _ref1[0], fs = _ref1[1];
        _results.push(this.programs[name] = this.compileProgram(vs, fs, metadata.attribs, metadata.uniforms));
      }
      return _results;
    };

    Renderer.prototype.render = function() {
      var aspect, currentTime, elapsed, eye, far, fov, knot, model, modelview, near, normalMatrix, offset, program, projection, setColor, startVertex, stride, target, up, vertexCount, view, x, y, _i, _j, _k, _len, _ref, _ref1;
      window.requestAnimFrame(staticRender, $("canvas").get(0));
      projection = mat4.perspective(fov = 45, aspect = 1, near = 5, far = 90);
      view = mat4.lookAt(eye = [0, -5, 5], target = [0, 0, 0], up = [0, 1, 0]);
      model = mat4.create();
      modelview = mat4.create();
      mat4.identity(model);
      mat4.rotateX(model, 3.14 / 4);
      mat4.rotateY(model, this.theta);
      mat4.multiply(view, model, modelview);
      normalMatrix = mat4.toMat3(modelview);
      currentTime = new Date().getTime();
      if (this.previousTime != null) {
        elapsed = currentTime - this.previousTime;
        if (this.spinning) {
          this.theta += this.radiansPerSecond * elapsed;
        }
      }
      this.previousTime = currentTime;
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.DEPTH_BUFFER_BIT | this.gl.COLOR_BUFFER_BIT);
      _ref = this.links[0];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        knot = _ref[_i];
        setColor = function(gl, color) {
          return gl.uniform4fv(color, knot.color);
        };
        this.gl.viewport(0, 0, this.width / 12, this.height / 12);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        program = this.programs.wireframe;
        this.gl.useProgram(program);
        setColor(this.gl, program.color);
        this.gl.uniformMatrix4fv(program.projection, false, projection);
        this.gl.uniformMatrix4fv(program.modelview, false, modelview);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbos.spines);
        this.gl.enableVertexAttribArray(POSITION);
        this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 12, 0);
        this.gl.uniform1f(program.scale, this.tubeGen.scale);
        this.gl.uniform4f(program.color, 0, 0, 0, 1);
        _ref1 = knot.centerline, startVertex = _ref1[0], vertexCount = _ref1[1];
        this.gl.disable(this.gl.BLEND);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.lineWidth(2);
        for (x = _j = -1; _j <= 1; x = _j += 2) {
          for (y = _k = -1; _k <= 1; y = _k += 2) {
            this.gl.uniform2f(program.offset, x, y);
            this.gl.drawArrays(this.gl.LINE_LOOP, startVertex, vertexCount);
          }
        }
        this.gl.enable(this.gl.BLEND);
        this.gl.lineWidth(2);
        setColor(this.gl, program.color);
        this.gl.uniform2f(program.offset, 0, 0);
        this.gl.uniform1f(program.depthOffset, -0.5);
        this.gl.drawArrays(this.gl.LINE_LOOP, startVertex, vertexCount);
        this.gl.disableVertexAttribArray(POSITION);
        this.gl.viewport(0, 0, this.width, this.height);
        program = this.programs.solidmesh;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.useProgram(program);
        setColor(this.gl, program.color);
        this.gl.uniformMatrix4fv(program.projection, false, projection);
        this.gl.uniformMatrix4fv(program.modelview, false, modelview);
        this.gl.uniformMatrix3fv(program.normalmatrix, false, normalMatrix);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, knot.tube);
        this.gl.enableVertexAttribArray(POSITION);
        this.gl.enableVertexAttribArray(NORMAL);
        this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 24, 0);
        this.gl.vertexAttribPointer(NORMAL, 3, this.gl.FLOAT, false, stride = 24, offset = 12);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, knot.triangles);
        if (this.style !== Style.WIREFRAME) {
          this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
          this.gl.polygonOffset(-1, 12);
        }
        this.gl.drawElements(this.gl.TRIANGLES, knot.triangles.count, this.gl.UNSIGNED_SHORT, 0);
        this.gl.disableVertexAttribArray(POSITION);
        this.gl.disableVertexAttribArray(NORMAL);
        this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        program = this.programs.wireframe;
        this.gl.useProgram(program);
        this.gl.uniformMatrix4fv(program.projection, false, projection);
        this.gl.uniformMatrix4fv(program.modelview, false, modelview);
        this.gl.uniform1f(program.scale, 1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, knot.tube);
        this.gl.enableVertexAttribArray(POSITION);
        this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 24, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, knot.wireframe);
        if (this.style === Style.WIREFRAME) {
          this.gl.lineWidth(1);
          this.gl.uniform1f(program.depthOffset, -0.01);
          this.gl.uniform4f(program.color, 0, 0, 0, 0.75);
          this.gl.drawElements(this.gl.LINES, knot.wireframe.count, this.gl.UNSIGNED_SHORT, 0);
        } else if (this.style === Style.RINGS) {
          this.gl.lineWidth(1);
          this.gl.uniform1f(program.depthOffset, -0.01);
          this.gl.uniform4f(program.color, 0, 0, 0, 0.75);
          this.gl.drawElements(this.gl.LINES, knot.wireframe.count / 2, this.gl.UNSIGNED_SHORT, knot.wireframe.count);
        } else {
          this.gl.lineWidth(2);
          this.gl.uniform1f(program.depthOffset, 0.01);
          this.gl.uniform4f(program.color, 0, 0, 0, 1);
          this.gl.drawElements(this.gl.LINES, knot.wireframe.count, this.gl.UNSIGNED_SHORT, 0);
          if (this.sketchy) {
            this.gl.lineWidth(1);
            this.gl.uniform4f(program.color, 0.1, 0.1, 0.1, 1);
            this.gl.uniform1f(program.depthOffset, -0.01);
            this.gl.drawElements(this.gl.LINES, knot.wireframe.count / 2, this.gl.UNSIGNED_SHORT, knot.wireframe.count);
          }
        }
        this.gl.disableVertexAttribArray(POSITION);
      }
      if (this.gl.getError() !== this.gl.NO_ERROR) {
        return glerr("Render");
      }
    };

    Renderer.prototype.getLink = function(id) {
      var x;
      return ((function() {
        var _i, _len, _ref, _results;
        _ref = root.links;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          x = _ref[_i];
          if (x[0] === id) {
            _results.push(x.slice(1));
          }
        }
        return _results;
      })())[0];
    };

    Renderer.prototype.genVertexBuffers = function() {
      var component, id, knots, selectedLinks, _i, _len, _results;
      selectedLinks = ["7.2.3", "7.2.4", "7.2.5", "7.2.6", "7.2.7", "7.2.8", "8.2.1", "8.2.2", "8.2.3"];
      this.links = [];
      _results = [];
      for (_i = 0, _len = selectedLinks.length; _i < _len; _i++) {
        id = selectedLinks[_i];
        knots = (function() {
          var _j, _len1, _ref, _results1;
          _ref = this.getLink(id);
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            component = _ref[_j];
            _results1.push(this.tessKnot(component));
          }
          return _results1;
        }).call(this);
        knots[0].color = [1, 1, 1, 0.75];
        if (knots.length > 1) {
          knots[1].color = [0.25, 0.5, 1, 0.75];
        }
        if (knots.length > 2) {
          knots[2].color = [1, 0.5, 0.25, 0.75];
        }
        _results.push(this.links.push(knots));
      }
      return _results;
    };

    Renderer.prototype.tessKnot = function(component) {
      var byteOffset, centerline, faceCount, i, j, knot, lineCount, next, numFloats, polygonCount, polygonEdge, ptr, rawBuffer, segmentData, sides, sweepEdge, tri, triangles, tube, v, vbo, wireframe, _ref, _ref1, _ref2, _ref3;
      byteOffset = component[0] * 3 * 4;
      numFloats = component[1] * 3;
      segmentData = this.spines.subarray(component[0] * 3, component[0] * 3 + component[1] * 3);
      centerline = this.tubeGen.getKnotPath(segmentData);
      rawBuffer = this.tubeGen.generateTube(centerline);
      vbo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, rawBuffer, this.gl.STATIC_DRAW);
      console.log("Tube positions has " + (rawBuffer.length / 3) + " verts.");
      tube = vbo;
      polygonCount = centerline.length / 3 - 1;
      sides = this.tubeGen.polygonSides;
      lineCount = polygonCount * sides * 2;
      rawBuffer = new Uint16Array(lineCount * 2);
      _ref = [0, 0], i = _ref[0], ptr = _ref[1];
      while (i < polygonCount * (sides + 1)) {
        j = 0;
        while (j < sides) {
          sweepEdge = rawBuffer.subarray(ptr + 2, ptr + 4);
          sweepEdge[0] = i + j;
          sweepEdge[1] = i + j + sides + 1;
          _ref1 = [ptr + 2, j + 1], ptr = _ref1[0], j = _ref1[1];
        }
        i += sides + 1;
      }
      i = 0;
      while (i < polygonCount * (sides + 1)) {
        j = 0;
        while (j < sides) {
          polygonEdge = rawBuffer.subarray(ptr + 0, ptr + 2);
          polygonEdge[0] = i + j;
          polygonEdge[1] = i + j + 1;
          _ref2 = [ptr + 2, j + 1], ptr = _ref2[0], j = _ref2[1];
        }
        i += sides + 1;
      }
      vbo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vbo);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, rawBuffer, this.gl.STATIC_DRAW);
      wireframe = vbo;
      wireframe.count = rawBuffer.length;
      console.log("Tube wireframe has " + rawBuffer.length + " indices for " + sides + " sides and " + (centerline.length / 3 - 1) + " polygons.");
      faceCount = centerline.length / 3 * sides * 2;
      rawBuffer = new Uint16Array(faceCount * 3);
      _ref3 = [0, 0, 0], i = _ref3[0], ptr = _ref3[1], v = _ref3[2];
      while (++i < centerline.length / 3) {
        j = -1;
        while (++j < sides) {
          next = (j + 1) % sides;
          tri = rawBuffer.subarray(ptr + 0, ptr + 3);
          tri[0] = v + next + sides + 1;
          tri[1] = v + next;
          tri[2] = v + j;
          tri = rawBuffer.subarray(ptr + 3, ptr + 6);
          tri[0] = v + j;
          tri[1] = v + j + sides + 1;
          tri[2] = v + next + sides + 1;
          ptr += 6;
        }
        v += sides + 1;
      }
      vbo = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vbo);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, rawBuffer, this.gl.STATIC_DRAW);
      triangles = vbo;
      triangles.count = rawBuffer.length;
      return knot = {
        centerline: component,
        tube: tube,
        wireframe: wireframe,
        triangles: triangles
      };
    };

    Renderer.prototype.compileProgram = function(vName, fName, attribs, uniforms) {
      var compileShader, fShader, fSource, key, program, status, vShader, vSource, value;
      compileShader = function(gl, name, handle) {
        var status;
        gl.compileShader(handle);
        status = gl.getShaderParameter(handle, gl.COMPILE_STATUS);
        if (!status) {
          return $.gritter.add({
            title: "GLSL Error: " + name,
            text: gl.getShaderInfoLog(handle)
          });
        }
      };
      vSource = root.shaders.source[vName];
      vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.gl.shaderSource(vShader, vSource);
      compileShader(this.gl, vName, vShader);
      fSource = root.shaders.source[fName];
      fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
      this.gl.shaderSource(fShader, fSource);
      compileShader(this.gl, fName, fShader);
      program = this.gl.createProgram();
      this.gl.attachShader(program, vShader);
      this.gl.attachShader(program, fShader);
      for (key in attribs) {
        value = attribs[key];
        this.gl.bindAttribLocation(program, value, key);
      }
      this.gl.linkProgram(program);
      status = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
      if (!status) {
        glerr("Could not link " + vName + " with " + fName);
      }
      for (key in uniforms) {
        value = uniforms[key];
        program[value] = this.gl.getUniformLocation(program, key);
      }
      return program;
    };

    return Renderer;

  })();

  root.Renderer = Renderer;

  _ref = (function() {
    var _i, _len, _ref, _results;
    _ref = "sin cos pow abs".split(' ');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      _results.push(Math[f]);
    }
    return _results;
  })(), sin = _ref[0], cos = _ref[1], pow = _ref[2], abs = _ref[3];

  dot = vec3.dot;

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

  TWOPI = 2 * Math.PI;

  staticRender = function() {
    return root.renderer.render();
  };

}).call(this);
