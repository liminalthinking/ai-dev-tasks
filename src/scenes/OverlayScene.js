import { GAME_WIDTH, GAME_HEIGHT } from '../config/SceneConfig';

export class OverlayScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OverlayScene' });
        this.previewIdCounter = 0;
        this.idToSprite = new Map();
    }

    create() {
        // Ensure this scene renders on top
        this.cameras.main.setViewport(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.cameras.main.setScroll(0, 0);
        // Do not capture pointer events; allow underlying scenes to receive input
        if (this.input) {
            this.input.enabled = false;
        }
    }

    showCardPreview({ textureKey, centerX, centerY, cardWidth, cardHeight, preferredAnchor = 'bottom-left', scaleFactor = 1.6 }) {
        // Compute exact texture-based scale so displayed size = cardWidth * scaleFactor
        const tex = this.textures.get(textureKey);
        const src = tex && tex.getSourceImage ? tex.getSourceImage() : null;
        const rawW = src ? src.width : cardWidth;  // fallback prevents NaN
        const rawH = src ? src.height : cardHeight;
        const scaleX = (cardWidth / rawW) * scaleFactor;
        const scaleY = (cardHeight / rawH) * scaleFactor;

        const preview = this.add.image(0, 0, textureKey)
            .setScale(scaleX, scaleY)
            .setDepth(10000);

        // Compute preview width/height using displayed card width/height
        const previewWidth = cardWidth * scaleFactor;
        const previewHeight = cardHeight * scaleFactor;

        // Decide anchor with simple right-bound check
        const prefersLeft = preferredAnchor === 'bottom-left';
        const wouldOverflowRight = (centerX - cardWidth / 2 + previewWidth) > GAME_WIDTH;
        const useLeft = prefersLeft && !wouldOverflowRight ? true : (!prefersLeft && (centerX + cardWidth / 2 - previewWidth) >= 0);

        if (useLeft) {
            preview.setOrigin(0, 1);
            preview.x = centerX - cardWidth / 2;
            preview.y = centerY + cardHeight / 2;
        } else {
            preview.setOrigin(1, 1);
            preview.x = centerX + cardWidth / 2;
            preview.y = centerY + cardHeight / 2;
        }

        const id = `preview-${++this.previewIdCounter}`;
        this.idToSprite.set(id, preview);
        return id;
    }

    hideCardPreview(id) {
        const sprite = this.idToSprite.get(id);
        if (sprite) {
            sprite.destroy();
            this.idToSprite.delete(id);
        }
    }

    clearAll() {
        this.idToSprite.forEach(sprite => sprite.destroy());
        this.idToSprite.clear();
    }
}


