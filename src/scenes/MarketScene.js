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
    }

    preload() {
        // Ensure card images are available; loader skips keys that already exist
        AssetLoader.preloadCardImages(this);
    }

    createScene() {

        // Create 6 market slots in a single row
        const { bounds } = this.config;
        const slotWidth = (bounds.width - 100) / 6;  // Adjust card size to fit scene width
        const gap = 10;  // Gap between cards
        const startX = 50;  // inside viewport
        const y = (bounds.height / 2);  // center in viewport

        for (let i = 0; i < 6; i++) {
            const x = startX + (i * (slotWidth + gap));
            
            const slot = this.add.container(x, y);
            this.marketSlots.push(slot);

            // Add card display with card back initially
            const card = this.add.image(0, 0, 'card-back')
                .setOrigin(0.5)
                .setScale(0.4);  // Adjust scale as needed

            slot.add(card);

            // Make slot interactive
            card.setInteractive()
                .on('pointerover', () => {
                    if (this.isInteractive && card.cardData) {
                        const canAfford = this.cardInteractionSystem.getCurrentResource() >= card.cardData.cost;
                        if (canAfford) {
                            card.setTint(0xcccccc);
                        }
                    }
                })
                .on('pointerout', () => {
                    if (card.cardData) {
                        const canAfford = this.cardInteractionSystem.getCurrentResource() >= card.cardData.cost;
                        if (canAfford) {
                            card.clearTint();
                        } else {
                            card.setTint(0x666666);
                        }
                    }
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

                // Show remaining count and cost
                const count = marketState.supply[cardName];
                if (count > 0) {
                    // Update or create count text
                    if (slot.length > 1) {
                        slot.last.setText(`x${count}`);
                    } else {
                        const countText = this.add.text(30, 30, `x${count}`, {
                            fontSize: '14px',
                            fill: '#ffffff'
                        });
                        slot.add(countText);
                    }

                    // TODO [UI Review - Task 6.1]: Current affordability indicators need improvement
                    // - Using basic color coding (green/red) and opacity changes
                    // - Consider: different visual treatment, more subtle colors, icons
                    // - Improve accessibility for color-blind users
                    
                    // Add or update cost display
                    const costText = slot.getByName('costText') || this.add.text(-30, 30, '', {
                        fontSize: '14px',
                        fill: '#ffffff'
                    }).setName('costText');
                    
                    costText.setText(`${cardData.cost}💰`);
                    costText.setFill(cardData.cost <= currentResource ? '#00ff00' : '#ff0000');
                    
                    if (!slot.getByName('costText')) {
                        slot.add(costText);
                    }

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
            const result = this.gamePhaseManager.handleCardPurchase(cardDisplay.cardData.name);
            
            if (!result.success && result.message) {
                // Show error message in MessagesScene
                const messagesScene = this.scene.get('MessagesScene');
                if (messagesScene) {
                    messagesScene.updatePhaseMessage(result.message);
                }
            }
        }
    }
}