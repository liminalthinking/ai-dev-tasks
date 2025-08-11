import { GamePhases } from '../managers/GamePhaseManager';

import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';

export class MessagesScene extends BaseScene {
    constructor(phaseManager) {
        super('MessagesScene');
        this.phaseManager = phaseManager;
    }

    createScene() {
        const padding = 20;
        const labelOffset = 24; // push content below the scene label

        // Create message text in top-right corner
        this.messageText = this.add.text(
            padding, 
            padding + labelOffset, 
            '', 
            {
                fontSize: '16px',
                fill: '#ffffff',
                wordWrap: { width: this.cameras.main.width - (padding * 2) },
                align: 'left'
            }
        );

        // Create End Phase button below the message
        this.endPhaseButton = this.add.text(
            this.cameras.main.width - 120 - padding,
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
            this.cameras.main.width - 120 - padding,
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

        // Create Build button (visible during Build phase)
        this.buildButton = this.add.text(
            this.cameras.main.width - 120 - padding,
            this.evolveButton.y + this.evolveButton.height + 10,
            'Build', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setInteractive()
        .on('pointerover', () => {
            if (this.buildButton.active) {
                this.buildButton.setBackgroundColor('#666666');
            }
        })
        .on('pointerout', () => {
            if (this.buildButton.active) {
                this.buildButton.setBackgroundColor('#444444');
            }
        })
        .on('pointerdown', () => {
            if (this.buildButton.active) {
                this.handleBuildClick();
            }
        });
        this.buildButton.visible = false;
        this.buildButton.active = false;

        // Create Play Again button (initially hidden)
        this.playAgainButton = this.add.text(
            this.cameras.main.width - 120 - padding,
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

        // Handle Build button visibility/state
        this.buildButton.visible = currentPhase === GamePhases.BUILD;
        let canBuild = false;
        if (currentPhase === GamePhases.BUILD) {
            const marketScene = this.scene.get('MarketScene');
            const selectedKey = marketScene && marketScene.getSelectedCardKey ? marketScene.getSelectedCardKey() : null;
            if (selectedKey) {
                // Check affordability via interaction system (use hyphen-case key)
                canBuild = this.phaseManager.cardInteractionSystem.canBuildCard(selectedKey);
            }
        }
        this.buildButton.active = this.buildButton.visible && canBuild;
        this.buildButton.setBackgroundColor(this.buildButton.active ? '#444444' : '#222222');
        this.buildButton.setFill(this.buildButton.active ? '#ffffff' : '#666666');
    }

    handleEndPhaseClick() {
        const result = this.phaseManager.advancePhase();
        this.updatePhaseMessage(result.message);
        const resource = this.phaseManager.cardInteractionSystem.getCurrentResource();
        this.updateButtons(this.phaseManager.getCurrentPhase(), resource);
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

    handleBuildClick() {
        const marketScene = this.scene.get('MarketScene');
        if (!marketScene || !marketScene.getSelectedCardKey) return;
        const key = marketScene.getSelectedCardKey();
        if (!key) return;
        const result = this.phaseManager.handleCardPurchase(key);
        if (!result.success && result.message) {
            this.updatePhaseMessage(result.message);
        }
        // Refresh buttons and clear selection on success
        if (result.success) {
            marketScene.clearSelection();
        }
        const resource = this.phaseManager.cardInteractionSystem.getCurrentResource();
        this.updateButtons(this.phaseManager.getCurrentPhase(), resource);
    }

    handlePlayAgainClick() {
        this.phaseManager.resetGame();
        
        // Update UI
        this.updatePhaseMessage(this.phaseManager.getCurrentPhaseMessage());
        this.updateButtons(this.phaseManager.getCurrentPhase(), 0);
    }
}