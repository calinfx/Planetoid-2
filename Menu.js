const worldSizeOptions = [
    { chunkSize: 8, worldSize: 2 },
    { chunkSize: 10, worldSize: 3 },
    { chunkSize: 12, worldSize: 4 }
];

const settingsMenu = document.getElementById('settings-menu');
const sizeSmallButton = document.getElementById('size-small');
const sizeMediumButton = document.getElementById('size-medium');
const sizeLargeButton = document.getElementById('size-large');

function startGame(sizeIndex) {
    if (settingsMenu) {
        settingsMenu.style.display = 'none';
    }
    const selectedSize = worldSizeOptions[sizeIndex];
    
    const startEvent = new CustomEvent('gameStart', {
        detail: {
            chunkSize: selectedSize.chunkSize,
            worldSize: selectedSize.worldSize
        }
    });
    
    window.dispatchEvent(startEvent);
}

// Event listeners for the menu buttons
if (sizeSmallButton) {
  sizeSmallButton.addEventListener('click', () => startGame(0));
}
if (sizeMediumButton) {
  sizeMediumButton.addEventListener('click', () => startGame(1));
}
if (sizeLargeButton) {
  sizeLargeButton.addEventListener('click', () => startGame(2));
}

// Automatically start the game on load with the smallest world
startGame(0);
