import { BaseScene } from './BaseScene';
import { EventBus } from '../managers/EventBus';

export class DeckScene extends BaseScene {
    constructor(cardInteractionSystem, gamePhaseManager) {
        super('DeckScene');
        this.cardInteractionSystem = cardInteractionSystem;
        this.gamePhaseManager = gamePhaseManager;
        this.isInteractive = false;
    }

    preload() {
        // DeckScene is the sole owner of 'card-back' texture
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

        // Ensure texture exists at this moment; if not, set once available
        if (!this.textures.exists('card-back')) {
            this.events.once(Phaser.Scenes.Events.CREATE, () => {
                if (this.deckDisplay && this.textures.exists('card-back')) {
                    this.deckDisplay.setTexture('card-back');
                }
            });
        }

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

        // Ensure visibility matches deck state on first render
        this.updateDeckVisibility();
    }

    // Hover preview intentionally disabled for DeckScene per UX request

    setInteractive(enabled) {
        this.isInteractive = enabled;
        // Guard against calls before createScene finished (e.g., right after a reset)
        if (!this.deckDisplay) return;
        this.deckDisplay.setAlpha(enabled ? 1 : 0.7);
        // Update visibility and input based on whether there are cards to draw
        this.updateDeckVisibility();
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
                // Emit tutorial event for card draw
                try { EventBus.emit('card:drawn', { card: result.card }); } catch (_) {}
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

        // After attempting a draw, refresh visibility in case deck became empty
        this.updateDeckVisibility();
    }

    getDeckBounds() {
        // Return world-space bounds for highlighting
        if (!this.deckDisplay || !this.config || !this.config.bounds) return { x: 0, y: 0, width: 0, height: 0 };
        const { bounds } = this.config;
        const w = this.deckDisplay.width * this.deckDisplay.scaleX;
        const h = this.deckDisplay.height * this.deckDisplay.scaleY;
        const x = bounds.x + (this.deckDisplay.x - (w / 2));
        const y = bounds.y + (this.deckDisplay.y - (h / 2));
        return { x, y, width: w, height: h };
    }

    // Hide the deck backing when there are no more cards to draw
    updateDeckVisibility() {
        if (!this.deckDisplay) return;
        const isEmpty = !!(this.cardInteractionSystem && this.cardInteractionSystem.playerDeck && this.cardInteractionSystem.playerDeck.isDrawPileEmpty && this.cardInteractionSystem.playerDeck.isDrawPileEmpty());
        this.deckDisplay.setVisible(!isEmpty);
        if (this.deckDisplay.input && this.deckDisplay.input.enabled !== undefined) {
            this.deckDisplay.input.enabled = this.isInteractive && !isEmpty;
        }
    }
}