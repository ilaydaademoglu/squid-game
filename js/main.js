const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight ); //renderer should be size of window
document.body.appendChild( renderer.domElement ); //appending renderer to document

renderer.setClearColor(0xb7c3f3, 0.5); //setting background color of renderer (color, opacity)

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

// global variables
const start_pos = 3; 
const end_pos = -start_pos;
const text = document.querySelector(".text");
const TIME_LIMIT = 10;
let gameState = "loading";
let isLookingBackward = true;

 camera.position.z = 5; //how far the scene from the camera 

 var loader = new THREE.GLTFLoader();

 function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class Doll{
    constructor(){
        loader.load("../squid_games_creepy_doll/scene.gltf", (gltf) => {
            scene.add(gltf.scene);
            gltf.scene.scale.set(0.4, 0.4, 0.4);
            gltf.scene.position.set(0, -1.0, 0);
            this.doll = gltf.scene;
        })
    }

    lookBackward() {
        //this.doll.rotation.y = -3.15; //not smooth
        gsap.to(this.doll.rotation , {y: -3.15, duration: .45}); //gsap is used for animation 
        setTimeout(() => {{isLookingBackward = true}}, 150);
    }

    lookForward() {
        //this.doll.rotation.y = 0; 
        gsap.to(this.doll.rotation , {y: 0, duration: .45}); //gsap is used for animation 
        setTimeout(() => {{isLookingBackward = false}}, 450);
    }

    async start(){
        this.lookBackward();
        await delay(Math.random() * 1000 + 1000); //wait for sec between 1s - 2s
        this.lookForward();
        await delay(Math.random() * 750 + 750); //wait for sec between 0.75s - 1.5s
        this.start();
        
    }
}

class Player {
    constructor() { 
        //code to create sphere
        const geometry = new THREE.SphereGeometry( .3, 32, 16 ); //radius, height  width
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const sphere = new THREE.Mesh( geometry, material );
        sphere.position.z = 1;
        sphere.position.x = start_pos;
        scene.add( sphere );
        this.player = sphere;
        this.playerInfo = {
            positionX: start_pos, //where sphere is currently
            velocity: 0, //0 not moving 1 movin
        }
    }

    run() {
        this.playerInfo.velocity = 0.03;
    }

    stop() {
        //this.playerInfo.velocity = 0;
        gsap.to(this.playerInfo , {velocity: 0, duration: .1}); //ball moves for a while and then stops 
    }

    check() { 
      if(this.playerInfo.velocity > 0 && !isLookingBackward) {
            text.innerText = "You lost!";
            gameState = "over";
            this.stop();
        } 
        if(this.playerInfo.positionX <= end_pos + .4) {
            text.innerText = "You win!";
            gameState = "over";
        }
    }

    update() { //called all the time, when there's velocity the position changes immediately
        this.check();
        this.playerInfo.positionX -= this.playerInfo.velocity;
        this.player.position.x = this.playerInfo.positionX;
    }
}


const player = new Player();
let doll = new Doll();
createTrack();
init();


async function init(){
    await delay(500);
    text.innerText = "Starting in 3";
    await delay(1000);
    text.innerText = "Starting in 2";
    await delay(1000);
    text.innerText = "Starting in 1";
    await delay(1000);
    text.innerText = "Go";
    startGame();
}

function startGame(){
    gameState = "started";
    let progressBar = createCube({w:5 , h: .1, d:1}, 0);
    progressBar.position.y = 3.35;
    gsap.to(progressBar.scale, ({x:0, duration: TIME_LIMIT, ease: "none"}));
    doll.start();
    setTimeout(() => {  
        if(gameState !== "over") {
            text.innerText = "Time's up!";
            gameState = "over";
        }
    }, TIME_LIMIT * 1000);
}


function createCube(size, positionX, rotY = 0, color = 0xfbc851) {
    const geometry = new THREE.BoxGeometry( size.w, size.h, size.d );
    const material = new THREE.MeshBasicMaterial( { color: color } );
    const cube = new THREE.Mesh( geometry, material );
    cube.position.x = positionX;
    cube.rotation.y = rotY;
    scene.add( cube );
    return cube;
}


function createTrack() {
    createCube({w: start_pos * 2 + .2, h:1.5, d:1}, 0, 0, 0xe5a716).position.z = -1;
    createCube({w: .2, h:1.5, d:1}, start_pos, -.35);
    createCube({w: .2, h:1.5, d:1}, end_pos, .35);
}


function animate() {
    if(gameState === "over") return;
	renderer.render( scene, camera );
    requestAnimationFrame( animate ); //this function will call animate function again and again
    player.update();
}
animate(); 


//for resizing the window
window.addEventListener( 'resize', onWindowResize, false ) //listening for the resize event 
function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize( window.innerWidth, window.innerHeight )
}

window.addEventListener('keydown', (e) => { //keydown releasing the key
    if(gameState != "started") return;
    if(e.key == 'ArrowUp') {
        player.run();
    }
});

window.addEventListener('keyup', (e) => { //keyup pressing the key
    if(e.key == 'ArrowUp') {
        player.stop();
    }
});