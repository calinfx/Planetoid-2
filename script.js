// https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js

// Table of Contents:
// 1. Initialization and Scene Setup
// 2. Hexagonal Block Geometry
// 3. World Generation and Chunking
// 4. Lighting, Materials, and Post-Processing
// 5. Inventory System UI and Logic
// 6. Phone Controls and Input
// 7. Zoom Toggle Logic
// 8. Jetpack Controls
// 9. Game Loop and Rendering

/*
 * Codepen HexagonCraft Game
 * A Minecraft-like game with hexagonal blocks, first-person view,
 * phone controls, and a neon-infused night aesthetic.
 */

// - - - >> 1.00 - Initialization and Scene Setup

// 1.00.00
const scene = new THREE.Scene();

// 1.00.01
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = "YXZ";

// 1.00.02
const renderer = new THREE.WebGLRenderer({ antialias: true });

// 1.00.03
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

// 1.00.04
scene.background = new THREE.Color(0x0a001a);
camera.position.set(0, 10, 20);

// 1.00.05
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// - - - >> 1.00 - ended section 1

// - - - >> 1.01 - Background Objects

// 1.01.00
function createSphere(radius, color, x, y, z) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(x, y, z);
    scene.add(sphere);
    return sphere;
}

// 1.01.01
createSphere(10, 0x00FFFF, 20, 20, -50);
createSphere(5, 0x8A2BE2, -30, 10, -40);
createSphere(8, 0x4B0082, 40, -10, -60);
// - - - >> 1.01 - ended section 1.01

// - - - >> 2.02 - Hexagonal Block Geometry

// 2.02.00
function createHexagonalBlock(x, y, z, color) {
    const radius = 5;
    const height = 5;
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 6, 1, false);
    const material = new THREE.MeshPhongMaterial({ color: color, flatShading: true });
    const block = new THREE.Mesh(geometry, material);

    // 2.02.01
    const hexWidth = Math.sqrt(3) * radius;
    const hexHeight = 1.5 * radius;

    block.position.x = x * hexWidth + (z % 2) * (hexWidth / 2);
    block.position.y = y * height;
    block.position.z = z * hexHeight;

    // 2.02.02
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
}
// - - - >> 2.02 - ended section 2

// - - - >> 3.05 - World Generation and Chunking

// 3.05.00
const world = new THREE.Group();
scene.add(world);

// 3.05.01
let currentChunkSize = 0;
let currentWorldSize = 0;

// 3.05.02
function generateChunk(chunkX, chunkZ) {
    const colors = [
        0x8A2BE2, // Blue Violet (Purple)
        0x4B0082, // Indigo (Dark Purple)
        0x4169E1, // Royal Blue
        0x40E0D0, // Turquoise
        0x00FFFF, // Cyan
        0x32CD32, // Lime Green
        0xFFA500, // Orange
    ];

    for (let i = 0; i < currentChunkSize; i++) {
        for (let j = 0; j < currentChunkSize; j++) {
            const globalX = chunkX * currentChunkSize + i;
            const globalZ = chunkZ * currentChunkSize + j;
            const height = Math.floor(Math.random() * 3);

            // 3.05.03
            for (let k = 0; k <= height; k++) {
                let blockColor;
                if (Math.random() < 0.1) {
                    blockColor = colors[Math.floor(Math.random() * 2) + 5]; // Neon green or Orange
                } else {
                    blockColor = colors[Math.floor(Math.random() * 5)]; // Purple/Turquoise range
                }
                const block = createHexagonalBlock(globalX, k, globalZ, new THREE.Color(blockColor));
                world.add(block);
            }
        }
    }
}

// 3.05.04
window.addEventListener('gameStart', (event) => {
    currentChunkSize = event.detail.chunkSize;
    currentWorldSize = event.detail.worldSize;

    for (let cx = -currentWorldSize; cx <= currentWorldSize; cx++) {
        for (let cz = -currentWorldSize; cz <= currentWorldSize; cz++) {
            generateChunk(cx, cz);
        }
    }
});
// - - - >> 3.05 - ended section 3

// - - - >> 4.00 - Lighting, Materials, and Post-Processing

// 4.00.00
const ambientLight = new THREE.AmbientLight(0x4a008a, 0.5);
scene.add(ambientLight);

// 4.00.01
const directionalLight = new THREE.DirectionalLight(0x8A2BE2, 0.8);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 200;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;
scene.add(directionalLight);

// 4.00.02
const neonGlowLight = new THREE.PointLight(0x00FFFF, 1, 50);
neonGlowLight.position.set(0, 20, 0);
scene.add(neonGlowLight);

// 4.00.03
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// - - - >> 4.00 - ended section 4

// - - - >> 5.00 - Inventory System UI and Logic

// 5.00.00
const inventory = Array(12).fill(null);
let activeSlot = 0;

// 5.00.01
const inventoryUI = document.getElementById('inventory-ui');
const inventoryToggleButton = document.getElementById('inventory-toggle');

// 5.00.02
const inventorySlots = [];
for (let i = 0; i < 12; i++) {
    const slot = document.createElement('div');
    slot.textContent = i + 1;
    slot.dataset.slotIndex = i;
    inventoryUI.appendChild(slot);
    inventorySlots.push(slot);

    // 5.00.03
    slot.addEventListener('click', () => {
        selectSlot(parseInt(slot.dataset.slotIndex));
    });
}

// 5.00.04
inventoryToggleButton.addEventListener('click', () => {
    const isVisible = inventoryUI.style.display === 'grid';
    inventoryUI.style.display = isVisible ? 'none' : 'grid';
});

// 5.00.05
function updateInventoryUI() {
    inventorySlots.forEach((slotElement, index) => {
        if (index === activeSlot) {
            slotElement.style.borderColor = '#00FFFF';
            slotElement.style.boxShadow = '0 0 8px #00FFFF';
        } else {
            slotElement.style.borderColor = '#8A2BE2';
            slotElement.style.boxShadow = 'none';
        }
    });
}

// 5.00.06
function selectSlot(index) {
    activeSlot = index;
    updateInventoryUI();
}
updateInventoryUI();
// - - - >> 5.00 - ended section 5

// - - - >> 6.09 - Phone Controls and Input

// 6.09.00
const player = {
    height: 8,
    speed: 0.17,
    rotationSpeed: 0.002,
    jetpackSpeed: 0.2,
    jetpackAcceleration: 0.005,
    position: new THREE.Vector3(0, 10, 0),
    velocity: new THREE.Vector3(),
    isGrounded: false
};

// 6.09.01
camera.position.copy(player.position).add(new THREE.Vector3(0, player.height, 0));
const moveJoystick = document.getElementById('move-joystick');
const lookJoystick = document.getElementById('look-joystick');

// 6.09.02
let moveJoystickActive = false;
let lookJoystickActive = false;
let moveTouch = new THREE.Vector2(0, 0);
let lookTouch = new THREE.Vector2(0, 0);
let threeFingerSwipeStart = null;

// 6.09.03
const moveJoystickCenter = new THREE.Vector2(0, 0);
const lookJoystickCenter = new THREE.Vector2(0, 0);

// 6.09.04
let zoomEnabled = true;

// 6.09.05
window.addEventListener('touchstart', (event) => {
    if (event.touches.length === 3) {
        threeFingerSwipeStart = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    if (!zoomEnabled) {
        event.preventDefault();
    }
    for (let i = 0; i < event.touches.length; i++) {
        const touch = event.touches[i];
        const target = touch.target;
        const rect = target.getBoundingClientRect();

        // 6.09.06
        if (target === moveJoystick) {
            moveJoystickActive = true;
            moveJoystickCenter.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
            moveTouch.set(touch.clientX, touch.clientY);
        } else if (target === lookJoystick) {
            lookJoystickActive = true;
            lookJoystickCenter.set(rect.left + rect.width / 2, rect.top + rect.height / 2);
            lookTouch.set(touch.clientX, touch.clientY);
        }
    }
}, { passive: false });

// 6.09.07
window.addEventListener('touchend', (event) => {
    moveJoystickActive = false;
    lookJoystickActive = false;
    moveTouch.set(0, 0);
    lookTouch.set(0, 0);
    if (threeFingerSwipeStart && event.touches.length === 0) {
        const swipeEnd = {
            x: event.changedTouches[0].clientX,
            y: event.changedTouches[0].clientY
        };
        const distanceX = Math.abs(swipeEnd.x - threeFingerSwipeStart.x);
        const distanceY = Math.abs(swipeEnd.y - threeFingerSwipeStart.y);
        if (distanceX > 50 || distanceY > 50) {
            toggleZoom();
        }
        threeFingerSwipeStart = null;
    }
});

// 6.09.08
window.addEventListener('touchmove', (event) => {
    if (threeFingerSwipeStart) {
        // Prevent default zoom behavior during swipe
        event.preventDefault();
    }
    if (!zoomEnabled) {
        event.preventDefault();
    }
    if (moveJoystickActive) {
        const touch = event.touches[0];
        moveTouch.set(touch.clientX, touch.clientY);
    } else if (lookJoystickActive) {
        const touch = event.touches[0];
        lookTouch.set(touch.clientX, touch.clientY);
    }
}, { passive: false });
// - - - >> 6.09 - ended section 6

// - - - >> 7.08 - Zoom Toggle Logic

// 7.08.00
const zoomToggleButton = document.getElementById('zoom-toggle');

// 7.08.01
function toggleZoom() {
    zoomEnabled = !zoomEnabled;
    document.documentElement.style.touchAction = zoomEnabled ? 'auto' : 'none';
    if (zoomEnabled) {
        zoomToggleButton.classList.remove('locked');
    } else {
        zoomToggleButton.classList.add('locked');
    }
}

// 7.08.02
zoomToggleButton.addEventListener('click', () => {
    toggleZoom();
});
// - - - >> 7.08 - ended section 7

// - - - >> 8.07 - Jetpack Controls

// 8.07.00
const jetpackButton = document.getElementById('jetpack-button');
let jetpackActive = false;

// 8.07.01
jetpackButton.addEventListener('touchstart', (event) => {
    event.preventDefault();
    jetpackActive = true;
});

// 8.07.02
jetpackButton.addEventListener('touchend', () => {
    jetpackActive = false;
});
// - - - >> 8.07 - ended section 8

// - - - >> 9.12 - Game Loop and Rendering

// 9.12.00
const gravity = -0.05;
let lastTime = 0;
let gameStarted = false;

// 9.12.01
function showGameUI() {
    document.getElementById('inventory-ui').style.display = 'grid';
    document.getElementById('inventory-toggle').style.display = 'block';
    document.getElementById('zoom-toggle').style.display = 'block';
    document.getElementById('jetpack-button').style.display = 'block';
    document.getElementById('crosshair').style.display = 'block';
    document.getElementById('joystick-container').style.display = 'flex';
}

// 9.12.02
function checkCollisions() {
    const playerBBox = new THREE.Box3().setFromCenterAndSize(
        player.position,
        new THREE.Vector3(5, player.height, 5)
    );
    player.isGrounded = false;
    let highestBlockUnderPlayer = -Infinity;

    // 9.12.03
    world.children.forEach(block => {
        const blockBBox = new THREE.Box3().setFromObject(block);
        const blockTopY = blockBBox.max.y;

        // 9.12.04
        // Check for horizontal collision with the player's next position
        const nextPlayerBBox = playerBBox.clone().translate(player.velocity);
        if (nextPlayerBBox.intersectsBox(blockBBox)) {
            // Calculate overlap to determine which axis to stop movement on
            const overlapX = Math.min(nextPlayerBBox.max.x, blockBBox.max.x) - Math.max(nextPlayerBBox.min.x, blockBBox.min.x);
            const overlapZ = Math.min(nextPlayerBBox.max.z, blockBBox.max.z) - Math.max(nextPlayerBBox.min.z, blockBBox.min.z);

            // 9.12.05
            if (overlapX < overlapZ) {
                player.velocity.x = 0;
            } else {
                player.velocity.z = 0;
            }
        }

        // 9.12.06
        // Check for blocks directly under the player to determine landing spot
        const isPlayerAboveBlock =
            player.position.x > blockBBox.min.x && player.position.x < blockBBox.max.x &&
            player.position.z > blockBBox.min.z && player.position.z < blockBBox.max.z &&
            blockTopY > highestBlockUnderPlayer;

        // 9.12.07
        if (isPlayerAboveBlock) {
            highestBlockUnderPlayer = blockTopY;
        }
    });

    // 9.12.08
    // Vertical collision: if player is falling and below the highest block under them, land on it
    if (player.velocity.y < 0 && player.position.y - player.height / 2 <= highestBlockUnderPlayer) {
        player.position.y = highestBlockUnderPlayer + player.height / 2;
        player.velocity.y = 0;
        player.isGrounded = true;
    }

    // 9.12.09
    if (gameStarted) {
        const worldBounds = new THREE.Box3(
            new THREE.Vector3(-currentWorldSize * currentChunkSize * 5, -Infinity, -currentWorldSize * currentChunkSize * 5),
            new THREE.Vector3(currentWorldSize * currentChunkSize * 5, Infinity, currentWorldSize * currentChunkSize * 5)
        );

        // 9.12.10
        if (!worldBounds.containsPoint(player.position)) {
            player.position.clamp(worldBounds.min, worldBounds.max);
        }
    }
}

// 9.12.11
function animate(time) {
    requestAnimationFrame(animate);
    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    // 9.12.12
    if (gameStarted) {
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
        const moveDirection = new THREE.Vector3(0, 0, 0);

        // 9.12.13
        if (moveJoystickActive) {
            const joystickVector = new THREE.Vector2().subVectors(moveTouch, moveJoystickCenter);
            joystickVector.normalize();

            // 9.12.14
            moveDirection.x = -forward.x * joystickVector.y * player.speed;
            moveDirection.z = -forward.z * joystickVector.y * player.speed;
            moveDirection.x += right.x * joystickVector.x * player.speed;
            moveDirection.z += right.z * joystickVector.x * player.speed;
        }

        // 9.12.15
        player.velocity.x = moveDirection.x;
        player.velocity.z = moveDirection.z;

        // 9.12.16
        if (lookJoystickActive) {
            const dx = lookTouch.x - lookJoystickCenter.x;
            const dy = lookTouch.y - lookJoystickCenter.y;

            // 9.12.17
            camera.rotation.y -= dx * player.rotationSpeed;
            camera.rotation.x -= dy * player.rotationSpeed;

            // 9.12.18
            const verticalAngleLimit = THREE.MathUtils.degToRad(70);
            camera.rotation.x = Math.max(-verticalAngleLimit, Math.min(verticalAngleLimit, camera.rotation.x));
        }

        // 9.12.19
        if (jetpackActive) {
            player.velocity.y += player.jetpackAcceleration;
            if (player.velocity.y > player.jetpackSpeed) {
                player.velocity.y = player.jetpackSpeed;
            }
        } else {
            player.velocity.y += gravity;
        }

        // 9.12.20
        player.position.add(player.velocity);
        checkCollisions();
        
        // 9.12.21
        camera.position.copy(player.position).add(new THREE.Vector3(0, player.height, 0));
    }
    renderer.render(scene, camera);
}

// 9.12.22
window.addEventListener('gameStart', () => {
    gameStarted = true;
    showGameUI();
});

// 9.12.23
startGame(0);

animate();
// - - - >> 9.12 - ended section 9
