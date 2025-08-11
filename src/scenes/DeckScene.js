import { BaseScene } from './BaseScene';

export class DeckScene extends BaseScene {
    constructor(cardInteractionSystem, gamePhaseManager) {
        super('DeckScene');
        this.cardInteractionSystem = cardInteractionSystem;
        this.gamePhaseManager = gamePhaseManager;
        this.isInteractive = false;
    }

    preload() {
        // Load card back image if not already loaded
        if (!this.textures.exists('card-back')) {
            this.load.image('card-back', 'assets/images/card-back.png');
        }
    }

    createScene() {
        // Position deck in the center of its designated area
        const { bounds } = this.config;
        const cardScale = 0.52; // 30% larger than before
        
        this.deckDisplay = this.add.image(
            (bounds.width / 2),  // Center of scene viewport
            (bounds.height / 2),
            'card-back'
        )
        .setOrigin(0.5)
        .setScale(cardScale);

        // Set up click handling
        this.deckDisplay.setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {
                if (this.isInteractive) {
                    await this.handleDeckClick();
                }
            });

        // Respect current phase; if already in Play Cards, enable immediately
        const isPlayCards = this.gamePhaseManager && this.gamePhaseManager.getCurrentPhase && this.gamePhaseManager.getCurrentPhase() === 'playCards';
        this.setInteractive(!!isPlayCards);
    }

    // Hover preview intentionally disabled for DeckScene per UX request

    setInteractive(enabled) {
        this.isInteractive = enabled;
        this.deckDisplay.setAlpha(enabled ? 1 : 0.7);
        this.deckDisplay.input && this.deckDisplay.input.enabled !== undefined && (this.deckDisplay.input.enabled = enabled);
    }

    async handleDeckClick() {
        const result = await this.gamePhaseManager.handleCardDraw();
        
        if (result.success) {
            // Add card to PlayedCards scene if we drew a card
            if (result.card) {
                const playedCardsScene = this.scene.get('PlayedCardsScene');
                if (playedCardsScene) {
                    playedCardsScene.addCard(result.card);
                }
            }

            // If game is over, disable deck interaction
            if (result.gameOver) {
                this.setInteractive(false);
            }
        }

        // Show any messages from the phase manager
        if (result.message) {
            const messagesScene = this.scene.get('MessagesScene');
            if (messagesScene) {
                messagesScene.updatePhaseMessage(result.message);
            }
        }
    }
}