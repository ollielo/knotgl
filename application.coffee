root = exports ? this

DevTips =
  """
  In Chrome, use Ctrl+Shift+J to see console, Alt+Cmd+J on a Mac.
  To experiment with coffescript, try this from the console:
  > coffee --require './js/gl-matrix-min.js'
  """

# Vertex Attribute Semantics
VERTEXID = 0
POSITION = 0
NORMAL = 1
TEXCOORD = 2

# Global Constants
Slices = 32 # Cross-Section Geometric LOD
Stacks = 96 # Longitudinal Geometric LOD
TWOPI = 2 * Math.PI

# Various Globals
theta = 0
programs = {}
vbos = {}

# Aliases and Monkey Patches
[sin, cos, pow, abs] = (Math[f] for f in "sin cos pow abs".split(' '))
dot = vec3.dot
sgn = (x) -> if x > 0 then +1 else (if x < 0 then -1 else 0)
vec3.perp = (u, dest) ->
  v = vec3.create([1,0,0])
  vec3.cross(u,v,dest)
  e = dot(dest,dest)
  if e < 0.01
    vec3.set(v,[0,1,0])
    vec3.cross(u,v,dest)
  vec3.normalize(dest)

# Render Function
Render = ->

  # Wait for a refresh event, look at the current canvas size
  canvas = $("canvas")
  window.requestAnimFrame(Render, canvas.get(0))
  gl = root.gl
  w = parseInt(canvas.css('width'))
  h = parseInt(canvas.css('height'))

  # Adjust the camera and compute various transforms
  projection = mat4.perspective(fov = 45, aspect = 1, near = 5, far = 90)
  view = mat4.lookAt(eye = [0,-5,5], target = [0,0,0], up = [0,1,0])
  model = mat4.create()
  modelview = mat4.create()
  mat4.identity(model)
  mat4.rotateY(model, theta)
  mat4.multiply(view, model, modelview)
  normalMatrix = mat4.toMat3(modelview)
  theta += 0.02

  # Draw the hot pink background (why is this so slow?)
  if false
    program = programs.vignette
    gl.disable(gl.DEPTH_TEST)
    gl.useProgram(program)
    gl.uniform2f(program.viewport, w, h)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.bigtri)
    gl.enableVertexAttribArray(VERTEXID)
    gl.vertexAttribPointer(VERTEXID, 2, gl.FLOAT, false, stride = 8, 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    gl.disableVertexAttribArray(VERTEXID)

  # Draw the centerline
  if true
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.lineWidth(3)
    program = programs.wireframe
    gl.useProgram(program)
    gl.uniformMatrix4fv(program.projection, false, projection)
    gl.uniformMatrix4fv(program.modelview, false, modelview)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.centerline)
    gl.enableVertexAttribArray(POSITION)
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, stride = 12, 0)
    gl.drawArrays(gl.LINE_STRIP, 0, vbos.centerline.count)
    gl.disableVertexAttribArray(POSITION)

  # Draw the wireframe
  if true
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.lineWidth(3)
    program = programs.wireframe
    gl.useProgram(program)
    gl.uniformMatrix4fv(program.projection, false, projection)
    gl.uniformMatrix4fv(program.modelview, false, modelview)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.tube)
    gl.enableVertexAttribArray(POSITION)
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, stride = 12, 0)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbos.wireframe)
    gl.drawElements(gl.LINES, vbos.wireframe.count, gl.UNSIGNED_SHORT, 0)
    gl.disableVertexAttribArray(POSITION)

  # Draw the mesh
  if false
    program = programs.mesh
    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.enable(gl.DEPTH_TEST)
    gl.useProgram(program)
    gl.uniformMatrix4fv(program.projection, false, projection)
    gl.uniformMatrix4fv(program.modelview, false, modelview)
    gl.uniformMatrix3fv(program.normalmatrix, false, normalMatrix)
    gl.bindBuffer(gl.ARRAY_BUFFER, vbos.mesh)
    gl.enableVertexAttribArray(POSITION)
    gl.enableVertexAttribArray(NORMAL)
    gl.vertexAttribPointer(POSITION, 3, gl.FLOAT, false, stride = 32, 0)
    gl.vertexAttribPointer(NORMAL, 3, gl.FLOAT, false, stride = 32, offset = 12)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbos.faces)
    gl.drawElements(gl.TRIANGLES, vbos.faces.count, gl.UNSIGNED_SHORT, 0)
    gl.disableVertexAttribArray(POSITION)
    gl.disableVertexAttribArray(NORMAL)

  if gl.getError() != gl.NO_ERROR
    glerr("Render")

# Sweep a n-sided polygon along the given centerline
# Repeat the vertex along the seam to allow nice texture coords.
GenerateTube = (centerline, n) ->
  frames = GenerateFrames(centerline)
  count = centerline.length / 3
  mesh = new Float32Array(count * (n+1) * 3)
  [i, m] = [0, 0]
  p = vec3.create()
  r = 0.01
  while i < count
      v = 0
      basis = (frames[C].subarray(i*3,i*3+3) for C in [0..2])
      basis = ((B[C] for C in [0..2]) for B in basis)
      basis = (basis.reduce (A,B) -> A.concat(B))
      basis = mat3.create(basis)
      theta = 0
      dtheta = TWOPI / n
      while v < n+1
        x = r*cos(theta)
        y = r*sin(theta)
        z = 0
        mat3.multiplyVec3(basis, [x,y,z], p)
        p[0] += centerline[i*3+0] # TODO clean this
        p[1] += centerline[i*3+1]
        p[2] += centerline[i*3+2]
        #console.log "GenerateTube: P = #{vec3.str(p)}"
        mesh.set(p, m)
        [m, v, theta] = [m+3,v+1,theta+dtheta]
      i++
  console.log "GenerateTube: generated #{m} vertices from a centerline with #{count} nodes."
  mesh

# Generate reasonable orthonormal basis vectors for curve in R3
# see "Computation of Rotation Minimizing Frame" by Wang and Jüttler
GenerateFrames = (centerline) ->
  count = centerline.length / 3
  frameR = new Float32Array(count * 3)
  frameS = new Float32Array(count * 3)
  frameT = new Float32Array(count * 3)
  # Obtain unit-length tangent vectors
  i = -1
  while ++i < count
    j = (i+1) % (count-1)
    xi = centerline.subarray(i*3, i*3+3)
    xj = centerline.subarray(j*3, j*3+3)
    ti = frameT.subarray(i*3, i*3+3)
    vec3.direction(xi, xj, ti)
  # Allocate some temporaries for vector math
  [v1,  v2,  tmp] = (vec3.create() for n in [0..2])
  [r0,  s0,  t0]  = (vec3.create() for n in [0..2])
  [rj,  sj,  tj]  = (vec3.create() for n in [0..2])
  [riL, siL, tiL] = (vec3.create() for n in [0..2])
  # Create a somewhat-arbitrary initial frame (r0, s0, t0)
  vec3.set(frameT.subarray(0, 3), t0)
  vec3.perp(t0, s0)
  vec3.cross(s0, t0, r0)
  vec3.normalize(r0)
  vec3.normalize(s0)
  vec3.set(r0, frameR.subarray(0, 3))
  vec3.set(s0, frameS.subarray(0, 3))
  # Use frameT and the RMF algorithm to populate frameR and frameS
  [i,j] = [0,1]
  [ri, si, ti] = [r0, s0, t0]
  while i < count
    j = (i+1) % (count-1)
    xi = centerline.subarray(i*3, i*3+3)
    xj = centerline.subarray(j*3, j*3+3)
    ti = frameT.subarray(i*3, i*3+3)
    tj = frameT.subarray(j*3, j*3+3)
    vec3.subtract(xj, xi, v1)
    #console.log "#{i} A: #{vec3.str(xj)} - #{vec3.str(xi)} = #{vec3.str(v1)}"
    c1 = dot(v1, v1)
    vec3.scale(v1, (2/c1)*dot(v1,ri), tmp)
    vec3.subtract(ri, tmp, riL)
    #console.log "#{i} B: #{vec3.str(ri)} - #{vec3.str(tmp)} = #{vec3.str(riL)}"
    vec3.scale(v1, (2/c1)*dot(v1,ti), tmp)
    vec3.subtract(ti, tmp, tiL)
    vec3.subtract(tj, tiL, v2)
    c2 = dot(v2, v2)
    vec3.scale(v2, (2/c2)*dot(v2,riL), tmp)
    vec3.subtract(riL, tmp, rj)
    vec3.cross(tj, rj, sj)
    vec3.set(rj, frameR.subarray(j*3, j*3+3))
    vec3.set(sj, frameS.subarray(j*3, j*3+3))
    #console.log "#{i} C: #{vec3.str(rj)}, #{vec3.str(sj)}, #{vec3.str(tj)}"
    ++i
  [frameR, frameS, frameT]

# Evaluate a Bezier function for smooth interpolation
GetKnotPath = (data, slices) ->
  globalScale = 0.15
  rawBuffer = new Float32Array(data.length * slices + 3)
  [i,j] = [0,0]
  while i < data.length+3
    r = ((i+n)%data.length for n in [0,2,3,5,6,8])
    a = data[r[0]..r[1]]
    b = data[r[2]..r[3]]
    c = data[r[4]..r[5]]
    v1 = vec3.create(a)
    v4 = vec3.create(b)
    vec3.lerp(v1, b, 0.5)
    vec3.lerp(v4, c, 0.5)
    v2 = vec3.create(v1)
    v3 = vec3.create(v4)
    vec3.lerp(v2, b, 1/3)
    vec3.lerp(v3, b, 1/3)
    t = dt = 1 / (slices+1)
    for slice in [0...slices]
      tt = 1-t
      c = [tt*tt*tt,3*tt*tt*t,3*tt*t*t,t*t*t]
      p = (vec3.create(v) for v in [v1,v2,v3,v4])
      vec3.scale(p[ii],c[ii]) for ii in [0...4]
      p = p.reduce (a,b) -> vec3.add(a,b)
      vec3.scale(p, globalScale)
      rawBuffer.set(p, j)
      j += 3
      if j >= rawBuffer.length
        console.log "Bezier: generated #{j/3} points from #{data.length/3} control points."
        return rawBuffer
      t += dt
    i += 3

GetLinkPaths = (links, slices) ->
  GetKnotPath(link, slices) for link in links

# General VBOs
InitBuffers = ->

  gl = root.gl

  # Create a line strip VBO for a knot centerline
  # The first vertex is repeated for good uv hygiene
  rawBuffer = GetLinkPaths(window.knot_data, slices = 3)[0]
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  vbos.centerline = vbo
  vbos.centerline.count = rawBuffer.length / 3

  # Create a positions buffer for a swept pentagon
  rawBuffer = GenerateTube(rawBuffer, sides = 5)
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  console.log "Tube positions has #{rawBuffer.length/3} verts."
  vbos.tube = vbo

  # Create the index buffer for the tube wireframe
  polygonCount = vbos.centerline.count - 1
  lineCount = polygonCount * sides * 2
  rawBuffer = new Uint16Array(lineCount * 2)
  [i, ptr] = [0, 0]
  while i < polygonCount * (n+1)
    j = 0
    while j < n
      polygonEdge = rawBuffer.subarray(ptr+0, ptr+2)
      polygonEdge[0] = i+j
      polygonEdge[1] = i+j+1
      sweepEdge = rawBuffer.subarray(ptr+2, ptr+4)
      sweepEdge[0] = i+j
      sweepEdge[1] = i+j+n+1
      [ptr, j] = [ptr+4, j+1]
    i += n+1
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  vbos.wireframe = vbo
  vbos.wireframe.count = rawBuffer.length
  console.log "Tube wireframe has #{rawBuffer.length} indices for #{sides} sides and #{vbos.centerline.count-1} polygons."

  # Create positions/normals/texcoords for the tube verts
  rawBuffer = new Float32Array(Slices * Stacks * 8)
  [slice, i] = [-1, 0]
  BmA = CmA = n = N = vec3.create()
  EPSILON = 0.00001
  while ++slice < Slices
    [v, stack] = [slice * TWOPI / (Slices-1), -1]
    while ++stack < Stacks
      u = stack * TWOPI / (Stacks-1)
      A = p = MobiusTube(u, v)
      B = MobiusTube(u + EPSILON, v)
      C = MobiusTube(u, v + EPSILON)
      BmA = vec3.subtract(B,A)
      CmA = vec3.subtract(C,A)
      n = vec3.cross(BmA,CmA)
      n = vec3.normalize(n)
      rawBuffer.set(p, i)
      rawBuffer.set(n, i+3)
      rawBuffer.set([u,v], i+6)
      i += 8
  msg = "#{i} floats generated from #{Slices} slices and #{Stacks} stacks."
  console.log msg
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  vbos.mesh = vbo

  # Create the index buffer for the tube faces
  faceCount = (Slices - 1) * Stacks * 2
  rawBuffer = new Uint16Array(faceCount * 3)
  [i, ptr, v] = [0, 0, 0]
  while ++i < Slices
    j = -1
    while ++j < Stacks
      next = (j + 1) % Stacks
      tri = rawBuffer.subarray(ptr+0, ptr+3)
      tri[2] = v+next+Stacks
      tri[1] = v+next
      tri[0] = v+j
      tri = rawBuffer.subarray(ptr+3, ptr+6)
      tri[2] = v+j
      tri[1] = v+j+Stacks
      tri[0] = v+next+Stacks
      ptr += 6
    v += Stacks
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  vbos.faces = vbo
  vbos.faces.count = rawBuffer.length

  # Create a fullscreen triangle
  corners = [ -1, 3, -1, -1, 3, -1]
  rawBuffer = new Float32Array(corners)
  vbo = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
  gl.bufferData(gl.ARRAY_BUFFER, rawBuffer, gl.STATIC_DRAW)
  vbos.bigtri = vbo

# Parametric Function for the Mobius Tube Surface
MobiusTube = (u, v) ->
  [R, n] = [1.5, 3]
  x = (1.0*R + 0.125*sin(u/2)*pow(abs(sin(v)), 2/n)*sgn(sin(v)) + 0.5*cos(u/2)*pow(abs(cos(v)), 2/n)*sgn(cos(v)))*cos(u)
  y = (1.0*R + 0.125*sin(u/2)*pow(abs(sin(v)), 2/n)*sgn(sin(v)) + 0.5*cos(u/2)*pow(abs(cos(v)), 2/n)*sgn(cos(v)))*sin(u)
  z = -0.5*sin(u/2)*pow(abs(cos(v)), 2/n)*sgn(cos(v)) + 0.125*cos(u/2)*pow(abs(sin(v)), 2/n)*sgn(sin(v))
  [x, y, z]

# Compile and link the given shader strings and metadata
CompileProgram = (vName, fName, attribs, uniforms) ->
  vs = getShader(gl, vName)
  fs = getShader(gl, fName)
  program = gl.createProgram()
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.bindAttribLocation(program, value, key) for key, value of attribs
  gl.linkProgram(program)
  if not gl.getProgramParameter(program, gl.LINK_STATUS)
    glerr('Could not link #{vName} with #{fName}')
  program[value] = gl.getUniformLocation(program, key) for key, value of uniforms
  program

# Initialization Function
root.AppInit = ->
  canvas = $("canvas")
  w = parseInt(canvas.css('width'))
  h = parseInt(canvas.css('height'))
  canvas.css('margin-left', -w/2)
  canvas.css('margin-top', -h/2)
  root.gl = gl = canvas.get(0).getContext("experimental-webgl", { antialias: true } )
  if not gl.getExtension("OES_texture_float")
    glerr("Your browser does not support floating-point textures.")
  if not gl.getExtension("OES_standard_derivatives")
    glerr("Your browser does not support GLSL derivatives.")

  # Create Vertex Data
  InitBuffers()

  # Compile Programs
  attribs =
    Position: POSITION
    Normal: NORMAL
  unif =
    Projection: 'projection'
    Modelview: 'modelview'
    NormalMatrix: 'normalmatrix'
  programs.mesh = CompileProgram("VS-Scene", "FS-Scene", attribs, unif)
  attribs =
    Position: POSITION
  unif =
    Projection: 'projection'
    Modelview: 'modelview'
  programs.wireframe = CompileProgram("VS-Wireframe", "FS-Wireframe", attribs, unif)
  attribs =
    VertexID: VERTEXID
  uniforms =
    Viewport: 'viewport'
  programs.vignette = CompileProgram("VS-Vignette", "FS-Vignette", attribs, uniforms)

  gl.disable(gl.CULL_FACE)
  if gl.getError() != gl.NO_ERROR
    glerr("OpenGL error during init")

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  root.gl = gl
  Render()
