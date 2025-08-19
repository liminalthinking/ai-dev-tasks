import { CardData } from '../data/CardProperties';
import { BaseScene } from './BaseScene';
import { AssetLoader } from '../utils/AssetLoader';
import { EventBus } from '../managers/EventBus';

export class MarketScene extends BaseScene {
    constructor(cardInteractionSystem, gamePhaseManager) {
        super('MarketScene');
        this.cardInteractionSystem = cardInteractionSystem;
        this.gamePhaseManager = gamePhaseManager;
        this.marketSlots = [];
        this.isInteractive = false;
        this.selectedSlotIndex = null;
        this.hoverPreviews = new Map();
        this.allowedKeys = null; // tutorial whitelist
        this.hoverEnabled = true; // allow disabling mouseover during tutorial
    }

    // No preload required; MarketScene relies on specific card textures only.

    showHoverPreview(cardImage) {
        if (!this.hoverEnabled) return;
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

    // Tutorial helpers to toggle mouseover previews
    disableMouseover() {
        this.hoverEnabled = false;
        // Clear any active previews
        if (this.marketSlots) {
            this.marketSlots.forEach(slot => {
                const img = slot && slot.first;
                if (img) this.hideHoverPreview(img);
            });
        }
    }

    enableMouseover() { this.hoverEnabled = true; }

    createScene() {

        // Create 6 market slots in a single row
        const { bounds } = this.config;
        const numCards = 6;
        const padding = 20; // maintain 20px side padding
        const cardScale = 0.52; // visual scale
        this._marketLayout = { numCards, padding, cardScale };

        // Initial rough positions using fallback width; we'll realign when textures are ready
        const fallbackDisplayWidth = 150 * cardScale;
        const startCenterX = padding + (fallbackDisplayWidth / 2);
        const step = (bounds.width - (2 * padding) - fallbackDisplayWidth) / (numCards - 1);
        const y = (bounds.height / 2);

        for (let i = 0; i < 6; i++) {
            const x = startCenterX + (i * step);
            
            const slot = this.add.container(x, y);
            this.marketSlots.push(slot);

            // Add empty slot initially; will be populated by refreshMarket
            const card = this.add.image(0, 0, '')
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
        // If textures are not yet available, retry until they are
        this.ensureTexturesThenRefresh();
    }

    setInteractive(enabled) {
        this.isInteractive = enabled;
        // If createScene hasn't run yet, slots may be empty
        if (!this.marketSlots || this.marketSlots.length === 0) return;
        
        // Update opacity for all cards based on new interactivity state
        this.marketSlots.forEach(slot => {
            const card = slot && slot.first;
            if (card && card.isAffordable !== undefined) {
                this.updateCardOpacity(card, card.isAffordable);
            }
        });
        
        if (!enabled) this.clearSelection();
        // Re-evaluate affordability and visuals when toggling interactivity
        if (enabled) {
            this.refreshMarket();
        }
    }

    refreshMarket() {
        const marketState = this.cardInteractionSystem.marketCards.getMarketState();
        const currentResource = this.cardInteractionSystem.getCurrentResource();
        
        marketState.slots.forEach((cardName, index) => {
            if (cardName && this.marketSlots[index]) {
                const slot = this.marketSlots[index];
                const cardDisplay = slot.first;
                if (!cardDisplay || !cardDisplay.setTexture) {
                    return; // slot not ready yet
                }
                const cardData = { ...CardData[cardName] };  // Get card data from CardData

                // Update card display
                const textureKey = cardData.imageAsset;
                if (this.textures.exists(textureKey)) {
                    cardDisplay.setTexture(textureKey);
                    cardDisplay.setVisible(true);
                } else {
                    // If texture not ready, hide until available
                    cardDisplay.setVisible(false);
                }
                cardDisplay.cardData = cardData;  // Store card data for reference
                cardDisplay.cardKey = cardName;   // Also store the hyphen-case key for logic

                                    // Show remaining count
                    const count = marketState.supply[cardName];
                    if (count > 0) {
                        // Update or create count text positioned below the card
                        let countText = slot.getByName('countText');
                        if (!countText) {
                            countText = this.add.text(0, 100, `x${count}`, {
                                fontSize: '14px',
                                fill: '#ffffff',
                                fontFamily: 'Alegreya, serif'
                            }).setOrigin(0.5).setName('countText');
                            slot.add(countText);
                        } else {
                            countText.setText(`x${count}`);
                        }

                    // TODO [UI Review - Task 6.1]: Review visual feedback approach
                    // Current implementation uses aggressive greying out
                    // Consider more subtle visual hints or different interaction patterns
                    const affordable = cardData.cost <= currentResource;
                    cardDisplay.isAffordable = affordable;
                    
                    // Apply consistent opacity based on affordability and interactivity
                    this.updateCardOpacity(cardDisplay, affordable);

                    // Do not disable input; pointerdown handler checks affordability
                } else {
                    // No card available in this slot; hide image and texts
                    cardDisplay.setVisible(false);
                    const countText = slot.getByName('countText');
                    if (countText) countText.setVisible(false);
                }
            }
        });
    }

    ensureTexturesThenRefresh() {
        const marketState = this.cardInteractionSystem.marketCards.getMarketState();
        const neededKeys = marketState.slots
            .map(name => CardData[name])
            .filter(Boolean)
            .map(c => c.imageAsset);
        const allReady = neededKeys.every(k => this.textures.exists(k));
        if (allReady) {
            this.refreshMarket();
            this.relayoutSlotsWithActualWidth();
        } else {
            this.time.delayedCall(50, () => this.ensureTexturesThenRefresh());
        }
    }

    relayoutSlotsWithActualWidth() {
        const { bounds } = this.config;
        const { numCards, padding, cardScale } = this._marketLayout;
        // pick the first market texture that exists to measure
        const marketState = this.cardInteractionSystem.marketCards.getMarketState();
        let baseWidth = 150;
        for (const name of marketState.slots) {
            const data = CardData[name];
            if (!data) continue;
            const tex = this.textures.get(data.imageAsset);
            const img = tex && tex.getSourceImage ? tex.getSourceImage() : null;
            if (img && img.width) { baseWidth = img.width; break; }
        }
        const displayWidth = baseWidth * cardScale;
        const startCenterX = padding + (displayWidth / 2);
        const step = (bounds.width - (2 * padding) - displayWidth) / (numCards - 1);
        const y = (bounds.height / 2);
        this.marketSlots.forEach((slot, i) => {
            slot.x = startCenterX + (i * step);
            slot.y = y;
        });
    }

    handleCardClick(slotIndex) {
        const slot = this.marketSlots[slotIndex];
        const cardDisplay = slot.first;
        
        if (cardDisplay.cardData) {
            // Only allow selection when card is affordable
            const key = cardDisplay.cardKey;
            if (this.allowedKeys && !this.allowedKeys.includes(key)) return;
            const canBuild = key && this.cardInteractionSystem.canBuildCard(key);
            if (!canBuild) return;
            // Select the slot, enable Build button via MessagesScene
            this.selectedSlotIndex = slotIndex;
            this.marketSlots.forEach((s, idx) => {
                const img = s.first;
                if (img) {
                    if (idx === slotIndex) {
                        img.setTint(0x66ff66);
                    } else {
                        img.clearTint();
                        // Restore the original opacity using the dedicated method
                        if (img.isAffordable !== undefined) {
                            this.updateCardOpacity(img, img.isAffordable);
                        }
                    }
                }
            });
            const messagesScene = this.scene.get('MessagesScene');
            if (messagesScene) {
                const resource = this.cardInteractionSystem.getCurrentResource();
                messagesScene.updateButtons('build', resource);
            }
            try {
                EventBus.emit('market:slotSelected', { key });
                // Additional selection events for tutorial waits
                EventBus.emit('market:selected', { key });
                EventBus.emit(`market:selected:${key}`);
            } catch (_) {}
        }
    }

    getSelectedCardKey() {
        if (this.selectedSlotIndex == null) return null;
        const slot = this.marketSlots[this.selectedSlotIndex];
        if (!slot) return null;
        const cardDisplay = slot.first;
        return cardDisplay && (cardDisplay.cardKey || (cardDisplay.cardData && cardDisplay.cardData.name)) || null;
    }

    updateCardOpacity(cardDisplay, affordable) {
        if (!cardDisplay) return;
        
        if (this.isInteractive) {
            if (affordable) {
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

    clearSelection() {
        this.selectedSlotIndex = null;
        this.marketSlots.forEach(s => {
            const img = s.first;
            if (img) {
                img.clearTint();
                // Restore proper opacity using the dedicated method
                if (img.isAffordable !== undefined) {
                    this.updateCardOpacity(img, img.isAffordable);
                }
            }
        });
    }

    // Tutorial helpers
    getSlotBounds(index) {
        const slot = this.marketSlots[index];
        if (!slot) return { x: 0, y: 0, width: 0, height: 0 };
        const img = slot.first;
        if (!img) return { x: 0, y: 0, width: 0, height: 0 };
        const { bounds } = this.config;
        const w = img.width * img.scaleX;
        const h = img.height * img.scaleY;
        const x = bounds.x + slot.x + (img.x - w / 2);
        const y = bounds.y + slot.y + (img.y - h / 2);
        return { x, y, width: w, height: h };
    }

    // Return indexes of all affordable cards currently visible in the market
    getAffordableSlotIndexes() {
        const out = [];
        this.marketSlots.forEach((slot, i) => {
            const img = slot && slot.first;
            if (img && img.visible !== false && img.isAffordable) {
                out.push(i);
            }
        });
        return out;
    }

    // Return bounds for all affordable cards
    getAffordableSlotBounds() {
        return this.getAffordableSlotIndexes().map(i => this.getSlotBounds(i));
    }

    setAllowedKeys(keysOrNull) {
        this.allowedKeys = Array.isArray(keysOrNull) ? [...keysOrNull] : null;
    }
}