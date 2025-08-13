export class BackgroundScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BackgroundScene' });
    }

    preload() {
        // Load background image and all card textures centrally (excluding card-back)
        this.load.image('background', 'assets/images/background.png');
        const { AssetLoader } = require('../utils/AssetLoader');
        // Queue textures; AssetLoader internally skips already-loaded keys.
        AssetLoader.preloadCardImages(this);
    }

    create() {
        // Emit a create event that SceneManager/GamePhaseManager can listen to
        // to know when assets are ready and scenes can safely start/update.
        // Phaser will emit CREATE internally; we rely on that listener. No-op here.
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