import { BaseScene } from './BaseScene';

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
        // Diagnostics: toggle to show name/texture above each card
        this.enableDiagnostics = true;
        this.cardLeftPadding = 20;
        this.cardOverlapRatio = 0.3; // 30% step from left border
        this.cardDisplayWidth = null;
        this.cardStep = null;
        this.playedCards = [];
    }

    setInteractive(enabled) {
        this.isInteractive = enabled;
        this.playedCards.forEach(cardSprite => {
            const canEvolve = cardSprite.cardData && this.cardInteractionSystem.canEvolveCard(cardSprite.cardData.name);
            cardSprite.setAlpha(enabled && canEvolve ? 1 : 0.7);
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

        // Create evolution info container
        const infoContainer = this.add.container(0, 0);
        
        // Add evolution cost if card can evolve
        if (cardData.evolvesTo) {
            const evolvedCard = this.cardInteractionSystem.getEvolvedCardData(cardData.name);
            if (evolvedCard) {
                // Show evolution cost
                const costText = this.add.text(-20, 40, `${cardData.evolveCost}💰`, {
                    fontSize: '14px',
                    fill: '#ffffff'
                }).setName('costText');
                infoContainer.add(costText);

                // Show evolution arrow and target
                const arrowText = this.add.text(0, 40, '→', {
                    fontSize: '14px',
                    fill: '#ffffff'
                });
                infoContainer.add(arrowText);

                const targetText = this.add.text(20, 40, evolvedCard.name, {
                    fontSize: '12px',
                    fill: '#ffffff'
                });
                infoContainer.add(targetText);
            }
        }

        // Make card interactive for evolution
        cardSprite.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // Show magnified hover preview
                this.showHoverPreview(cardSprite, 'top-right');
                // Show evolution preview if available and interactive
                if (this.isInteractive) {
                    const canEvolve = this.cardInteractionSystem.canEvolveCard(cardData.name);
                    if (!canEvolve) return;
                    // Do not grey out here; just show evolution preview
                    this.showEvolutionPreview(cardData, cardSprite.x, cardSprite.y);
                }
            })
            .on('pointerout', () => {
                this.hideHoverPreview(cardSprite);
                this.hideEvolutionPreview();
            })
            .on('pointerdown', () => {
                if (!this.isInteractive) return;
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
        infoContainer.x = cardSprite.x;

        // Ensure newer cards render on top
        this.cardContainer.add(cardSprite);
        this.cardContainer.add(infoContainer);
        cardSprite.setDepth(10 + index);
        infoContainer.setDepth(10 + index);

        // Diagnostics overlay showing underlying name and image key
        if (this.enableDiagnostics) {
            const diag = this.add.text(0, -110, `${cardData.name} | img:${resolvedKey}`, {
                fontSize: '10px',
                fill: '#ff66ff',
                backgroundColor: '#1a1a1a'
            }).setOrigin(0.5);
            diag.x = cardSprite.x;
            this.cardContainer.add(diag);
            cardSprite.diagText = diag;
            diag.setDepth(11 + index);
        }
        this.playedCards.push(cardSprite);

        // Adjust container position if needed
        this.adjustLayout();

        // Update evolution info display
        this.updateEvolutionInfo(cardSprite);
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
                    fill: '#ffffff'
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

        const canEvolve = this.cardInteractionSystem.canEvolveCard(cardData.name);
        const hasResources = this.cardInteractionSystem.getCurrentResource() >= cardData.evolveCost;

        // Update cost text color based on resources
        // Note: cost text is added to the separate infoContainer, not on the image sprite itself
        // so getByName on the image will be undefined. Safely find the sibling container instead.
        const spriteIndex = this.cardContainer.list.indexOf(cardSprite);
        const sibling = spriteIndex >= 0 ? this.cardContainer.list[spriteIndex + 1] : null;
        if (sibling && sibling.getByName) {
            const costText = sibling.getByName('costText');
            if (costText) {
                costText.setFill(hasResources ? '#00ff00' : '#ff0000');
            }
        }

        // Update card appearance based on evolvability
        if (this.isInteractive) {
            cardSprite.setAlpha(canEvolve ? 1 : 0.7);
            if (!canEvolve) {
                cardSprite.clearTint();
            }
        }
    }

    removeCard(cardData) {
        const index = this.playedCards.findIndex(sprite => sprite.cardData.name === cardData.name);
        if (index !== -1) {
            const cardSprite = this.playedCards[index];
            cardSprite.destroy();
            this.playedCards.splice(index, 1);
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
            // Also move the associated info container
            const infoContainer = this.cardContainer.list[this.cardContainer.list.indexOf(cardSprite) + 1];
            if (infoContainer) {
                infoContainer.x = cardSprite.x;
            }
            if (cardSprite.diagText) {
                cardSprite.diagText.x = cardSprite.x;
            }
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
        }
    }

    clearSelection() {
        this.playedCards.forEach(sprite => sprite.clearTint());
        this.hideEvolutionPreview();
    }
}