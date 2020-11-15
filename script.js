// Options
const particleCount = 6000;
		
const particleSize = .3;

const defaultAnimationSpeed = 1,
		morphAnimationSpeed = 18,
	  	color = '#FFFFFF';

// Triggers
const triggers = document.getElementsByTagName('span')

// Renderer
var renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Ensure Full Screen on Resize
function fullScreen () {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

window.addEventListener('resize', fullScreen, false)

// Scene
var scene = new THREE.Scene();

// Camera and position
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );

camera.position.y = -45;
camera.position.z = 45;

// Lighting
var light = new THREE.AmbientLight( 0xFFFFFF, 1 );
scene.add( light );

// Orbit Controls
var controls = new THREE.OrbitControls( camera );
controls.update();

// Particle Vars
var particles = new THREE.Geometry();

var texts = [];

var pMaterial = new THREE.PointCloudMaterial({
			size: particleSize,
});

// Texts
var loader = new THREE.FontLoader();
var typeface = 'https://dl.dropboxusercontent.com/s/bkqic142ik0zjed/swiss_black_cond.json?';

loader.load( typeface, ( font ) => {
	Array.from(triggers).forEach((trigger, idx) => {
		
		texts[idx] = {};
		
		texts[idx].geometry = new THREE.TextGeometry( trigger.textContent, {
			font: font,
			size: window.innerWidth * 0.02,
			height: 4,
			curveSegments: 10,
		});
		
		THREE.GeometryUtils.center( texts[idx].geometry )
			

		texts[idx].particles = new THREE.Geometry();

		texts[idx].points = THREE.GeometryUtils.randomPointsInGeometry(texts[idx].geometry, particleCount);

		createVertices(texts[idx].particles, texts[idx].points)

		enableTrigger(trigger, idx);
		
	});
});

// Particles
for (var p = 0; p < particleCount; p++) {
	var vertex = new THREE.Vector3();
			vertex.x = 0;
			vertex.y = 0;
			vertex.z = 0;

	particles.vertices.push(vertex);
}

function createVertices (emptyArray, points) {
	for (var p = 0; p < particleCount; p++) {
		var vertex = new THREE.Vector3();
				vertex.x = points[p]['x'];
				vertex.y = points[p]['y'];
				vertex.z = points[p]['z'];

		emptyArray.vertices.push(vertex);
	}
}

function enableTrigger(trigger, idx){
	
	
	trigger.setAttribute('data-disabled', false);
	
	trigger.addEventListener('click', () => {
		morphTo(texts[idx].particles, trigger.dataset.color);
	})
	
	if (idx == 0) {
		morphTo(texts[idx].particles, trigger.dataset.color);
	}
}

var particleSystem = new THREE.PointCloud(
    particles,
    pMaterial
);

particleSystem.sortParticles = true;

// Add the particles to the scene
scene.add(particleSystem);

// Animate
const normalSpeed = (defaultAnimationSpeed/100),
			fullSpeed = (morphAnimationSpeed/100)

let animationVars = {
	speed: normalSpeed,
	color: color,
	rotation: -45
}


function animate() {
	
	particleSystem.rotation.y += animationVars.speed;
	particles.verticesNeedUpdate = true; 
	
	camera.position.z = animationVars.rotation;
	camera.position.y = animationVars.rotation;
	camera.lookAt( scene.position );
	
	particleSystem.material.color = new THREE.Color( animationVars.color );
	
	window.requestAnimationFrame( animate );
	renderer.render( scene, camera );
}

animate();

function morphTo (newParticles, color = '#FFFFFF') {
	
	TweenMax.to(animationVars, .1, {
		ease: Power4.easeIn, 
		speed: fullSpeed, 
		onComplete: slowDown
	});
	
	TweenMax.to(animationVars, 2, {
		ease: Linear.easeNone, 
		color: color
	});
	
	
	// particleSystem.material.color.setHex(color);
	
	for (var i = 0; i < particles.vertices.length; i++){
		TweenMax.to(particles.vertices[i], 2, {
			ease: Elastic.easeOut.config( 0.1, .3), 
			x: newParticles.vertices[i].x,
			y: newParticles.vertices[i].y, 
			z: newParticles.vertices[i].z
		})
	}
	
	console.log(animationVars.rotation)
	
	TweenMax.to(animationVars, 2, {
		ease: Elastic.easeOut.config( 0.1, .3), 
		rotation: animationVars.rotation == 45 ? -45 : 45,
	})
}
function slowDown () {
	TweenMax.to(animationVars, 0.3, {ease:
Power2.easeOut, speed: normalSpeed, delay: 0.2});
}