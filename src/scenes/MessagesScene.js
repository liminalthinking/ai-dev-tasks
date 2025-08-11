import { GamePhases } from '../managers/GamePhaseManager';

import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';

export class MessagesScene extends BaseScene {
    constructor(phaseManager) {
        super('MessagesScene');
        this.phaseManager = phaseManager;
    }

    createScene() {
        const rightPadding = 20;
        const topPadding = 20;

        // Create message text in top-right corner
        this.messageText = this.add.text(
            rightPadding, 
            topPadding, 
            '', 
            {
                fontSize: '16px',
                fill: '#ffffff',
                wordWrap: { width: 300 },
                align: 'right'
            }
        );

        // Create End Phase button below the message
        this.endPhaseButton = this.add.text(
            this.cameras.main.width - 120 - rightPadding,
            this.messageText.y + this.messageText.height + 10,
            'End Phase', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerover', () => {
            this.endPhaseButton.setBackgroundColor('#666666');
        })
        .on('pointerout', () => {
            this.endPhaseButton.setBackgroundColor('#444444');
        })
        .on('pointerdown', () => {
            this.handleEndPhaseClick();
        });

        // Create Evolve button (initially hidden)
        this.evolveButton = this.add.text(
            this.cameras.main.width - 120 - rightPadding,
            this.endPhaseButton.y + this.endPhaseButton.height + 10,
            'Evolve!', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerover', () => {
            if (this.evolveButton.active) {
                this.evolveButton.setBackgroundColor('#666666');
            }
        })
        .on('pointerout', () => {
            if (this.evolveButton.active) {
                this.evolveButton.setBackgroundColor('#444444');
            }
        })
        .on('pointerdown', () => {
            if (this.evolveButton.active) {
                this.handleEvolveClick();
            }
        });
        this.evolveButton.visible = false;
        this.evolveButton.active = false;

        // Create Play Again button (initially hidden)
        this.playAgainButton = this.add.text(
            this.cameras.main.width - 120 - rightPadding,
            this.endPhaseButton.y,  // Same Y as End Phase button since they're mutually exclusive
            'Play Again', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerover', () => {
            this.playAgainButton.setBackgroundColor('#666666');
        })
        .on('pointerout', () => {
            this.playAgainButton.setBackgroundColor('#444444');
        })
        .on('pointerdown', () => {
            this.handlePlayAgainClick();
        });
        this.playAgainButton.visible = false;

        // Set initial message
        this.updatePhaseMessage(this.phaseManager.getCurrentPhaseMessage());
    }

    updatePhaseMessage(message) {
        this.messageText.setText(message);
    }

    updateButtons(currentPhase, currentResource) {
        // Handle End Phase button visibility
        this.endPhaseButton.visible = currentPhase !== GamePhases.GAME_OVER;

        // Handle Play Again button visibility
        this.playAgainButton.visible = currentPhase === GamePhases.GAME_OVER;

        // Handle Evolve button visibility and state
        this.evolveButton.visible = currentPhase === GamePhases.EVOLVE;
        
        // Update Evolve button state based on selected card and resources
        const cardInteractionSystem = this.phaseManager.cardInteractionSystem;
        if (currentPhase === GamePhases.EVOLVE && cardInteractionSystem.selectedCard) {
            this.evolveButton.active = cardInteractionSystem.canEvolveSelectedCard();
            this.evolveButton.setBackgroundColor(this.evolveButton.active ? '#444444' : '#222222');
            this.evolveButton.setFill(this.evolveButton.active ? '#ffffff' : '#666666');
        } else {
            this.evolveButton.active = false;
        }
    }

    handleEndPhaseClick() {
        const message = this.phaseManager.advancePhase();
        this.updatePhaseMessage(message);
    }

    handleEvolveClick() {
        const cardInteractionSystem = this.phaseManager.cardInteractionSystem;
        const result = cardInteractionSystem.evolveSelectedCard();
        
        if (result.success) {
            // Update HUD with remaining resources
            const hudScene = this.scene.get('HUDScene');
            if (hudScene) {
                hudScene.updateResource(result.remainingResource);
            }

            // Update PlayedCards and DiscardPile scenes
            const playedCardsScene = this.scene.get('PlayedCardsScene');
            const discardPileScene = this.scene.get('DiscardPileScene');
            
            if (playedCardsScene) {
                playedCardsScene.removeCard(cardInteractionSystem.selectedCard);
            }
            if (discardPileScene) {
                discardPileScene.addCard(result.evolvedCard);
            }
        }

        // Update button states
        this.updateButtons(this.phaseManager.getCurrentPhase(), result.remainingResource);
    }

    handlePlayAgainClick() {
        this.phaseManager.resetGame();
        
        // Update UI
        this.updatePhaseMessage(this.phaseManager.getCurrentPhaseMessage());
        this.updateButtons(this.phaseManager.getCurrentPhase(), 0);
    }
}