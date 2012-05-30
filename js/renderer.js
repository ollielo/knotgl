// Generated by CoffeeScript 1.3.1
(function() {
  var Renderer, Style, TWOPI, aabb, abs, cos, dot, f, pow, root, sgn, sin, _ref;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  Renderer = (function() {

    Renderer.name = 'Renderer';

    function Renderer(gl, width, height) {
      this.gl = gl;
      this.width = width;
      this.height = height;
      this.radiansPerSecond = 0.0003;
      this.transitionMilliseconds = 750;
      this.style = Style.SILHOUETTE;
      this.sketchy = true;
      this.vbos = {};
      this.programs = {};
      this.selectedColumn = 0;
      this.selectedRow = 9;
      this.hotMouse = false;
      this.tubeGen = new root.TubeGenerator;
      this.tubeGen.polygonSides = 10;
      this.tubeGen.bézierSlices = 3;
      this.tubeGen.tangentSmoothness = 3;
      this.compileShaders();
      this.gl.disable(this.gl.CULL_FACE);
      if (this.gl.getError() !== this.gl.NO_ERROR) {
        glerr("OpenGL error during init");
      }
      this.parseMetadata();
      this.downloadSpineData();
    }

    Renderer.prototype.parseMetadata = function() {
      var KnotColors, Table, i, id, knot, link, range, ranges, row, x, _i, _j, _k, _len, _len1, _ref;
      KnotColors = [[1, 1, 1, 0.75], [0.25, 0.5, 1, 0.75], [1, 0.5, 0.25, 0.75]];
      Table = [
        '0.1 3.1 4.1 5.1 5.2 6.1 6.2 6.3 7.1', '7.2 7.3 7.4 7.5 7.6 7.7 8.1 8.2 8.3', ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 4; _i <= 12; i = ++_i) {
            _results.push("8." + i);
          }
          return _results;
        })()).join(' '), ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 13; _i <= 21; i = ++_i) {
            _results.push("8." + i);
          }
          return _results;
        })()).join(' '), ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 1; _i <= 9; i = ++_i) {
            _results.push("9." + i);
          }
          return _results;
        })()).join(' '), ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 10; _i <= 18; i = ++_i) {
            _results.push("9." + i);
          }
          return _results;
        })()).join(' '), ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 19; _i <= 27; i = ++_i) {
            _results.push("9." + i);
          }
          return _results;
        })()).join(' '), ((function() {
          var _i, _results;
          _results = [];
          for (i = _i = 28; _i <= 36; i = ++_i) {
            _results.push("9." + i);
          }
          return _results;
        })()).join(' '), '0.2.1 2.2.1 4.2.1 5.2.1 6.2.1 6.2.2 6.2.3 7.2.1 7.2.2', '7.2.3 7.2.4 7.2.5 7.2.6 7.2.7 7.2.8 8.2.1 8.2.2 8.2.3', '8.2.4 8.2.5 8.2.6 8.2.7 8.2.8 8.2.9 8.2.10 8.2.11 0.3.1', '6.3.1 6.3.2 6.3.3 7.3.1 8.3.1 8.3.2 8.3.3 8.3.4 8.3.5'
      ];
      this.links = [];
      for (row = _i = 0; _i < 12; row = ++_i) {
        this.links[row] = [];
        this.links[row].theta = 0;
        if (!Table[row]) {
          continue;
        }
        _ref = Table[row].split(' ');
        for (_j = 0, _len = _ref.length; _j < _len; _j++) {
          id = _ref[_j];
          link = [];
          ranges = ((function() {
            var _k, _len1, _ref1, _results;
            _ref1 = root.links;
            _results = [];
            for (_k = 0, _len1 = _ref1.length; _k < _len1; _k++) {
              x = _ref1[_k];
              if (x[0] === id) {
                _results.push(x.slice(1));
              }
            }
            return _results;
          })())[0];
          for (_k = 0, _len1 = ranges.length; _k < _len1; _k++) {
            range = ranges[_k];
            knot = {};
            knot.range = range;
            knot.color = KnotColors[ranges.indexOf(range)];
            link.push(knot);
          }
          link.iconified = 1;
          link.id = id;
          this.links[row].push(link);
        }
      }
      return this.links[this.selectedRow][this.selectedColumn].iconified = 0;
    };

    Renderer.prototype.downloadSpineData = function() {
      var worker;
      worker = new Worker('js/downloader.js');
      worker.renderer = this;
      worker.onmessage = function(response) {
        return this.renderer.onDownloadComplete(response.data);
      };
      return worker.postMessage(document.URL + 'data/centerlines.bin');
    };

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
      this.tessRow(this.links[this.selectedRow]);
      root.UpdateLabels();
      return this.render();
    };

    Renderer.prototype.tessRow = function(row) {
      var link, msg, onComplete, useWorkers, worker, _i, _len, _results,
        _this = this;
      if (row.loaded != null) {
        return;
      }
      if (row.loading != null) {
        return;
      }
      row.loading = true;
      row.loadCount = 0;
      onComplete = function(event) {
        var knot, link, vbo, _i, _len;
        link = event.data;
        for (_i = 0, _len = link.length; _i < _len; _i++) {
          knot = link[_i];
          vbo = _this.gl.createBuffer();
          _this.gl.bindBuffer(_this.gl.ARRAY_BUFFER, vbo);
          _this.gl.bufferData(_this.gl.ARRAY_BUFFER, knot.vbos.tube, _this.gl.STATIC_DRAW);
          vbo.count = knot.vbos.tube.length;
          knot.vbos.tube = vbo;
          vbo = _this.gl.createBuffer();
          _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, vbo);
          _this.gl.bufferData(_this.gl.ELEMENT_ARRAY_BUFFER, knot.vbos.wireframe, _this.gl.STATIC_DRAW);
          vbo.count = knot.vbos.wireframe.length;
          knot.vbos.wireframe = vbo;
          vbo = _this.gl.createBuffer();
          _this.gl.bindBuffer(_this.gl.ELEMENT_ARRAY_BUFFER, vbo);
          _this.gl.bufferData(_this.gl.ELEMENT_ARRAY_BUFFER, knot.vbos.triangles, _this.gl.STATIC_DRAW);
          vbo.count = knot.vbos.triangles.length;
          knot.vbos.triangles = vbo;
        }
        if (row.loadCount === row.length) {
          row.loaded = true;
          return row.loading = false;
        }
      };
      useWorkers = false;
      _results = [];
      for (_i = 0, _len = row.length; _i < _len; _i++) {
        link = row[_i];
        if (!useWorkers) {
          this.tessLink(link);
          _results.push(onComplete({
            data: link
          }));
        } else {
          worker = new Worker('js/tess-worker.js');
          msg = {
            renderer: this,
            link: link
          };
          worker.onmessage = onComplete;
          _results.push(worker.postMessage(msg));
        }
      }
      return _results;
    };

    Renderer.prototype.tessLink = function(link) {
      var knot, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = link.length; _i < _len; _i++) {
        knot = link[_i];
        _results.push(knot.vbos = this.tessKnot(knot.range));
      }
      return _results;
    };

    Renderer.prototype.getCurrentLinkInfo = function() {
      var X;
      X = this.links[this.selectedRow][this.selectedColumn].id.split('.');
      if (X.length === 2) {
        return {
          crossings: X[0],
          numComponents: "",
          index: X[1]
        };
      }
      return {
        crossings: X[0],
        numComponents: X[1],
        index: X[2]
      };
    };

    Renderer.prototype.moveSelection = function(dx, dy) {
      var nextX, nextY;
      nextX = this.selectedColumn + dx;
      nextY = this.selectedRow + dy;
      if (nextY >= this.links.length || nextY < 0) {
        return;
      }
      if (nextX >= this.links[nextY].length || nextX < 0) {
        return;
      }
      return this.changeSelection(nextX, nextY);
    };

    Renderer.prototype.changeSelection = function(nextX, nextY) {
      var iconified, link, previousColumn, row, _i, _len, _ref;
      previousColumn = this.selectedColumn;
      if (nextY !== this.selectedRow) {
        _ref = this.links[nextY];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          link = _ref[_i];
          link.iconified = 1;
        }
        this.links[nextY][nextX].iconified = 0;
        this.highlightRow = nextY;
      }
      this.selectedColumn = nextX;
      this.selectedRow = nextY;
      root.UpdateSelectionRow();
      this.tessRow(this.links[this.selectedRow]);
      root.AnimateNumerals();
      row = this.links[this.selectedRow];
      iconified = row[previousColumn].iconified;
      if (iconified === 0) {
        root.outgoing = new TWEEN.Tween(row[previousColumn]).to({
          iconified: 1
        }, 0.5 * this.transitionMilliseconds).easing(TWEEN.Easing.Quartic.Out);
        root.incoming = new TWEEN.Tween(row[this.selectedColumn]).to({
          iconified: 0
        }, this.transitionMilliseconds).easing(TWEEN.Easing.Bounce.Out);
        root.incoming.start();
        root.outgoing.start();
        return;
      }
      row[previousColumn].iconified = 1;
      row[this.selectedColumn].iconified = iconified;
      if (root.incoming != null) {
        return root.incoming.replace(row[this.selectedColumn]);
      }
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
      var alpha, aspect, currentTime, cursor, dt, elapsed, eye, far, fov, getAlpha, h, link, model, near, pass, r, row, spinningRow, target, up, view, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _ref, _ref1;
      r = function() {
        return root.renderer.render();
      };
      window.requestAnimationFrame(r, $("canvas").get(0));
      TWEEN.update();
      if (root.UpdateLabels != null) {
        root.UpdateLabels();
      }
      if (root.pageIndex === 0) {
        h = this.height / this.links.length;
        this.highlightRow = Math.floor(root.mouse.position.y / h);
        if (this.highlightRow >= this.links.length) {
          this.highlightRow = null;
        }
        root.UpdateHighlightRow();
      } else {
        this.highlightRow = this.selectedRow;
      }
      cursor = this.hotMouse || root.mouse.hot || root.pageIndex === 0 ? 'pointer' : '';
      $('#rightpage').css({
        'cursor': cursor
      });
      $('#leftpage').css({
        'cursor': cursor
      });
      currentTime = new Date().getTime();
      if (this.previousTime != null) {
        elapsed = currentTime - this.previousTime;
        dt = this.radiansPerSecond * elapsed;
        if (root.pageIndex === 0) {
          dt = dt * 32;
        }
        spinningRow = this.highlightRow != null ? this.links[this.highlightRow] : null;
        _ref = this.links;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          if (row === spinningRow || Math.abs(row.theta % TWOPI) > dt) {
            row.theta += dt;
          } else {
            row.theta = 0;
          }
        }
      }
      this.previousTime = currentTime;
      this.projection = mat4.perspective(fov = 45, aspect = this.width / this.height, near = 5, far = 90);
      view = mat4.lookAt(eye = [0, -5, 5], target = [0, 0, 0], up = [0, 1, 0]);
      this.updateViewports();
      getAlpha = function(link) {
        return 0.25 + 0.75 * link.iconified;
      };
      _ref1 = this.links;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        row = _ref1[_j];
        model = mat4.create();
        this.modelview = mat4.create();
        mat4.identity(model);
        mat4.rotateX(model, 3.14 / 4);
        mat4.rotateY(model, row.theta);
        mat4.multiply(view, model, this.modelview);
        this.normalMatrix = mat4.toMat3(this.modelview);
        for (_k = 0, _len2 = row.length; _k < _len2; _k++) {
          link = row[_k];
          this.renderIconLink(link, link.tableBox, alpha = 1);
        }
        if (this.links.indexOf(row) === this.selectedRow) {
          for (_l = 0, _len3 = row.length; _l < _len3; _l++) {
            link = row[_l];
            this.renderIconLink(link, link.iconBox, getAlpha(link));
          }
          for (pass = _m = 0; _m <= 1; pass = ++_m) {
            for (_n = 0, _len4 = row.length; _n < _len4; _n++) {
              link = row[_n];
              this.renderBigLink(link, pass);
            }
          }
        }
      }
      if (this.gl.getError() !== this.gl.NO_ERROR) {
        return glerr("Render");
      }
    };

    Renderer.prototype.renderIconLink = function(link, viewbox, alpha) {
      var knot, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = link.length; _i < _len; _i++) {
        knot = link[_i];
        _results.push(this.renderIconKnot(knot, link, viewbox, alpha));
      }
      return _results;
    };

    Renderer.prototype.renderBigLink = function(link, pass) {
      var knot, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = link.length; _i < _len; _i++) {
        knot = link[_i];
        _results.push(this.renderBigKnot(knot, link, pass));
      }
      return _results;
    };

    Renderer.prototype.updateViewports = function() {
      var bigBox, d, distance, h, iconBox, link, maxExpansion, mouse, radius, row, rowIndex, tileHeight, tileWidth, w, x, y, _i, _j, _len, _ref, _results;
      bigBox = new aabb(0, 0, this.width, this.height);
      mouse = vec2.create([root.mouse.position.x, this.height - root.mouse.position.y]);
      this.hotMouse = false;
      _results = [];
      for (rowIndex = _i = 0, _ref = this.links.length; 0 <= _ref ? _i < _ref : _i > _ref; rowIndex = 0 <= _ref ? ++_i : --_i) {
        row = this.links[rowIndex];
        h = tileHeight = this.height / this.links.length;
        w = tileHeight * this.width / this.height;
        tileWidth = this.width / (row.length + 0.5);
        x = -this.width + tileWidth / 2;
        y = this.height - tileHeight / 2 - tileHeight * rowIndex;
        for (_j = 0, _len = row.length; _j < _len; _j++) {
          link = row[_j];
          link.tableBox = aabb.createFromCenter([x, y], [w, h]);
          link.tableBox.inflate(w / 5, h / 5);
          x = x + tileWidth;
        }
        if (rowIndex !== this.selectedRow) {
          continue;
        }
        w = tileWidth = this.width / row.length;
        h = tileHeight = tileWidth * this.height / this.width;
        x = tileWidth / 2;
        y = this.height - tileHeight / 2;
        _results.push((function() {
          var _k, _len1, _results1;
          _results1 = [];
          for (_k = 0, _len1 = row.length; _k < _len1; _k++) {
            link = row[_k];
            iconBox = aabb.createFromCenter([x, y], [w, h]);
            distance = vec2.dist([x, y], mouse);
            radius = h / 2;
            if (distance < radius && link.iconified === 1) {
              d = 1 - distance / radius;
              maxExpansion = radius / 3;
              iconBox.inflate(d * d * maxExpansion);
              this.hotMouse = true;
            }
            link.iconBox = iconBox;
            link.centralBox = aabb.lerp(bigBox, iconBox, link.iconified);
            _results1.push(x = x + w);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Renderer.prototype.click = function() {
      var link, mouse, row, _i, _len, _results;
      if (root.pageIndex === 0 && !(root.swipeTween != null)) {
        if (!(this.highlightRow != null)) {
          return;
        }
        this.changeSelection(this.selectedColumn, this.highlightRow);
        root.SwipePane();
        return;
      }
      if (!(this.links != null)) {
        return;
      }
      row = this.links[this.selectedRow];
      mouse = vec2.create([root.mouse.position.x, this.height - root.mouse.position.y]);
      _results = [];
      for (_i = 0, _len = row.length; _i < _len; _i++) {
        link = row[_i];
        if (!link || !link.iconBox) {
          continue;
        }
        if (link.iconBox.contains(mouse[0], mouse[1]) && link.iconified === 1) {
          _results.push(this.changeSelection(row.indexOf(link), this.selectedRow));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Renderer.prototype.setColor = function(loc, c, α) {
      return this.gl.uniform4f(loc, c[0], c[1], c[2], α);
    };

    Renderer.prototype.setViewport = function(box) {
      var clippedBox, cropMatrix, entireViewport, projection;
      box = box.translated(window.pan.x, 0);
      entireViewport = new aabb(0, 0, this.width, this.height);
      clippedBox = aabb.intersect(box, entireViewport);
      if (clippedBox.degenerate()) {
        return null;
      }
      cropMatrix = aabb.cropMatrix(clippedBox, box);
      projection = mat4.create(this.projection);
      mat4.multiply(projection, cropMatrix);
      clippedBox.viewport(this.gl);
      return projection;
    };

    Renderer.prototype.renderIconKnot = function(knot, link, viewbox, alpha) {
      var program, projection, startVertex, stride, vertexCount, x, y, _i, _j, _ref;
      projection = this.setViewport(viewbox);
      if (!projection) {
        return;
      }
      program = this.programs.wireframe;
      this.gl.useProgram(program);
      this.gl.enable(this.gl.BLEND);
      this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbos.spines);
      this.gl.enableVertexAttribArray(POSITION);
      this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 12, 0);
      this.gl.uniformMatrix4fv(program.modelview, false, this.modelview);
      this.gl.uniformMatrix4fv(program.projection, false, projection);
      this.gl.uniform1f(program.scale, this.tubeGen.scale);
      this.setColor(program.color, COLORS.black, alpha);
      _ref = knot.range, startVertex = _ref[0], vertexCount = _ref[1];
      this.gl.enable(this.gl.DEPTH_TEST);
      this.gl.lineWidth(2);
      for (x = _i = -1; _i <= 1; x = _i += 2) {
        for (y = _j = -1; _j <= 1; y = _j += 2) {
          this.gl.uniform2f(program.offset, x, y);
          this.gl.uniform1f(program.depthOffset, 0);
          this.gl.drawArrays(this.gl.LINE_LOOP, startVertex, vertexCount);
        }
      }
      this.setColor(program.color, knot.color, alpha);
      this.gl.uniform2f(program.offset, 0, 0);
      this.gl.uniform1f(program.depthOffset, -0.5);
      this.gl.drawArrays(this.gl.LINE_LOOP, startVertex, vertexCount);
      return this.gl.disableVertexAttribArray(POSITION);
    };

    Renderer.prototype.renderBigKnot = function(knot, link, pass) {
      var offset, program, projection, stride, vbos;
      if (link.iconified === 1) {
        return;
      }
      if (!(knot.vbos != null)) {
        return;
      }
      projection = this.setViewport(link.centralBox);
      if (!projection) {
        return;
      }
      vbos = knot.vbos;
      if (pass === 0) {
        program = this.programs.solidmesh;
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.useProgram(program);
        this.setColor(program.color, knot.color, 1);
        this.gl.uniformMatrix4fv(program.modelview, false, this.modelview);
        this.gl.uniformMatrix3fv(program.normalmatrix, false, this.normalMatrix);
        this.gl.uniformMatrix4fv(program.projection, false, projection);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbos.tube);
        this.gl.enableVertexAttribArray(POSITION);
        this.gl.enableVertexAttribArray(NORMAL);
        this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 24, 0);
        this.gl.vertexAttribPointer(NORMAL, 3, this.gl.FLOAT, false, stride = 24, offset = 12);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vbos.triangles);
        if (this.style === Style.SILHOUETTE) {
          this.gl.enable(this.gl.POLYGON_OFFSET_FILL);
          this.gl.polygonOffset(-1, 12);
        }
        this.gl.drawElements(this.gl.TRIANGLES, vbos.triangles.count, this.gl.UNSIGNED_SHORT, 0);
        this.gl.disableVertexAttribArray(POSITION);
        this.gl.disableVertexAttribArray(NORMAL);
        this.gl.disable(this.gl.POLYGON_OFFSET_FILL);
      }
      if (pass === 1) {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        program = this.programs.wireframe;
        this.gl.useProgram(program);
        this.gl.uniformMatrix4fv(program.modelview, false, this.modelview);
        this.gl.uniformMatrix4fv(program.projection, false, projection);
        this.gl.uniform1f(program.scale, 1);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbos.tube);
        this.gl.enableVertexAttribArray(POSITION);
        this.gl.vertexAttribPointer(POSITION, 3, this.gl.FLOAT, false, stride = 24, 0);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, vbos.wireframe);
        if (this.style === Style.WIREFRAME) {
          this.gl.lineWidth(1);
          this.gl.uniform1f(program.depthOffset, -0.01);
          this.setColor(program.color, COLORS.black, 0.75);
          this.gl.drawElements(this.gl.LINES, vbos.wireframe.count, this.gl.UNSIGNED_SHORT, 0);
        } else if (this.style === Style.RINGS) {
          this.gl.lineWidth(1);
          this.gl.uniform1f(program.depthOffset, -0.01);
          this.setColor(program.color, COLORS.black, 0.75);
          this.gl.drawElements(this.gl.LINES, vbos.wireframe.count / 2, this.gl.UNSIGNED_SHORT, vbos.wireframe.count);
        } else {
          this.gl.lineWidth(2);
          this.gl.uniform1f(program.depthOffset, 0.01);
          this.setColor(program.color, COLORS.black, 1);
          this.gl.drawElements(this.gl.LINES, vbos.wireframe.count, this.gl.UNSIGNED_SHORT, 0);
          if (this.sketchy) {
            this.gl.lineWidth(1);
            this.setColor(program.color, COLORS.darkgray, 1);
            this.gl.uniform1f(program.depthOffset, -0.01);
            this.gl.drawElements(this.gl.LINES, vbos.wireframe.count / 2, this.gl.UNSIGNED_SHORT, vbos.wireframe.count);
          }
        }
        return this.gl.disableVertexAttribArray(POSITION);
      }
    };

    Renderer.prototype.tessKnot = function(component) {
      var byteOffset, centerline, faceCount, i, j, lineCount, next, numFloats, polygonCount, polygonEdge, ptr, rawBuffer, segmentData, sides, sweepEdge, tri, triangles, tube, v, vbos, wireframe, _ref, _ref1, _ref2, _ref3;
      byteOffset = component[0] * 3 * 4;
      numFloats = component[1] * 3;
      segmentData = this.spines.subarray(component[0] * 3, component[0] * 3 + component[1] * 3);
      centerline = this.tubeGen.getKnotPath(segmentData);
      rawBuffer = this.tubeGen.generateTube(centerline);
      tube = rawBuffer;
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
      wireframe = rawBuffer;
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
      triangles = rawBuffer;
      return vbos = {
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

  aabb = root.utility.aabb;

  Style = {
    WIREFRAME: 0,
    SILHOUETTE: 1,
    RINGS: 2
  };

}).call(this);
