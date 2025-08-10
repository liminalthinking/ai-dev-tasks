export class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
    }

    preload() {
        // Load background image
        this.load.image('background', 'assets/images/background.png');
        // Preload all card textures once centrally
        const { AssetLoader } = require('../utils/AssetLoader');
        // Guard to avoid duplicate load events spamming warnings if HMR retriggers preload
        if (!this._assetsLoaded) {
            AssetLoader.preloadCardImages(this);
            this._assetsLoaded = true;
        }
    }

    create() {
        // Add background image
        const bg = this.add.image(0, 0, 'background')
            .setOrigin(0, 0);

        // Scale background to fit game size while maintaining aspect ratio
        const scaleX = this.cameras.main.width / bg.width;
        const scaleY = this.cameras.main.height / bg.height;
        const scale = Math.max(scaleX, scaleY);
        
        bg.setScale(scale);

        // Center the background if it's larger than the viewport
        if (bg.displayWidth > this.cameras.main.width) {
            bg.x = (this.cameras.main.width - bg.displayWidth) / 2;
        }
        if (bg.displayHeight > this.cameras.main.height) {
            bg.y = (this.cameras.main.height - bg.displayHeight) / 2;
        }

        // Add semi-transparent overlay for better card visibility
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.3
        ).setOrigin(0, 0);
    }
}