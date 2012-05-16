// Generated by CoffeeScript 1.3.1
(function() {
  var TWOPI, TubeGenerator, abs, cos, dot, f, perp, pow, root, sgn, sin, _ref;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  TubeGenerator = (function() {

    TubeGenerator.name = 'TubeGenerator';

    function TubeGenerator() {
      this.scale = 0.15;
      this.bézierSlices = 3;
      this.tangentSmoothness = 3;
      this.polygonSides = 8;
      this.radius = 0.1;
    }

    TubeGenerator.prototype.getLinkPaths = function(links) {
      var link, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = links.length; _i < _len; _i++) {
        link = links[_i];
        _results.push(this.getKnotPath(link));
      }
      return _results;
    };

    TubeGenerator.prototype.getKnotPath = function(data) {
      var a, b, c, dt, i, ii, j, n, p, r, rawBuffer, slice, slices, t, tt, v, v1, v2, v3, v4, _i, _j, _ref;
      slices = this.bézierSlices;
      rawBuffer = new Float32Array(data.length * slices + 3);
      _ref = [0, 0], i = _ref[0], j = _ref[1];
      while (i < data.length + 3) {
        r = (function() {
          var _i, _len, _ref1, _results;
          _ref1 = [0, 2, 3, 5, 6, 8];
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            n = _ref1[_i];
            _results.push((i + n) % data.length);
          }
          return _results;
        })();
        a = data.slice(r[0], r[1] + 1 || 9e9);
        b = data.slice(r[2], r[3] + 1 || 9e9);
        c = data.slice(r[4], r[5] + 1 || 9e9);
        v1 = vec3.create(a);
        v4 = vec3.create(b);
        vec3.lerp(v1, b, 0.5);
        vec3.lerp(v4, c, 0.5);
        v2 = vec3.create(v1);
        v3 = vec3.create(v4);
        vec3.lerp(v2, b, 1 / 3);
        vec3.lerp(v3, b, 1 / 3);
        t = dt = 1 / (slices + 1);
        for (slice = _i = 0; 0 <= slices ? _i < slices : _i > slices; slice = 0 <= slices ? ++_i : --_i) {
          tt = 1 - t;
          c = [tt * tt * tt, 3 * tt * tt * t, 3 * tt * t * t, t * t * t];
          p = (function() {
            var _j, _len, _ref1, _results;
            _ref1 = [v1, v2, v3, v4];
            _results = [];
            for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
              v = _ref1[_j];
              _results.push(vec3.create(v));
            }
            return _results;
          })();
          for (ii = _j = 0; _j < 4; ii = ++_j) {
            vec3.scale(p[ii], c[ii]);
          }
          p = p.reduce(function(a, b) {
            return vec3.add(a, b);
          });
          vec3.scale(p, this.scale);
          rawBuffer.set(p, j);
          j += 3;
          if (j >= rawBuffer.length) {
            console.log("Bézier: generated " + (j / 3) + " points from " + (data.length / 3) + " control points.");
            return rawBuffer;
          }
          t += dt;
        }
        i += 3;
      }
    };

    TubeGenerator.prototype.generateTube = function(centerline) {
      var B, C, basis, count, dtheta, frames, i, m, mesh, n, p, r, theta, v, x, y, z, _ref, _ref1;
      n = this.polygonSides;
      frames = this.generateFrames(centerline);
      count = centerline.length / 3;
      mesh = new Float32Array(count * (n + 1) * 3);
      _ref = [0, 0], i = _ref[0], m = _ref[1];
      p = vec3.create();
      r = 0.1;
      while (i < count) {
        v = 0;
        basis = (function() {
          var _i, _results;
          _results = [];
          for (C = _i = 0; _i <= 2; C = ++_i) {
            _results.push(frames[C].subarray(i * 3, i * 3 + 3));
          }
          return _results;
        })();
        basis = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = basis.length; _i < _len; _i++) {
            B = basis[_i];
            _results.push((function() {
              var _j, _results1;
              _results1 = [];
              for (C = _j = 0; _j <= 2; C = ++_j) {
                _results1.push(B[C]);
              }
              return _results1;
            })());
          }
          return _results;
        })();
        basis = basis.reduce(function(A, B) {
          return A.concat(B);
        });
        basis = mat3.create(basis);
        theta = 0;
        dtheta = TWOPI / n;
        while (v < n + 1) {
          x = r * cos(theta);
          y = r * sin(theta);
          z = 0;
          mat3.multiplyVec3(basis, [x, y, z], p);
          p[0] += centerline[i * 3 + 0];
          p[1] += centerline[i * 3 + 1];
          p[2] += centerline[i * 3 + 2];
          mesh.set(p, m);
          _ref1 = [m + 3, v + 1, theta + dtheta], m = _ref1[0], v = _ref1[1], theta = _ref1[2];
        }
        i++;
      }
      console.log("GenerateTube: generated " + m + " vertices from a centerline with " + count + " nodes.");
      return mesh;
    };

    TubeGenerator.prototype.generateFrames = function(centerline) {
      var count, frameR, frameS, frameT, i, j, n, r0, ri, rj, s0, si, sj, t0, ti, tj, xi, xj, _ref, _ref1, _ref2, _ref3;
      count = centerline.length / 3;
      frameR = new Float32Array(count * 3);
      frameS = new Float32Array(count * 3);
      frameT = new Float32Array(count * 3);
      i = -1;
      while (++i < count) {
        j = (i + 1 + this.tangentSmoothness) % (count - 1);
        xi = centerline.subarray(i * 3, i * 3 + 3);
        xj = centerline.subarray(j * 3, j * 3 + 3);
        ti = frameT.subarray(i * 3, i * 3 + 3);
        vec3.direction(xi, xj, ti);
      }
      _ref = (function() {
        var _i, _results;
        _results = [];
        for (n = _i = 0; _i <= 2; n = ++_i) {
          _results.push(vec3.create());
        }
        return _results;
      })(), r0 = _ref[0], s0 = _ref[1], t0 = _ref[2];
      _ref1 = (function() {
        var _i, _results;
        _results = [];
        for (n = _i = 0; _i <= 2; n = ++_i) {
          _results.push(vec3.create());
        }
        return _results;
      })(), rj = _ref1[0], sj = _ref1[1], tj = _ref1[2];
      vec3.set(frameT.subarray(0, 3), t0);
      perp(t0, r0);
      vec3.cross(t0, r0, s0);
      vec3.normalize(r0);
      vec3.normalize(s0);
      vec3.set(r0, frameR.subarray(0, 3));
      vec3.set(s0, frameS.subarray(0, 3));
      _ref2 = [0, 1], i = _ref2[0], j = _ref2[1];
      _ref3 = [r0, s0, t0], ri = _ref3[0], si = _ref3[1], ti = _ref3[2];
      while (i < count) {
        j = (i + 1) % count;
        xi = centerline.subarray(i * 3, i * 3 + 3);
        xj = centerline.subarray(j * 3, j * 3 + 3);
        ti = frameT.subarray(i * 3, i * 3 + 3);
        tj = frameT.subarray(j * 3, j * 3 + 3);
        vec3.cross(tj, ri, sj);
        vec3.normalize(sj);
        vec3.cross(sj, tj, rj);
        vec3.set(rj, frameR.subarray(j * 3, j * 3 + 3));
        vec3.set(sj, frameS.subarray(j * 3, j * 3 + 3));
        ++i;
      }
      return [frameR, frameS, frameT];
    };

    return TubeGenerator;

  })();

  root.TubeGenerator = TubeGenerator;

  TWOPI = 2 * Math.PI;

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

  perp = function(u, dest) {
    var e, v;
    v = vec3.create([1, 0, 0]);
    vec3.cross(u, v, dest);
    e = dot(dest, dest);
    if (e < 0.01) {
      vec3.set(v, [0, 1, 0]);
      vec3.cross(u, v, dest);
    }
    return vec3.normalize(dest);
  };

}).call(this);
