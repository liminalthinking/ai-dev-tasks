import { GAME_WIDTH, GAME_HEIGHT } from '../config/SceneConfig';

export class TutorialScene extends Phaser.Scene {
    constructor(tutorialManager) {
        super({ key: 'TutorialScene' });
        this.tutorialManager = tutorialManager;
        this.ui = {};
        this.currentStepId = null;
        this._mediaInfo = null;
    }

    create() {
        this.cameras.main.setViewport(0, 0, GAME_WIDTH, GAME_HEIGHT);
        this.cameras.main.setScroll(0, 0);

        // Overlay container
        this.ui.root = this.add.container(0, 0).setDepth(20000);

        // Dim background
        this.ui.dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: false });
        this.ui.root.add(this.ui.dim);
        
        // Shaded frame for visual dimming (we'll draw 4 rects around the highlight area)
        this.ui.shade = this.add.graphics();
        this.ui.root.add(this.ui.shade);

        // Spotlight highlight rectangle (simple outline for scaffold)
        this.ui.highlight = this.add.graphics();
        this.ui.root.add(this.ui.highlight);

        // Panel elements
        this.ui.panel = this.add.container(0, 0);
        this.ui.panelBg = this.add.rectangle(0, 0, 520, 140, 0x111111, 0.92).setOrigin(0, 0);
        this.ui.title = this.add.text(0, 0, '', {
            fontSize: '20px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            wordWrap: { width: 520 }
        });
        this.ui.body = this.add.text(0, 0, '', {
            fontSize: '16px',
            fill: '#dddddd',
            fontFamily: 'Alegreya, serif',
            wordWrap: { width: 520 }
        });
        this.ui.panel.add([this.ui.panelBg, this.ui.title, this.ui.body]);
        this.ui.root.add(this.ui.panel);

        // Media area for card-explainer
        this.ui.mediaContainer = this.add.container(0, 0);
        this.ui.root.add(this.ui.mediaContainer);

        // Exit button
        this.ui.exitBtn = this.add.text(GAME_WIDTH - 12, 12, 'Exit Tutorial', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            backgroundColor: '#444444',
            padding: { x: 8, y: 6 }
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true })
        .on('pointerover', () => this.ui.exitBtn.setBackgroundColor('#666666'))
        .on('pointerout', () => this.ui.exitBtn.setBackgroundColor('#444444'))
        .on('pointerdown', () => this.tutorialManager && this.tutorialManager.exitToIntro());
        this.ui.root.add(this.ui.exitBtn);

        // Block clicks by default
        this.ui.dim.on('pointerdown', () => {
            // Allow tutorial manager to decide advancement when configured as clickAnywhere
            if (this.tutorialManager) this.tutorialManager.handleBackdropClick();
        });

        // Kick off
        if (this.tutorialManager) {
            this.tutorialManager.attachScene(this);
            this.tutorialManager.start();
        }
    }

    // Public API called by manager
    renderStep(step) {
        this.currentStepId = step && step.id;
        // Clear media
        this.ui.mediaContainer.removeAll(true);

        // Title/body
        const title = step.title || '';
        const text = step.text || '';
        const maxWidth = (step.panel && step.panel.maxWidth) || 520;
        this.ui.title.setText(title);
        this.ui.title.setStyle({ wordWrap: { width: maxWidth } });
        this.ui.body.setText(text);
        this.ui.body.setStyle({ wordWrap: { width: maxWidth } });

        // Layout panel size
        // First position at 0,0 to measure
        if (title === '') {
            // No title: don't show title, don't offset body
            this.ui.title.setPosition(16, 14);
            this.ui.title.setText(''); // ensure it's empty
            this.ui.body.setPosition(16, 14);
            var bodyBottom = this.ui.body.y + this.ui.body.height;
        } else {
            this.ui.title.setPosition(16, 14);
            const titleBottom = this.ui.title.y + this.ui.title.height;
            this.ui.body.setPosition(16, titleBottom + 10);
            var bodyBottom = this.ui.body.y + this.ui.body.height;
        }
        const panelWidth = maxWidth + 32;
        const panelHeight = bodyBottom + 16;
        this.ui.panelBg.setSize(panelWidth, panelHeight);

        // Position panel by anchor
        const anchor = (step.panel && step.panel.anchor) || 'top-center';
        const offsetX = (step.panel && step.panel.offsetX) || 0;
        const offsetY = (step.panel && step.panel.offsetY) || 0;
        const pos = this._anchorToXY(anchor, panelWidth, panelHeight);
        this.ui.panel.setPosition(pos.x + offsetX, pos.y + offsetY);

        // Enable/disable backdrop interactivity depending on step advancement
        const shouldSwallow = (step && (step.advance === 'clickAnywhere' || step.waitFor === 'next'));
        if (shouldSwallow) {
            this.ui.dim.setInteractive({ useHandCursor: false });
        } else {
            this.ui.dim.disableInteractive();
        }

        // Compute highlight rectangles once
        let rects = [];
        if (step && typeof step.highlight === 'function') {
            try {
                const result = step.highlight();
                rects = Array.isArray(result) ? result : (result ? [result] : []);
            } catch (_) {}
        }

        // If there are multiple highlights, use a simple bounding box for the frame
        // to avoid over-darkening when drawing 4-rect frames per hole.
        let frameRects = rects;
        if (rects.length > 1) {
            const minX = Math.min(...rects.map(r => r.x));
            const minY = Math.min(...rects.map(r => r.y));
            const maxX = Math.max(...rects.map(r => r.x + r.width));
            const maxY = Math.max(...rects.map(r => r.y + r.height));
            frameRects = [{ x: minX, y: minY, width: maxX - minX, height: maxY - minY }];
        }

        // Draw visual dim as a frame around the highlight rect(s)
        this.ui.shade.clear();
        this.ui.shade.fillStyle(0x000000, 0.75);
        if (!frameRects.length) {
            // No highlight: dim whole screen
            this.ui.shade.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        } else {
            frameRects.forEach(r => {
                if (!r || !r.width || !r.height) return;
                // top
                this.ui.shade.fillRect(0, 0, GAME_WIDTH, r.y);
                // left
                this.ui.shade.fillRect(0, r.y, r.x, r.height);
                // right
                this.ui.shade.fillRect(r.x + r.width, r.y, GAME_WIDTH - (r.x + r.width), r.height);
                // bottom
                this.ui.shade.fillRect(0, r.y + r.height, GAME_WIDTH, GAME_HEIGHT - (r.y + r.height));
            });
        }

        // Keep input-swallowing rectangle transparent; shade handles the visual dim
        this.ui.dim.setFillStyle(0x000000, 0);

        // Draw highlight outlines
        this.ui.highlight.clear();
        if (rects.length) {
            this.ui.highlight.lineStyle(3, 0xFF0000, 1);
            rects.forEach(r => {
                this.ui.highlight.strokeRect(r.x, r.y, r.width, r.height);
            });
        }

        // Media (card-explainer)
        if (step.mode === 'card-explainer' && step.media && step.media.textureKey) {
            const texKey = step.media.textureKey;
            if (!this.textures.exists(texKey) && step.media.url) {
                this.load.image(texKey, step.media.url);
                this.load.once('complete', () => this._renderMedia(step));
                this.load.start();
            } else {
                this._renderMedia(step);
            }
        }
    }

    _renderMedia(step) {
        const texKey = step.media.textureKey;
        const image = this.add.image(0, 0, texKey).setOrigin(0.5);
        // Fit sizing
        const fit = step.media.fit || 'contain';
        let targetW = 380;
        let targetH = 520;
        if (typeof fit === 'object') { targetW = fit.width; targetH = fit.height; }
        const src = this.textures.get(texKey).getSourceImage();
        const scale = Math.min(targetW / src.width, targetH / src.height);
        image.setScale(scale);

        // Position by anchor
        // Normalize anchor synonyms (e.g., 'center-center' -> 'center')
        const anchor = (step.media.anchor === 'center-center') ? 'center' : (step.media.anchor || 'center');
        const offsetX = step.media.offsetX || 0;
        const offsetY = step.media.offsetY || 0;
        const b = image.getBounds();
        const pos = this._anchorToXY(anchor, b.width, b.height);
        image.setPosition(pos.x + b.width / 2 + offsetX, pos.y + b.height / 2 + offsetY);
        this.ui.mediaContainer.add(image);

        // Persist media info for other steps to reference (e.g., highlight relative to media)
        const centerX = image.x;
        const centerY = image.y;
        const topLeftX = pos.x + offsetX;
        const topLeftY = pos.y + offsetY;
        this._mediaInfo = {
            anchor,
            offsetX,
            offsetY,
            displayWidth: image.displayWidth,
            displayHeight: image.displayHeight,
            center: { x: centerX, y: centerY },
            topLeft: { x: topLeftX, y: topLeftY },
            rect: { x: centerX - image.displayWidth / 2, y: centerY - image.displayHeight / 2, width: image.displayWidth, height: image.displayHeight }
        };

        // Caption
        if (step.media.caption) {
            const caption = this.add.text(image.x, image.y + (image.displayHeight / 2) + 10, step.media.caption, {
                fontSize: '14px', fill: '#eeeeee', fontFamily: 'Alegreya, serif', align: 'center', wordWrap: { width: Math.max(image.displayWidth, 320) }
            }).setOrigin(0.5, 0);
            this.ui.mediaContainer.add(caption);
        }

        // Ensure highlight stays above media (media can be added asynchronously after loads)
        if (this.ui && this.ui.root && this.ui.highlight) {
            this.ui.root.bringToTop(this.ui.highlight);
        }
        // Keep Exit button above the highlight
        if (this.ui && this.ui.root && this.ui.exitBtn) {
            this.ui.root.bringToTop(this.ui.exitBtn);
        }
    }

    _anchorToXY(anchor, width, height) {
        const gw = GAME_WIDTH, gh = GAME_HEIGHT;
        switch (anchor) {
            case 'top-left': return { x: 12, y: 12 };
            case 'top-center': return { x: (gw - width) / 2, y: 12 };
            case 'top-right': return { x: gw - width - 12, y: 12 };
            case 'center-left': return { x: 12, y: (gh - height) / 2 };
            case 'center': return { x: (gw - width) / 2, y: (gh - height) / 2 };
            case 'center-center': return { x: (gw - width) / 2, y: (gh - height) / 2 };
            case 'center-right': return { x: gw - width - 12, y: (gh - height) / 2 };
            case 'bottom-left': return { x: 12, y: gh - height - 12 };
            case 'bottom-center': return { x: (gw - width) / 2, y: gh - height - 12 };
            case 'bottom-right': return { x: gw - width - 12, y: gh - height - 12 };
            default: return { x: (gw - width) / 2, y: 12 };
        }
    }

    // Expose most recent media placement/sizing so highlights can be computed relative to the enlarged card
    getMediaInfo() {
        // Return a shallow copy to avoid accidental external mutation
        if (!this._mediaInfo) return null;
        const i = this._mediaInfo;
        return {
            anchor: i.anchor,
            offsetX: i.offsetX,
            offsetY: i.offsetY,
            displayWidth: i.displayWidth,
            displayHeight: i.displayHeight,
            center: { x: i.center.x, y: i.center.y },
            topLeft: { x: i.topLeft.x, y: i.topLeft.y },
            rect: { x: i.rect.x, y: i.rect.y, width: i.rect.width, height: i.rect.height }
        };
    }
}


