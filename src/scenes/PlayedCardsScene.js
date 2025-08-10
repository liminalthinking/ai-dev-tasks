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
            bounds.width / 2,
            bounds.height / 2
        );
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
        const x = this.playedCards.length * 130;  // Space cards horizontally
        
        // Create card sprite
        const textureKey = cardData.imageAsset;
        const resolvedKey = this.textures.exists(textureKey) ? textureKey : 'card-back';
        const cardSprite = this.add.image(x, 0, resolvedKey)
            .setOrigin(0.5)
            .setScale(0.4);  // Adjust scale as needed
        
        // Store card data with sprite
        cardSprite.cardData = cardData;

        // Create evolution info container
        const infoContainer = this.add.container(x, 0);
        
        // Add evolution cost if card can evolve
        if (cardData.evolvesTo) {
            const evolvedCard = this.cardInteractionSystem.getEvolvedCardData(cardData.name);
            if (evolvedCard) {
                // Show evolution cost
                const costText = this.add.text(-20, 40, `${cardData.evolveCost}💰`, {
                    fontSize: '14px',
                    fill: '#ffffff'
                });
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
        cardSprite.setInteractive()
            .on('pointerover', () => {
                if (this.isInteractive) {
                    const canEvolve = this.cardInteractionSystem.canEvolveCard(cardData.name);
                    if (canEvolve) {
                        cardSprite.setTint(0xcccccc);
                        // Show evolution preview if available
                        this.showEvolutionPreview(cardData, cardSprite.x, cardSprite.y);
                    }
                }
            })
            .on('pointerout', () => {
                cardSprite.clearTint();
                this.hideEvolutionPreview();
            })
            .on('pointerdown', () => {
                if (this.isInteractive) {
                    this.handleCardClick(cardSprite);
                }
            });

        // Add to container and tracking array
        this.cardContainer.add(cardSprite);
        this.cardContainer.add(infoContainer);
        this.playedCards.push(cardSprite);

        // Adjust container position if needed
        this.adjustLayout();

        // Update evolution info display
        this.updateEvolutionInfo(cardSprite);
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
                .setScale(0.3)
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
        const costText = cardSprite.getByName('costText');
        if (costText) {
            costText.setFill(hasResources ? '#00ff00' : '#ff0000');
        }

        // Update card appearance based on evolvability
        if (this.isInteractive) {
            cardSprite.setAlpha(canEvolve ? 1 : 0.7);
            if (!canEvolve) {
                cardSprite.setTint(0x666666);
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
            cardSprite.x = index * 130;
            // Also move the associated info container
            const infoContainer = this.cardContainer.list[this.cardContainer.list.indexOf(cardSprite) + 1];
            if (infoContainer) {
                infoContainer.x = cardSprite.x;
            }
        });
    }

    handleCardClick(cardSprite) {
        // Try to select card for evolution
        const result = this.cardInteractionSystem.selectCardForEvolution(cardSprite.cardData);
        
        // Clear previous selections
        this.playedCards.forEach(sprite => {
            sprite.setStroke('#ffffff', 0);
            // Update evolution info display
            this.updateEvolutionInfo(sprite);
        });
        
        if (result.success) {
            // Highlight selected card
            cardSprite.setStroke('#00ff00', 2);
            
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
        this.playedCards.forEach(sprite => sprite.setStroke('#ffffff', 0));
        this.hideEvolutionPreview();
    }
}