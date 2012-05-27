(function(){var w,F,t,x,p,y,G,z,u,A,B,C,v,H,f,D;f="undefined"!==typeof exports&&null!==exports?exports:this;f.utility={};p=f.utility;p.clone=function(b){var a,e;if(null==b||"object"!==typeof b)return b;e=new b.constructor;for(a in b)e[a]=A(b[a]);return e};p.aabb=u=function(){function b(a,e,c,g){this.left=a;this.top=e;this.right=c;this.bottom=g}b.name="aabb";b.createFromCorner=function(a,e){var c,g,j;c=a[0];g=a[1];j=[c+e[0],g+e[1]];return new b(c,g,j[0],j[1])};b.createFromCenter=function(a,e){var c,
g,j,d;j=[e[0]/2,e[1]/2];g=j[0];c=j[1];d=[a[0]-g,a[1]-c];j=d[0];d=d[1];g=[a[0]+g,a[1]+c];return new b(j,d,g[0],g[1])};b.prototype.setFromCenter=function(a,e){var c,g,j,d;c=[e[0]/2,e[1]/2];g=c[0];c=c[1];j=[a[0]-g,a[1]-c];this.left=j[0];this.top=j[1];return d=[a[0]+g,a[1]+c],this.right=d[0],this.bottom=d[1],d};b.prototype.contains=function(a,e){return a>=this.left&&a<this.right&&e>=this.top&&e<this.bottom};b.prototype.width=function(){return this.right-this.left};b.prototype.height=function(){return this.bottom-
this.top};b.prototype.centerx=function(){return(this.left+this.right)/2};b.prototype.centery=function(){return(this.bottom+this.top)/2};b.prototype.size=function(){return[this.width(),this.height()]};b.prototype.viewport=function(a){return a.viewport(this.left,this.top,this.width(),this.height())};b.prototype.inflate=function(a){this.left-=a;this.top-=a;this.right+=a;return this.bottom+=a};b.prototype.deflate=function(a){this.left+=a;this.top+=a;this.right-=a;return this.bottom-=a};b.lerp=function(a,
e,c){var g,j,d;j=(1-c)*a.width()+c*e.width();g=(1-c)*a.height()+c*e.height();d=(1-c)*a.centerx()+c*e.centerx();a=(1-c)*a.centery()+c*e.centery();return b.createFromCenter([d,a],[j,g])};return b}();f="undefined"!==typeof exports&&null!==exports?exports:this;A=f.utility.clone;f.AppInit=function(){var b,a,e;b=$("canvas").get(0).getContext("experimental-webgl",{antialias:!0});b.getExtension("OES_texture_float")||glerr("Your browser does not support floating-point textures.");b.getExtension("OES_standard_derivatives")||
glerr("Your browser does not support GLSL derivatives.");e=parseInt($("#overlay").css("width"));a=parseInt($("#overlay").css("height"));return f.renderer=new f.Renderer(b,e,a)};f.MouseClick=function(){return renderer.click()};f.UpdateLabels=G=function(){var b;b=f.renderer.getCurrentLink();$("#crossings").text(b.crossings);$("#subscript").text(b.index);return $("#superscript").text(b.numComponents)};f.OnKeyDown=function(b){var a;a=!1;switch(b){case "left":a=f.renderer.moveSelection(-1);break;case "right":a=
f.renderer.moveSelection(1)}if(a)return null!=f.collapse&&f.collapse.stop(),null!=f.expand&&f.expand.stop(),a=0.25*f.renderer.transitionMilliseconds,f.collapse=b=(new TWEEN.Tween(t)).to(F,a).easing(TWEEN.Easing.Quintic.In).onUpdate(z),f.expand=a=(new TWEEN.Tween(t)).to(x,a).easing(TWEEN.Easing.Quintic.In).onUpdate(z),b.chain(a),f.UpdateLabels=null,f.collapse.onComplete(function(){return f.UpdateLabels=G}),b.start()};F={crossings:10,numComponents:5,index:5};x={crossings:100,numComponents:50,index:50};
t=A(x);z=function(){$("#crossings").css("font-size",t.crossings);$("#superscript").css("font-size",t.numComponents);return $("#subscript").css("font-size",t.index)};f="undefined"!==typeof exports&&null!==exports?exports:this;f.links=[["0.1"],["3.1",[3042,47]],["4.1",[1375,69]],["5.1",[7357,69]],["5.2",[1849,81]],["6.1",[1534,96]],["6.2",[0,82]],["6.3",[10652,85]],["7.1",[7845,94]],["7.2",[5595,86]],["7.3",[190,122]],["7.4",[3640,102]],["7.5",[1751,98]],["7.6",[5020,102]],["7.7",[9660,91]],["8.1",
[1279,96]],["8.2",[9751,108]],["8.3",[2817,112]],["8.4",[3938,105]],["8.5",[4043,105]],["8.6",[4623,90]],["8.7",[1191,88]],["8.8",[5681,100]],["8.9",[1930,98]],["8.10",[9031,85]],["8.11",[1444,90]],["8.12",[4828,94]],["8.13",[6231,90]],["8.14",[885,98]],["8.15",[9574,86]],["8.16",[4148,85]],["8.17",[312,81]],["8.18",[2243,97]],["8.19",[6321,86]],["8.20",[7529,88]],["8.21",[686,89]],["9.1",[7013,102]],["9.2",[10544,108]],["9.3",[4922,98]],["9.4",[3322,89]],["9.5",[3411,114]],["9.6",[8182,98]],["9.7",
[592,94]],["9.8",[10353,91]],["9.9",[2140,103]],["9.10",[8392,112]],["9.11",[9349,120]],["9.12",[2929,113]],["9.13",[9116,123]],["9.14",[3089,102]],["9.15",[7939,116]],["9.16",[5462,133]],["9.17",[10242,111]],["9.18",[82,108]],["9.19",[5122,118]],["9.20",[7725,120]],["9.21",[486,106]],["9.22",[1630,121]],["9.23",[2436,113]],["9.24",[775,110]],["9.25",[6601,102]],["9.26",[3525,115]],["9.27",[6407,89]],["9.28",[7426,103]],["9.29",[8280,112]],["9.30",[5781,111]],["9.31",[6703,120]],["9.32",[8055,127]],
["9.33",[7227,130]],["9.34",[4713,115]],["9.35",[3191,131]],["9.36",[5240,119]],["0.2.1"],["2.2.1",[2648,36],[2684,36]],["4.2.1",[10161,39],[10200,42]],["5.2.1",[8728,38],[8766,39]],["6.2.1",[8931,49],[8980,51]],["6.2.2",[2340,47],[2387,49]],["6.2.3",[3742,41],[3783,54]],["7.2.1",[9859,44],[9903,55]],["7.2.2",[393,45],[438,48]],["7.2.3",[6928,39],[6967,46]],["7.2.4",[6496,77],[6573,28]],["7.2.5",[5892,45],[5937,68]],["7.2.6",[6823,27],[6850,78]],["7.2.7",[10057,78],[10135,26]],["7.2.8",[9239,43],
[9282,67]],["8.2.1",[7115,58],[7173,54]],["8.2.2",[6005,53],[6058,59]],["8.2.3",[8504,42],[8546,63]],["8.2.4",[4357,50],[4407,57]],["8.2.5",[9958,51],[10009,48]],["8.2.6",[10444,46],[10490,54]],["8.2.7",[5359,47],[5406,56]],["8.2.8",[1097,50],[1147,44]],["8.2.9",[2028,42],[2070,70]],["8.2.10",[4233,96],[4329,28]],["8.2.11",[6117,93],[6210,21]],["0.3.1"],["6.3.1",[3837,37],[3874,31],[3905,33]],["6.3.2",[9469,38],[9507,34],[9541,33]],["6.3.3",[2720,35],[2755,30],[2785,32]],["7.3.1",[7617,44],[7661,
33],[7694,31]],["8.3.1",[8805,45],[8850,49],[8899,32]],["8.3.2",[8609,45],[8654,48],[8702,26]],["8.3.3",[983,43],[1026,36],[1062,35]],["8.3.4",[4464,28],[4492,29],[4521,102]],["8.3.5",[2549,26],[2575,29],[2604,44]]];f="undefined"!==typeof exports&&null!==exports?exports:this;u=f.utility.aabb;w=1;p=function(){function b(a,e,c){this.gl=a;this.width=e;this.height=c;this.radiansPerSecond=3.0E-4;this.transitionMilliseconds=750;this.spinning=!0;this.style=w;this.sketchy=!0;this.theta=0;this.vbos={};this.programs=
{};this.selectionIndex=0;this.hotMouse=!1;this.tubeGen=new f.TubeGenerator;this.tubeGen.polygonSides=10;this.tubeGen.b\u00e9zierSlices=3;this.tubeGen.tangentSmoothness=3;this.compileShaders();this.gl.disable(this.gl.CULL_FACE);this.gl.getError()!==this.gl.NO_ERROR&&glerr("OpenGL error during init");this.downloadSpines()}b.name="Renderer";b.prototype.onDownloadComplete=function(a){this.spines=new Float32Array(a.centerlines);this.vbos.spines=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,
this.vbos.spines);this.gl.bufferData(this.gl.ARRAY_BUFFER,this.spines,this.gl.STATIC_DRAW);this.gl.getError()!==this.gl.NO_ERROR&&glerr("Error when trying to create spine VBO");toast("downloaded "+this.spines.length/3+" verts of spine data");this.genVertexBuffers();return this.render()};b.prototype.getCurrentLink=function(){var a;a=this.links[this.selectionIndex].id.split(".");a={crossings:a[0],numComponents:a[1],index:a[2]};1===a.numComponents&&(a.numComponents="");return a};b.prototype.moveSelection=
function(a){a=this.selectionIndex+a;if(!(a>=this.links.length||0>a))return this.changeSelection(a)};b.prototype.changeSelection=function(a){var e,c;e=this.selectionIndex;this.selectionIndex=a;c=this.links[e].iconified;if(0===c)return f.outgoing=(new TWEEN.Tween(this.links[e])).to({iconified:1},0.5*this.transitionMilliseconds).easing(TWEEN.Easing.Quartic.Out),f.incoming=(new TWEEN.Tween(this.links[a])).to({iconified:0},this.transitionMilliseconds).easing(TWEEN.Easing.Bounce.Out),f.incoming.start(),
f.outgoing.start(),!0;this.links[e].iconified=1;this.links[a].iconified=c;return f.incoming.replace(this.links[a])};b.prototype.downloadSpines=function(){var a;a=new Worker("js/downloader.js");a.renderer=this;a.onmessage=function(a){return this.renderer.onDownloadComplete(a.data)};return a.postMessage(document.URL+"data/centerlines.bin")};b.prototype.compileShaders=function(){var a,e,c,g,j,d;j=f.shaders;d=[];for(c in j)e=j[c],"source"!==c&&(a=e.keys,g=a[0],a=a[1],d.push(this.programs[c]=this.compileProgram(g,
a,e.attribs,e.uniforms)));return d};b.prototype.render=function(){var a,e,c,g,j,d,b;window.requestAnimationFrame(function(){return f.renderer.render()},$("canvas").get(0));TWEEN.update();null!=f.UpdateLabels&&f.UpdateLabels();a=this.hotMouse||window.mouse.hot?"pointer":"";$("#rightpage").css({cursor:a});$("#leftpage").css({cursor:a});a=(new Date).getTime();null!=this.previousTime&&(e=a-this.previousTime,this.spinning&&(this.theta+=this.radiansPerSecond*e));this.previousTime=a;this.projection=mat4.perspective(45,
this.width/this.height,5,90);e=mat4.lookAt([0,-5,5],[0,0,0],[0,1,0]);a=mat4.create();this.modelview=mat4.create();mat4.identity(a);mat4.rotateX(a,0.785);mat4.rotateY(a,this.theta);mat4.multiply(e,a,this.modelview);this.normalMatrix=mat4.toMat3(this.modelview);this.updateViewports();b=this.links;c=0;for(j=b.length;c<j;c++){e=b[c];g=0;for(d=e.length;g<d;g++)a=e[g],this.renderKnot(a,e)}if(this.gl.getError()!==this.gl.NO_ERROR)return glerr("Render")};b.prototype.updateViewports=function(){var a,e,c,g,
j,d,b,i,h,k,o,l,n,q;h=a=this.width/this.links.length;c=i=a*this.height/this.width;i=this.height-i/2;k=a/2;a=new u(0,0,this.width,this.height);b=vec2.create([f.mouse.position.x,this.height-f.mouse.position.y]);this.hotMouse=!1;n=this.links;q=[];o=0;for(l=n.length;o<l;o++)j=n[o],g=u.createFromCenter([k,i],[h,c]),e=vec2.dist([k,i],b),d=c/2,e<d&&1===j.iconified&&(e=1-e/d,d/=3,g.inflate(e*e*d),this.hotMouse=!0),j.iconBox=g,e=1-j.iconified,j.centralBox=u.lerp(g,a,e),q.push(k+=h);return q};b.prototype.click=
function(){var a,e,c,g,j,d;if(!(null==this.links||0===this.links.length)){e=vec2.create([f.mouse.position.x,this.height-f.mouse.position.y]);j=this.links;d=[];c=0;for(g=j.length;c<g;c++)a=j[c],a.iconBox.contains(e[0],e[1])&&1===a.iconified?d.push(this.changeSelection(this.links.indexOf(a))):d.push(void 0);return d}};b.prototype.setColor=function(a,e,c){return this.gl.uniform4f(a,e[0],e[1],e[2],c)};b.prototype.renderKnot=function(a,e){var c,g,j,d,b,i,h,f,o,l;g=[0,0,0];j=[0.1,0.1,0.1];c=0.25+0.75*e.iconified;
e.iconBox.viewport(this.gl);this.gl.enable(this.gl.BLEND);this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);d=this.programs.wireframe;this.gl.useProgram(d);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vbos.spines);this.gl.enableVertexAttribArray(POSITION);this.gl.vertexAttribPointer(POSITION,3,this.gl.FLOAT,!1,12,0);this.gl.uniformMatrix4fv(d.projection,!1,this.projection);this.gl.uniformMatrix4fv(d.modelview,!1,this.modelview);this.gl.uniform1f(d.scale,this.tubeGen.scale);this.setColor(d.color,
g,c);i=a.centerline;b=i[0];i=i[1];this.gl.enable(this.gl.DEPTH_TEST);this.gl.lineWidth(2);for(h=o=-1;1>=o;h=o+=2)for(f=l=-1;1>=l;f=l+=2)this.gl.uniform2f(d.offset,h,f),this.gl.uniform1f(d.depthOffset,0),this.gl.drawArrays(this.gl.LINE_LOOP,b,i);this.gl.enable(this.gl.BLEND);this.gl.lineWidth(2);this.setColor(d.color,a.color,c);this.gl.uniform2f(d.offset,0,0);this.gl.uniform1f(d.depthOffset,-0.5);this.gl.drawArrays(this.gl.LINE_LOOP,b,i);this.gl.disableVertexAttribArray(POSITION);e.centralBox.viewport(this.gl);
d=this.programs.solidmesh;this.gl.enable(this.gl.DEPTH_TEST);this.gl.useProgram(d);this.setColor(d.color,a.color,1);this.gl.uniformMatrix4fv(d.projection,!1,this.projection);this.gl.uniformMatrix4fv(d.modelview,!1,this.modelview);this.gl.uniformMatrix3fv(d.normalmatrix,!1,this.normalMatrix);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,a.tube);this.gl.enableVertexAttribArray(POSITION);this.gl.enableVertexAttribArray(NORMAL);this.gl.vertexAttribPointer(POSITION,3,this.gl.FLOAT,!1,24,0);this.gl.vertexAttribPointer(NORMAL,
3,this.gl.FLOAT,!1,24,12);this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,a.triangles);this.style===w&&(this.gl.enable(this.gl.POLYGON_OFFSET_FILL),this.gl.polygonOffset(-1,12));this.gl.drawElements(this.gl.TRIANGLES,a.triangles.count,this.gl.UNSIGNED_SHORT,0);this.gl.disableVertexAttribArray(POSITION);this.gl.disableVertexAttribArray(NORMAL);this.gl.disable(this.gl.POLYGON_OFFSET_FILL);this.gl.enable(this.gl.BLEND);this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);d=this.programs.wireframe;
this.gl.useProgram(d);this.gl.uniformMatrix4fv(d.projection,!1,this.projection);this.gl.uniformMatrix4fv(d.modelview,!1,this.modelview);this.gl.uniform1f(d.scale,1);this.gl.bindBuffer(this.gl.ARRAY_BUFFER,a.tube);this.gl.enableVertexAttribArray(POSITION);this.gl.vertexAttribPointer(POSITION,3,this.gl.FLOAT,!1,24,0);this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,a.wireframe);0===this.style?(this.gl.lineWidth(1),this.gl.uniform1f(d.depthOffset,-0.01),this.setColor(d.color,g,0.75),this.gl.drawElements(this.gl.LINES,
a.wireframe.count,this.gl.UNSIGNED_SHORT,0)):2===this.style?(this.gl.lineWidth(1),this.gl.uniform1f(d.depthOffset,-0.01),this.setColor(d.color,g,0.75),this.gl.drawElements(this.gl.LINES,a.wireframe.count/2,this.gl.UNSIGNED_SHORT,a.wireframe.count)):(this.gl.lineWidth(2),this.gl.uniform1f(d.depthOffset,0.01),this.setColor(d.color,g,1),this.gl.drawElements(this.gl.LINES,a.wireframe.count,this.gl.UNSIGNED_SHORT,0),this.sketchy&&(this.gl.lineWidth(1),this.setColor(d.color,j,1),this.gl.uniform1f(d.depthOffset,
-0.01),this.gl.drawElements(this.gl.LINES,a.wireframe.count/2,this.gl.UNSIGNED_SHORT,a.wireframe.count)));return this.gl.disableVertexAttribArray(POSITION)};b.prototype.getLink=function(a){var e,c,g,j,d;j=f.links;d=[];c=0;for(g=j.length;c<g;c++)e=j[c],e[0]===a&&d.push(e.slice(1));return d[0]};b.prototype.genVertexBuffers=function(){var a,e,c,g,j;this.links=[];j="7.2.3 7.2.4 7.2.5 7.2.6 7.2.7 7.2.8 8.2.1 8.2.2 8.2.3".split(" ");c=0;for(g=j.length;c<g;c++){e=j[c];for(var d=void 0,b=void 0,i=void 0,
h=void 0,i=this.getLink(e),h=[],d=0,b=i.length;d<b;d++)a=i[d],h.push(this.tessKnot(a));a=h;a[0].color=[1,1,1,0.75];1<a.length&&(a[1].color=[0.25,0.5,1,0.75]);2<a.length&&(a[2].color=[1,0.5,0.25,0.75]);a.iconified=1;a.id=e;this.links.push(a)}this.links[0].iconified=0;return f.UpdateLabels()};b.prototype.tessKnot=function(a){var e,c,g,b,d,f,i,h,k,o,l;e=this.tubeGen.getKnotPath(this.spines.subarray(3*a[0],3*a[0]+3*a[1]));i=this.tubeGen.generateTube(e);c=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,
c);this.gl.bufferData(this.gl.ARRAY_BUFFER,i,this.gl.STATIC_DRAW);console.log("Tube positions has "+i.length/3+" verts.");o=c;d=e.length/3-1;h=this.tubeGen.polygonSides;i=new Uint16Array(4*d*h);f=[0,0];c=f[0];for(f=f[1];c<d*(h+1);){for(g=0;g<h;)b=i.subarray(f+2,f+4),b[0]=c+g,b[1]=c+g+h+1,g=[f+2,g+1],f=g[0],g=g[1];c+=h+1}for(c=0;c<d*(h+1);){for(g=0;g<h;)b=i.subarray(f+0,f+2),b[0]=c+g,b[1]=c+g+1,g=[f+2,g+1],f=g[0],g=g[1];c+=h+1}c=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,
c);this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,i,this.gl.STATIC_DRAW);d=c;d.count=i.length;console.log("Tube wireframe has "+i.length+" indices for "+h+" sides and "+(e.length/3-1)+" polygons.");i=new Uint16Array(6*e.length/3*h);g=[0,0,0];c=g[0];f=g[1];for(l=g[2];++c<e.length/3;){for(g=-1;++g<h;)b=(g+1)%h,k=i.subarray(f+0,f+3),k[0]=l+b+h+1,k[1]=l+b,k[2]=l+g,k=i.subarray(f+3,f+6),k[0]=l+g,k[1]=l+g+h+1,k[2]=l+b+h+1,f+=6;l+=h+1}c=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER,
c);this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER,i,this.gl.STATIC_DRAW);e=c;e.count=i.length;return{centerline:a,tube:o,wireframe:d,triangles:e}};b.prototype.compileProgram=function(a,e,c,g){var b,d,m,i,h;b=function(a,c,e){a.compileShader(e);if(!a.getShaderParameter(e,a.COMPILE_STATUS))return $.gritter.add({title:"GLSL Error: "+c,text:a.getShaderInfoLog(e)})};d=f.shaders.source[a];h=this.gl.createShader(this.gl.VERTEX_SHADER);this.gl.shaderSource(h,d);b(this.gl,a,h);m=f.shaders.source[e];d=this.gl.createShader(this.gl.FRAGMENT_SHADER);
this.gl.shaderSource(d,m);b(this.gl,e,d);b=this.gl.createProgram();this.gl.attachShader(b,h);this.gl.attachShader(b,d);for(i in c)h=c[i],this.gl.bindAttribLocation(b,h,i);this.gl.linkProgram(b);this.gl.getProgramParameter(b,this.gl.LINK_STATUS)||glerr("Could not link "+a+" with "+e);for(i in g)h=g[i],b[h]=this.gl.getUniformLocation(b,i);return b};return b}();f.Renderer=p;p=function(){var b,a,e,c;e=["sin","cos","pow","abs"];c=[];b=0;for(a=e.length;b<a;b++)v=e[b],c.push(Math[v]);return c}();D=p[0];
B=p[1];C=vec3.dot;y=2*Math.PI;f="undefined"!==typeof exports&&null!==exports?exports:this;f.shaders={solidmesh:{keys:["VS-Scene","FS-Scene"],attribs:{Position:POSITION,Normal:NORMAL},uniforms:{Projection:"projection",Modelview:"modelview",NormalMatrix:"normalmatrix",Color:"color"}},wireframe:{keys:["VS-Wireframe","FS-Wireframe"],attribs:{Position:POSITION},uniforms:{Projection:"projection",Modelview:"modelview",DepthOffset:"depthOffset",Offset:"offset",Color:"color",Scale:"scale"}},vignette:{keys:["VS-Vignette",
"FS-Vignette"],attribs:{VertexID:VERTEXID},uniforms:{Viewport:"viewport"}}};f.shaders.source={};f.shaders.source["VS-Scene"]="attribute vec4 Position;\nattribute vec3 Normal;\nuniform mat4 Modelview;\nuniform mat4 Projection;\nuniform mat3 NormalMatrix;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvoid main(void)\n{\n    vPosition = Position.xyz;\n    vNormal = NormalMatrix * Normal;\n    gl_Position = Projection * Modelview * Position;\n}";f.shaders.source["VS-Wireframe"]="attribute vec4 Position;\nuniform mat4 Modelview;\nuniform mat4 Projection;\nuniform float DepthOffset;\nuniform float Scale;\nuniform vec2 Offset;\nvoid main(void)\n{\n    vec4 p = Position;\n    p.xyz *= Scale;\n    gl_Position = Projection * Modelview * p;\n    gl_Position.z += DepthOffset;\n    gl_Position.xy += Offset * 0.15;\n}";
f.shaders.source["FS-Wireframe"]="precision highp float;\nprecision highp vec3;\nuniform vec4 Color;\nvoid main()\n{\n    gl_FragColor = Color;\n}";f.shaders.source["FS-Scene"]="precision highp float;\nprecision highp vec3;\nvarying vec3 vNormal;\nvarying vec3 vPosition;\n\nvec3 LightPosition = vec3(0.25, 0.5, 1.0);\nvec3 AmbientMaterial = vec3(0.04, 0.04, 0.04);\nvec3 SpecularMaterial = vec3(0.25, 0.25, 0.25);\nvec3 FrontMaterial = vec3(0.25, 0.5, 0.75);\nvec3 BackMaterial = vec3(0.75, 0.75, 0.7);\nfloat Shininess = 50.0;\n\nuniform vec4 Color;\n\nvoid main()\n{\n    vec3 N = normalize(vNormal);\n    if (!gl_FrontFacing)\n        N = -N;\n\n    vec3 L = normalize(LightPosition);\n    vec3 Eye = vec3(0, 0, 1);\n    vec3 H = normalize(L + Eye);\n\n    float df = max(0.0, dot(N, L));\n    float sf = max(0.0, dot(N, H));\n    sf = pow(sf, Shininess);\n\n    vec3 P = vPosition;\n    vec3 I = normalize(P);\n    float cosTheta = abs(dot(I, N));\n    float fresnel = 1.0 - clamp(pow(1.0 - cosTheta, 0.125), 0.0, 1.0);\n\n    vec3 color = !gl_FrontFacing ? FrontMaterial : BackMaterial;\n    color *= Color.rgb;\n    vec3 lighting = AmbientMaterial + df * color;\n    if (gl_FrontFacing)\n        lighting += sf * SpecularMaterial;\n\n    lighting += fresnel;\n    gl_FragColor = vec4(lighting,1);\n}";
f.shaders.source["VS-Vignette"]="attribute vec2 VertexID;\nvoid main(void)\n{\n    vec2 p = 3.0 - 4.0 * VertexID;\n    gl_Position = vec4(p, 0, 1);\n}";f.shaders.source["FS-Vignette"]="precision highp float;\nprecision highp vec2;\n\nuniform vec2 Viewport;\nvoid main()\n{\n    vec2 c = gl_FragCoord.xy / Viewport;\n    float f = 1.0 - 0.5 * pow(distance(c, vec2(0.5)), 1.5);\n    gl_FragColor = vec4(f, f, f, 1);\n    gl_FragColor.rgb *= vec3(0.867, 0.18, 0.447); // Hot Pink!\n}";f="undefined"!==typeof exports&&
null!==exports?exports:this;p=function(){function b(){this.scale=0.15;this.tangentSmoothness=this.b\u00e9zierSlices=3;this.polygonSides=9;this.radius=0.07}b.name="TubeGenerator";b.prototype.getKnotPath=function(a){var e,c,b,f,d,m,i,h,k,o,l,n,q,r,p,s,E;o=this.b\u00e9zierSlices;k=new Float32Array(a.length*o+3);m=[0,0];f=m[0];for(m=m[1];f<a.length+3;){b=function(){var b,c,e,d;e=[0,2,3,5,6,8];d=[];b=0;for(c=e.length;b<c;b++)i=e[b],d.push((f+i)%a.length);return d}();e=a.subarray(b[0],b[1]+1);c=a.subarray(b[2],
b[3]+1);b=a.subarray(b[4],b[5]+1);n=vec3.create(e);p=vec3.create(c);vec3.lerp(n,c,0.5);vec3.lerp(p,b,0.5);q=vec3.create(n);r=vec3.create(p);vec3.lerp(q,c,1/3);vec3.lerp(r,c,1/3);c=e=1/(o+1);for(s=0;0<=o?s<o:s>o;0<=o?++s:--s){b=1-c;b=[b*b*b,3*b*b*c,3*b*c*c,c*c*c];h=function(){var a,b,c,e;c=[n,q,r,p];e=[];a=0;for(b=c.length;a<b;a++)l=c[a],e.push(vec3.create(l));return e}();for(d=E=0;4>E;d=++E)vec3.scale(h[d],b[d]);h=h.reduce(function(a,b){return vec3.add(a,b)});vec3.scale(h,this.scale);k.set(h,m);m+=
3;if(m>=k.length)return console.log("B\u00e9zier: generated "+m/3+" points from "+a.length/3+" control points."),k;c+=e}f+=3}};b.prototype.generateTube=function(a){var b,c,g,f,d,m,i,h,k,o,l,n,q,r,p,s;o=this.polygonSides;m=this.generateFrames(a);d=a.length/3;k=new Float32Array(6*d*(o+1));n=[0,0];i=n[0];h=n[1];n=vec3.create();for(l=this.radius;i<d;){r=0;g=function(){var a,b;b=[];for(c=a=0;2>=a;c=++a)b.push(m[c].subarray(3*i,3*i+3));return b}();g=function(){var a,d,f;f=[];a=0;for(d=g.length;a<d;a++)b=
g[a],f.push(function(){var a,d;d=[];for(c=a=0;2>=a;c=++a)d.push(b[c]);return d}());return f}();g=g.reduce(function(a,b){return a.concat(b)});g=mat3.create(g);q=0;for(f=y/o;r<o+1;)p=l*B(q),s=l*D(q),mat3.multiplyVec3(g,[p,s,0],n),n[0]+=a[3*i+0],n[1]+=a[3*i+1],n[2]+=a[3*i+2],k.set(n,h),q=[h+6,r+1,q+f],h=q[0],r=q[1],q=q[2];i++}console.log("GenerateTube: generated "+h+" vertices from a centerline with "+d+" nodes.");h=[0,0];i=h[0];h=h[1];l=vec3.create();for(f=vec3.create();i<d;){for(r=0;r<o+1;)n[0]=k[h+
0],n[1]=k[h+1],n[2]=k[h+2],f[0]=a[3*i+0],f[1]=a[3*i+1],f[2]=a[3*i+2],vec3.direction(n,f,l),k.set(l,h+3),r=[h+6,r+1],h=r[0],r=r[1];i++}return k};b.prototype.generateFrames=function(a){var b,c,f,j,d,m,i,h,k,o,l,n;b=a.length/3;c=new Float32Array(3*b);f=new Float32Array(3*b);j=new Float32Array(3*b);for(d=-1;++d<b;)m=(d+1+this.tangentSmoothness)%(b-1),l=a.subarray(3*d,3*d+3),n=a.subarray(3*m,3*m+3),k=j.subarray(3*d,3*d+3),vec3.direction(l,n,k);h=function(){var a,b;b=[];for(a=0;2>=a;++a)b.push(vec3.create());
return b}();i=h[0];k=h[1];l=h[2];d=function(){var a,b;b=[];for(a=0;2>=a;++a)b.push(vec3.create());return b}();h=d[0];o=d[1];n=d[2];vec3.set(j.subarray(0,3),l);H(l,i);vec3.cross(l,i,k);vec3.normalize(i);vec3.normalize(k);vec3.set(i,c.subarray(0,3));vec3.set(k,f.subarray(0,3));m=[0,1];d=m[0];m=m[1];m=[i,k,l];i=m[0];for(k=m[2];d<b-1;)m=d+1,l=a.subarray(3*d,3*d+3),n=a.subarray(3*m,3*m+3),k=j.subarray(3*d,3*d+3),n=j.subarray(3*m,3*m+3),vec3.cross(n,i,o),vec3.normalize(o),vec3.cross(o,n,h),vec3.set(h,c.subarray(3*
m,3*m+3)),vec3.set(o,f.subarray(3*m,3*m+3)),vec3.set(h,i),++d;return[c,f,j]};return b}();f.TubeGenerator=p;y=2*Math.PI;p=function(){var b,a,e,c;e=["sin","cos","pow","abs"];c=[];b=0;for(a=e.length;b<a;b++)v=e[b],c.push(Math[v]);return c}();D=p[0];B=p[1];C=vec3.dot;H=function(b,a){var e;e=vec3.create([1,0,0]);vec3.cross(b,e,a);0.01>C(a,a)&&(vec3.set(e,[0,1,0]),vec3.cross(b,e,a));return vec3.normalize(a)}}).call(this);
