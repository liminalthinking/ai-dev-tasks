import { CardData } from '../data/CardProperties';
import { BaseScene } from './BaseScene';
import { AssetLoader } from '../utils/AssetLoader';

export class MarketScene extends BaseScene {
    constructor(cardInteractionSystem, gamePhaseManager) {
        super('MarketScene');
        this.cardInteractionSystem = cardInteractionSystem;
        this.gamePhaseManager = gamePhaseManager;
        this.marketSlots = [];
        this.isInteractive = false;
        this.selectedSlotIndex = null;
        this.hoverPreviews = new Map();
    }

    preload() {
        // Ensure card images are available; loader skips keys that already exist
        AssetLoader.preloadCardImages(this);
    }

    showHoverPreview(cardImage) {
        // Remove existing preview for this card
        this.hideHoverPreview(cardImage);

        const previewScale = (cardImage.scale || 0.52) * 1.6; // 60% larger
        const slot = cardImage.parentContainer;
        const { bounds } = this.config;
        const centerX = bounds.x + slot.x + cardImage.x;
        const centerY = bounds.y + slot.y + cardImage.y;
        const cardW = cardImage.width * cardImage.scaleX;
        const cardH = cardImage.height * cardImage.scaleY;

        // Send to OverlayScene with screen coords
        const overlay = this.scene.get('OverlayScene');
        if (!overlay || !overlay.showCardPreview) return;
        const id = overlay.showCardPreview({
            textureKey: cardImage.texture.key,
            centerX,
            centerY,
            cardWidth: cardW,
            cardHeight: cardH,
            preferredAnchor: 'bottom-left',
            scaleFactor: 1.6
        });
        this.hoverPreviews.set(cardImage, id);
    }

    hideHoverPreview(cardImage) {
        const overlay = this.scene.get('OverlayScene');
        const id = this.hoverPreviews.get(cardImage);
        if (overlay && id) overlay.hideCardPreview(id);
        this.hoverPreviews.delete(cardImage);
    }

    createScene() {

        // Create 6 market slots in a single row
        const { bounds } = this.config;
        const numCards = 6;
        const padding = 20; // maintain 20px padding on both sides
        const cardScale = 0.52; // 30% larger than previous 0.4

        // Estimate card display width from the card-back texture
        const baseTexture = this.textures.get('card-back');
        const baseWidth = baseTexture && baseTexture.getSourceImage() ? baseTexture.getSourceImage().width : 150;
        const cardDisplayWidth = baseWidth * cardScale;

        // Compute evenly spaced centers so card edges keep 20px side padding
        const startCenterX = padding + (cardDisplayWidth / 2);
        const step = (bounds.width - (2 * padding) - cardDisplayWidth) / (numCards - 1);
        const y = (bounds.height / 2);  // center in viewport

        for (let i = 0; i < 6; i++) {
            const x = startCenterX + (i * step);
            
            const slot = this.add.container(x, y);
            this.marketSlots.push(slot);

            // Add card display with card back initially
            const card = this.add.image(0, 0, 'card-back')
                .setOrigin(0.5)
                .setScale(cardScale);  // Increased card size by 30%

            slot.add(card);

            // Make slot interactive
            card.setInteractive()
                .on('pointerover', () => {
                    if (card.cardData) {
                        this.showHoverPreview(card);
                    }
                })
                .on('pointerout', () => {
                    this.hideHoverPreview(card);
                })
                .on('pointerdown', () => {
                    if (this.isInteractive) {
                        this.handleCardClick(i);
                    }
                });
        }

        // Initially disable interactivity
        this.setInteractive(false);

        // Initial market setup
        this.refreshMarket();
    }

    setInteractive(enabled) {
        this.isInteractive = enabled;
        this.marketSlots.forEach(slot => {
            const card = slot.first;
            card.setAlpha(enabled ? 1 : 0.7);
        });
        if (!enabled) this.clearSelection();
    }

    refreshMarket() {
        const marketState = this.cardInteractionSystem.marketCards.getMarketState();
        const currentResource = this.cardInteractionSystem.getCurrentResource();
        
        marketState.slots.forEach((cardName, index) => {
            if (cardName && this.marketSlots[index]) {
                const slot = this.marketSlots[index];
                const cardDisplay = slot.first;
                const cardData = { ...CardData[cardName] };  // Get card data from CardData

                // Update card display
                const textureKey = cardData.imageAsset;
                const resolvedKey = this.textures.exists(textureKey) ? textureKey : 'card-back';
                cardDisplay.setTexture(resolvedKey);
                cardDisplay.cardData = cardData;  // Store card data for reference
                cardDisplay.cardKey = cardName;   // Also store the hyphen-case key for logic

                // Show remaining count and cost
                const count = marketState.supply[cardName];
                if (count > 0) {
                    // Update or create count text (by name, not relying on order)
                    let countText = slot.getByName('countText');
                    if (!countText) {
                        countText = this.add.text(30, 30, `x${count}`, {
                            fontSize: '14px',
                            fill: '#ffffff'
                        }).setName('countText');
                        slot.add(countText);
                    } else {
                        countText.setText(`x${count}`);
                    }

                    // TODO [UI Review - Task 6.1]: Current affordability indicators need improvement
                    // - Using basic color coding (green/red) and opacity changes
                    // - Consider: different visual treatment, more subtle colors, icons
                    // - Improve accessibility for color-blind users
                    
                    // Add or update cost display
                    let costText = slot.getByName('costText');
                    if (!costText) {
                        costText = this.add.text(-30, 30, `${cardData.cost}💰`, {
                            fontSize: '14px',
                            fill: '#ffffff'
                        }).setName('costText');
                        slot.add(costText);
                    } else {
                        costText.setText(`${cardData.cost}💰`);
                    }
                    costText.setFill(cardData.cost <= currentResource ? '#00ff00' : '#ff0000');

                    // TODO [UI Review - Task 6.1]: Review visual feedback approach
                    // Current implementation uses aggressive greying out
                    // Consider more subtle visual hints or different interaction patterns
                    if (this.isInteractive) {
                        if (cardData.cost <= currentResource) {
                            cardDisplay.clearTint();
                            cardDisplay.setAlpha(1);
                        } else {
                            cardDisplay.setTint(0x666666);
                            cardDisplay.setAlpha(0.7);
                        }
                    } else {
                        cardDisplay.setAlpha(0.7);
                    }
                }
            }
        });
    }

    handleCardClick(slotIndex) {
        const slot = this.marketSlots[slotIndex];
        const cardDisplay = slot.first;
        
        if (cardDisplay.cardData) {
            // Select the slot, enable Build button via MessagesScene
            this.selectedSlotIndex = slotIndex;
            this.marketSlots.forEach((s, idx) => {
                const img = s.first;
                if (img) {
                    if (idx === slotIndex) img.setTint(0x66ff66); else img.clearTint();
                }
            });
            const messagesScene = this.scene.get('MessagesScene');
            if (messagesScene) {
                const resource = this.cardInteractionSystem.getCurrentResource();
                messagesScene.updateButtons('build', resource);
            }
        }
    }

    getSelectedCardKey() {
        if (this.selectedSlotIndex == null) return null;
        const slot = this.marketSlots[this.selectedSlotIndex];
        if (!slot) return null;
        const cardDisplay = slot.first;
        return cardDisplay && (cardDisplay.cardKey || (cardDisplay.cardData && cardDisplay.cardData.name)) || null;
    }

    clearSelection() {
        this.selectedSlotIndex = null;
        this.marketSlots.forEach(s => s.first && s.first.clearTint());
    }
}