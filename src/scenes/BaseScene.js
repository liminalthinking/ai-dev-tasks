import { SCENE_CONFIG, SCENE_STYLES } from '../config/SceneConfig';

export class BaseScene extends Phaser.Scene {
    constructor(key) {
        super({ key });
        this.config = SCENE_CONFIG[key];
        if (!this.config) {
            console.warn(`No configuration found for scene: ${key}`);
        }
    }

    create() {
        if (!this.config) return;

        const { bounds, label } = this.config;

        // Render this scene into its own panel using a camera viewport.
        // Keep camera scroll at (0,0) so all scene content uses local coordinates
        // within [0..bounds.width, 0..bounds.height].
        this.cameras.main.setViewport(bounds.x, bounds.y, bounds.width, bounds.height);
        this.cameras.main.setScroll(0, 0);

        // Add label if specified
        if (label) {
            this.addSceneLabel(label);
        }

        // Add debug bounds if enabled
        if (SCENE_STYLES.debugBounds) {
            this.addDebugBounds();
        }

        // Always-on panel frame (subtle), independent of debug mode
        this.addPanelFrame();

        // Call scene-specific create method
        if (this.createScene) {
            this.createScene();
        }
    }

    addSceneLabel(text) {
        // Place label inside the top-left of the scene viewport (local coords)
        const label = this.add.text(
            4,
            4,
            text,
            { ...SCENE_STYLES.labelText, fontFamily: 'Alegreya, serif' }
        );
        label.setDepth(100);
    }

    addDebugBounds() {
        const { bounds } = this.config;
        const { debugColors } = SCENE_STYLES;
        const graphics = this.add.graphics();
        
        // Draw filled background in local coordinates
        graphics.fillStyle(debugColors.background, debugColors.opacity);
        graphics.fillRect(0, 0, bounds.width, bounds.height);
        
        // Draw simple border
        graphics.lineStyle(1, debugColors.border, 1);
        graphics.strokeRect(0, 0, bounds.width, bounds.height);
    }

    // Permanent panel frame for each scene
    addPanelFrame() {
        const { bounds } = this.config;
        const { panelFrame } = SCENE_STYLES;
        const g = this.add.graphics();
        // Subtle background
        g.fillStyle(panelFrame.background, panelFrame.backgroundOpacity);
        g.fillRect(0, 0, bounds.width, bounds.height);
        // Border
        g.lineStyle(panelFrame.thickness, panelFrame.border, 1);
        g.strokeRect(0, 0, bounds.width, bounds.height);
        g.setDepth(1);
    }

    // Helper method to get relative position within scene bounds
    getSceneX(percentX) {
        return (this.config.bounds.width * percentX);
    }

    getSceneY(percentY) {
        return (this.config.bounds.height * percentY);
    }

    // Helper method to check if a point is within scene bounds
    isInBounds(x, y) {
        const { bounds } = this.config;
        return x >= 0 && 
               x <= bounds.width && 
               y >= 0 && 
               y <= bounds.height;
    }
}
