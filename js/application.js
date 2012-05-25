// Generated by CoffeeScript 1.3.1
(function() {
  var DevTips, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  DevTips = "In Chrome, use Ctrl+Shift+J to see console, Alt+Cmd+J on a Mac.\nTo experiment with coffescript, try this from the console:\n> coffee --require './js/gl-matrix-min.js'";

  root.AppInit = function() {
    var c, gl, height, width;
    window.onresize = function() {
      var c, height, width;
      width = parseInt($("#overlay").css('width'));
      height = parseInt($("#overlay").css('height'));
      $("canvas").css('margin-top', -height / 2);
      $("#overlay").css('margin-top', -height / 2);
      c = $("canvas").get(0);
      c.clientWidth = width;
      c.width = c.clientWidth;
      c.clientHeight = height;
      c.height = c.clientHeight;
      if (root.renderer != null) {
        root.renderer.width = width;
        return root.renderer.height = height;
      }
    };
    c = $("canvas").get(0);
    gl = c.getContext("experimental-webgl", {
      antialias: true
    });
    if (!gl.getExtension("OES_texture_float")) {
      glerr("Your browser does not support floating-point textures.");
    }
    if (!gl.getExtension("OES_standard_derivatives")) {
      glerr("Your browser does not support GLSL derivatives.");
    }
    width = parseInt($("#overlay").css('width'));
    height = parseInt($("#overlay").css('height'));
    root.renderer = new root.Renderer(gl, width, height);
    return window.onresize();
  };

  root.OnKeyDown = function(keyname) {
    if (keyname === 'left') {
      root.renderer.changeSelection(-1);
    }
    if (keyname === 'right') {
      return root.renderer.changeSelection(+1);
    }
  };

}).call(this);
