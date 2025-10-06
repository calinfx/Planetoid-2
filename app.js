// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Grid and axes
const gridHelper = new THREE.GridHelper(10, 10, 0x660066, 0x330033); // Violet grid
scene.add(gridHelper);

const axesHelper = new THREE.AxesHelper(5);
axesHelper.setColors(new THREE.Color(0xff0000), new THREE.Color(0x00ff00), new THREE.Color(0x0000ff));
scene.add(axesHelper);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Variables for rectangle and handles
let rectangle = null;
let extrusionHandle = null;
let isSnapping = true;
let selectedHandles = [];

// UI Elements
const snapToggle = document.getElementById('snapToggle');
const commitButton = document.getElementById('commit');

// Toggle snapping
snapToggle.addEventListener('click', () => {
    isSnapping = !isSnapping;
    snapToggle.textContent = `Snap: ${isSnapping ? 'ON' : 'OFF'}`;
});

// Commit action
commitButton.addEventListener('click', () => {
    console.log('Shape committed');
});

// Create rectangle with orange circle handles
function createRectangle(x1, z1, x2, z2) {
    const width = Math.abs(x2 - x1);
    const height = 0.01; // Very thin rectangle
    const depth = Math.abs(z2 - z1);

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    rectangle = new THREE.Mesh(geometry, material);
    rectangle.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    scene.add(rectangle);

    // Add orange circle handles at corners
    const handleGeometry = new THREE.CircleGeometry(0.1, 32);
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600 }); // Orange

    const handlePositions = [
        { x: x1, z: z1 },
        { x: x2, z: z1 },
        { x: x1, z: z2 },
        { x: x2, z: z2 }
    ];

    selectedHandles = [];
    handlePositions.forEach(pos => {
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(pos.x, 0.02, pos.z);
        handle.rotation.x = -Math.PI / 2;
        scene.add(handle);
        selectedHandles.push(handle);
    });

    // Add extrusion handle (neon green cube)
    const extrusionGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const extrusionMaterial = new THREE.MeshBasicMaterial({ color: 0x32CD32, wireframe: true });
    extrusionHandle = new THREE.Mesh(extrusionGeometry, extrusionMaterial);
    extrusionHandle.position.set((x1 + x2) / 2, 0.1, (z1 + z2) / 2);
    scene.add(extrusionHandle);
}

// Touch controls for mobile
let touchStartX, touchStartY;
let isDraggingHandle = false;

renderer.domElement.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isDraggingHandle = checkHandleTouch(touch.clientX, touch.clientY);
}, { passive: false });

renderer.domElement.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (isDraggingHandle) {
        // Logic to move handle and resize rectangle
    }
}, { passive: false });

renderer.domElement.addEventListener('touchend', () => {
    isDraggingHandle = false;
});

// Helper function to check if a handle is touched
function checkHandleTouch(x, y) {
    // Convert screen coordinates to Three.js coordinates
    // Check intersection with handles
    return false; // Placeholder
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation
animate();

// Example: Create a rectangle
createRectangle(-1, -1, 1, 1);
