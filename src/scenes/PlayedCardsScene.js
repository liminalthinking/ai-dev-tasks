import { BaseScene } from './BaseScene';
import { EventBus } from '../managers/EventBus';

export class PlayedCardsScene extends BaseScene {
    constructor(cardInteractionSystem, gamePhaseManager) {
        super('PlayedCardsScene');
        this.cardInteractionSystem = cardInteractionSystem;
        this.gamePhaseManager = gamePhaseManager;
        this.playedCards = [];
        this.isInteractive = false;
    }

    createScene() {
        // Create a container centered within the configured bounds
        const { bounds } = this.config;
        this.cardContainer = this.add.container(
            0,
            bounds.height / 2
        );

        this.cardLeftPadding = 20;
        this.cardOverlapRatio = 0.3; // 30% step from left border
        this.cardDisplayWidth = null;
        this.cardStep = null;
        this.playedCards = [];
    }

    setInteractive(enabled) {
        this.isInteractive = enabled;
        if (!this.playedCards) return;
        
        // Ensure proper opacity for all cards
        this.playedCards.forEach((cardSprite, index) => {
            const isTopCard = index === this.playedCards.length - 1;
            cardSprite.setAlpha(isTopCard ? 1 : 0.5);
            this.updateCardInteractivity(cardSprite);
        });
    }

    addCard(cardData) {
        // Determine stacked X position using overlap
        const index = this.playedCards.length;

        // Create card sprite
        const textureKey = cardData.imageAsset;
        const resolvedKey = this.textures.exists(textureKey) ? textureKey : 'card-back';
        const cardSprite = this.add.image(0, 0, resolvedKey)
            .setOrigin(0.5)
            .setScale(0.52);  // Increased size by 30%
        
        // Store card data with sprite
        cardSprite.cardData = cardData;



        // Make card interactive for evolution
        cardSprite.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // Show magnified hover preview
                this.showHoverPreview(cardSprite, 'top-right');
                // Show evolution preview only if eligible
                if (this.isInteractive && this.isCardEligible(cardData)) {
                    this.showEvolutionPreview(cardData, cardSprite.x, cardSprite.y);
                }
            })
            .on('pointerout', () => {
                this.hideHoverPreview(cardSprite);
                this.hideEvolutionPreview();
            })
            .on('pointerdown', () => {
                if (!this.isInteractive) return;
                if (!this.isCardEligible(cardSprite.cardData)) return;
                // Delegate to existing selection logic
                this.handleCardClick(cardSprite);
            });

        // Add to container and tracking array
        // Compute display width and step on first card
        if (!this.cardDisplayWidth) {
            this.cardDisplayWidth = cardSprite.width * cardSprite.scaleX;
            this.cardStep = this.cardDisplayWidth * this.cardOverlapRatio;
        }

        // Position this card with overlap from the left padding
        const halfWidth = this.cardDisplayWidth / 2;
        cardSprite.x = this.cardLeftPadding + halfWidth + (index * this.cardStep);

        // Ensure newer cards render on top
        this.cardContainer.add(cardSprite);
        cardSprite.setDepth(10 + index);

        // Set initial opacity - this card should be fully opaque as it's the newest
        cardSprite.setAlpha(1);

        this.playedCards.push(cardSprite);

        // Adjust container position if needed
        this.adjustLayout();

        // Update evolution info display
        this.updateEvolutionInfo(cardSprite);
        // Ensure correct interactivity state now that sprite is created
        this.updateCardInteractivity(cardSprite);
    }

    showHoverPreview(cardSprite) {
        if (!this.hoverPreviews) this.hoverPreviews = new Map();
        this.hideHoverPreview(cardSprite);

        const previewScale = (cardSprite.scale || 0.52) * 1.6;
        const { bounds } = this.config;
        const centerX = bounds.x + this.cardContainer.x + cardSprite.x;
        const centerY = bounds.y + this.cardContainer.y + cardSprite.y;
        const cardW = cardSprite.width * cardSprite.scaleX;
        const cardH = cardSprite.height * cardSprite.scaleY;

        const overlay = this.scene.get('OverlayScene');
        if (!overlay || !overlay.showCardPreview) return;
        const id = overlay.showCardPreview({
            textureKey: cardSprite.texture.key,
            centerX,
            centerY,
            cardWidth: cardW,
            cardHeight: cardH,
            preferredAnchor: 'bottom-left',
            scaleFactor: 1.6
        });
        this.hoverPreviews.set(cardSprite, id);
    }

    hideHoverPreview(cardSprite) {
        if (!this.hoverPreviews) return;
        const overlay = this.scene.get('OverlayScene');
        const id = this.hoverPreviews.get(cardSprite);
        if (overlay && id) overlay.hideCardPreview(id);
        this.hoverPreviews.delete(cardSprite);
    }

    showEvolutionPreview(cardData, x, y) {
        const evolvedCard = this.cardInteractionSystem.getEvolvedCardData(cardData.name);
        if (evolvedCard) {
            // Create preview container if it doesn't exist
            if (!this.previewContainer) {
                this.previewContainer = this.add.container(0, 0);
            }

            // Clear previous preview
            this.previewContainer.removeAll(true);

            // Add evolved card preview
            const preview = this.add.image(x, y - 100, evolvedCard.imageAsset)
                .setOrigin(0.5)
                .setScale(0.39)
                .setAlpha(0.8);

            // Add stats comparison
            const statsText = this.add.text(x - 40, y - 150, 
                `Resource: ${cardData.resource} → ${evolvedCard.resource}\n` +
                `Pressure: ${cardData.pressure} → ${evolvedCard.pressure}\n` +
                `Points: ${cardData.points} → ${evolvedCard.points}`, {
                    fontSize: '12px',
                    fill: '#ffffff',
                    fontFamily: 'Alegreya, serif'
                });

            this.previewContainer.add([preview, statsText]);
        }
    }

    hideEvolutionPreview() {
        if (this.previewContainer) {
            this.previewContainer.removeAll(true);
        }
    }

    updateEvolutionInfo(cardSprite) {
        const cardData = cardSprite.cardData;
        if (!cardData) return;

        // Update card appearance and clickability based on eligibility
        this.updateCardInteractivity(cardSprite);
    }

    isCardEligible(cardData) {
        if (!this.isInteractive || !cardData) return false;
        const canEvolve = this.cardInteractionSystem.canEvolveCard(cardData.name);
        const hasResources = this.cardInteractionSystem.getCurrentResource() >= (cardData.evolveCost || 0);
        return canEvolve && hasResources;
    }

    updateCardInteractivity(cardSprite) {
        if (!cardSprite) return;
        const eligible = this.isCardEligible(cardSprite.cardData);
        
        // Don't override opacity here - it's managed by adjustLayout
        // Only clear tint if not eligible
        if (!eligible) {
            cardSprite.clearTint();
        }
    }

    removeCard(cardData) {
        const index = this.playedCards.findIndex(sprite => sprite.cardData.name === cardData.name);
        if (index !== -1) {
            const cardSprite = this.playedCards[index];
            cardSprite.destroy();
            this.playedCards.splice(index, 1);
            
            // Clear all tints before adjusting layout
            this.playedCards.forEach(sprite => sprite.clearTint());
            
            this.adjustLayout();
        }
    }

    adjustLayout() {
        // Reposition remaining cards
        this.playedCards.forEach((cardSprite, index) => {
            // Recompute in case scale changed
            if (!this.cardDisplayWidth) {
                this.cardDisplayWidth = cardSprite.width * cardSprite.scaleX;
                this.cardStep = this.cardDisplayWidth * this.cardOverlapRatio;
            }
            const halfWidth = this.cardDisplayWidth / 2;
            cardSprite.x = this.cardLeftPadding + halfWidth + (index * this.cardStep);
            
            // Update depth to ensure proper layering (newer cards on top)
            cardSprite.setDepth(10 + index);
            
            // Update opacity - only the top card (most recent) should be fully opaque
            const isTopCard = index === this.playedCards.length - 1;
            cardSprite.setAlpha(isTopCard ? 1 : 0.5);
        });
    }

    handleCardClick(cardSprite) {
        // Try to select card for evolution
        const result = this.cardInteractionSystem.selectCardForEvolution(cardSprite.cardData);
        
        // Clear previous selections
        this.playedCards.forEach(sprite => {
            sprite.clearTint();
            // Update evolution info display
            this.updateEvolutionInfo(sprite);
        });
        
        if (result.success) {
            // Highlight selected card with a green tint
            cardSprite.setTint(0x66ff66);
            
            // Update MessagesScene buttons
            const messagesScene = this.scene.get('MessagesScene');
            if (messagesScene) {
                messagesScene.updateButtons('evolve', result.canAffordEvolution);
            }

            // Show evolution preview
            this.showEvolutionPreview(cardSprite.cardData, cardSprite.x, cardSprite.y);

            // Emit selection for tutorial
            try { EventBus.emit('evolve:selected', { card: cardSprite.cardData }); } catch (_) {}
        }
    }

    clearSelection() {
        this.playedCards.forEach(sprite => sprite.clearTint());
        this.hideEvolutionPreview();
    }

    // Tutorial helper: first evolvable card bounds in world space
    getFirstEvolvableBounds() {
        if (!this.playedCards || this.playedCards.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
        for (const sprite of this.playedCards) {
            const data = sprite.cardData;
            if (!data) continue;
            const can = this.cardInteractionSystem.canEvolveCard(data.name) &&
                       this.cardInteractionSystem.getCurrentResource() >= (data.evolveCost || 0);
            if (can) {
                const { bounds } = this.config;
                const w = sprite.width * sprite.scaleX;
                const h = sprite.height * sprite.scaleY;
                const x = bounds.x + this.cardContainer.x + (sprite.x - w / 2);
                const y = bounds.y + this.cardContainer.y + (sprite.y - h / 2);
                return { x, y, width: w, height: h };
            }
        }
        return { x: 0, y: 0, width: 0, height: 0 };
    }
}