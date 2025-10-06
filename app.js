// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Black background

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls for camera movement
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 50;
controls.maxPolarAngle = Math.PI;

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
let verticalLine = null;
let isSnapping = true;
let selectedHandles = [];
let selectedHandle = null;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

// UI Elements
const snapToggle = document.getElementById('snapToggle');
const commitButton = document.getElementById('commit');

// Add version number to UI
const versionNumber = document.createElement('div');
versionNumber.textContent = 'v0.1';
versionNumber.style.color = 'white';
versionNumber.style.fontFamily = 'Arial, sans-serif';
document.getElementById('ui').appendChild(versionNumber);

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
    const handleMaterial = new THREE.MeshBasicMaterial({ color: 0xff6600, side: THREE.DoubleSide });

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
        handle.userData = { originalColor: 0xff6600 };
        scene.add(handle);
        selectedHandles.push(handle);
    });

    // Add extrusion handle (solid neon green cube)
    const extrusionGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const extrusionMaterial = new THREE.MeshBasicMaterial({ color: 0x32CD32 });
    extrusionHandle = new THREE.Mesh(extrusionGeometry, extrusionMaterial);
    extrusionHandle.position.set((x1 + x2) / 2, 0.1, (z1 + z2) / 2);
    extrusionHandle.userData = { originalColor: 0x32CD32 };
    scene.add(extrusionHandle);

    // Add vertical line for extrusion handle
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.1, 0)
    ]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x32CD32 });
    verticalLine = new THREE.Line(lineGeometry, lineMaterial);
    verticalLine.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    scene.add(verticalLine);
}

// Touch controls for mobile
renderer.domElement.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) return; // Ignore pinch zoom
    e.preventDefault();
    const touch = e.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(selectedHandles);
    if (intersects.length > 0) {
        selectedHandle = intersects[0].object;
        selectedHandle.material.color.setHex(0xcc5500); // Darker orange
    } else {
        const extrusionIntersects = raycaster.intersectObject(extrusionHandle);
        if (extrusionIntersects.length > 0) {
            selectedHandle = extrusionHandle;
            selectedHandle.material.color.setHex(0xff6600); // Orange
            verticalLine.material.color.setHex(0xff6600); // Orange line
        }
    }
}, { passive: false });

renderer.domElement.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) return; // Ignore pinch zoom
    e.preventDefault();
    if (selectedHandle) {
        const touch = e.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(plane);
        if (intersects.length > 0) {
            let point = intersects[0].point;
            if (isSnapping) {
                point.x = Math.round(point.x / 0.5) * 0.5;
                point.z = Math.round(point.z / 0.5) * 0.5;
            }
            if (selectedHandle === extrusionHandle) {
                const height = Math.max(0.01, point.y);
                rectangle.scale.y = height;
                rectangle.position.y = height / 2;
                selectedHandle.position.y = height;
                verticalLine.scale.y = height / 0.1;
                verticalLine.position.y = height / 2;
            } else {
                selectedHandle.position.set(point.x, 0.02, point.z);
                updateRectangle();
            }
        }
    }
}, { passive: false });

renderer.domElement.addEventListener('touchend', () => {
    if (selectedHandle) {
        selectedHandle.material.color.setHex(selectedHandle.userData.originalColor);
        if (selectedHandle === extrusionHandle) {
            verticalLine.material.color.setHex(0x32CD32); // Reset line to green
        }
        selectedHandle = null;
    }
}, { passive: false });

// Update rectangle geometry based on handle positions
function updateRectangle() {
    const handlePositions = selectedHandles.map(handle => handle.position);
    const xPositions = handlePositions.map(pos => pos.x);
    const zPositions = handlePositions.map(pos => pos.z);
    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const minZ = Math.min(...zPositions);
    const maxZ = Math.max(...zPositions);

    const width = maxX - minX;
    const depth = maxZ - minZ;

    rectangle.geometry.dispose();
    rectangle.geometry = new THREE.BoxGeometry(width, rectangle.scale.y, depth);
    rectangle.position.set((minX + maxX) / 2, rectangle.position.y, (minZ + maxZ) / 2);

    // Update extrusion handle and line position
    extrusionHandle.position.set((minX + maxX) / 2, rectangle.scale.y, (minZ + maxZ) / 2);
    verticalLine.position.set((minX + maxX) / 2, rectangle.position.y, (minZ + maxZ) / 2);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
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
