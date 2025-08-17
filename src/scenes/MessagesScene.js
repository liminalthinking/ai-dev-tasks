import { GamePhases } from '../managers/GamePhaseManager';

import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';
import { EventBus } from '../managers/EventBus';

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
                fontFamily: 'Alegreya, serif',
                wordWrap: { width: this.cameras.main.width - (padding * 2) },
                align: 'left'
            }
        );

        // Create End Phase button; position finalized after all buttons are created
        this.endPhaseButton = this.add.text(0, 0, 'End Phase', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
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
            0,
            0,
            'Evolve!', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
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
            0,
            0,
            'Build', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
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

        // Create Play Again button (visible at GAME_OVER)
        this.playAgainButton = this.add.text(
            this.cameras.main.width - 120 - padding,
            this.endPhaseButton.y,
            'Play Again', {
            fontSize: '16px',
            fill: '#ffffff',
            fontFamily: 'Alegreya, serif',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => this.playAgainButton.setBackgroundColor('#666666'))
        .on('pointerout', () => this.playAgainButton.setBackgroundColor('#444444'))
        .on('pointerdown', () => this.handlePlayAgainClick());
        this.playAgainButton.visible = false;

        // Position buttons centered and ~20% from bottom
        this.layoutButtons();

        // Set initial message
        this.updatePhaseMessage(this.phaseManager.getCurrentPhaseMessage());
    }

    layoutButtons() {
        const w = this.cameras.main.width;
        const h = this.cameras.main.height;
        const centerX = w / 2;
        const bottomY = h * 0.8; // 20% from bottom
        const verticalGap = 12;

        // Build/Evolve at same Y, End Phase below them (consistent across phases)
        this.buildButton.x = centerX;
        this.evolveButton.x = centerX;
        this.endPhaseButton.x = centerX;

        const topY = bottomY - (this.endPhaseButton.height + verticalGap);
        this.buildButton.y = topY;
        this.evolveButton.y = topY;
        this.endPhaseButton.y = bottomY;
        if (this.playAgainButton) {
            this.playAgainButton.x = centerX;
            this.playAgainButton.y = bottomY;
        }
    }

    updatePhaseMessage(message) {
        this.messageText.setText(message);
    }

    updateButtons(currentPhase, currentResource) {
        // Handle End Phase button visibility and Play Again when GAME_OVER
        const isGameOver = currentPhase === GamePhases.GAME_OVER;
        this.endPhaseButton.visible = !isGameOver;
        if (this.playAgainButton) {
            this.playAgainButton.visible = isGameOver;
            if (isGameOver) {
                this.playAgainButton.setBackgroundColor('#444444');
                this.playAgainButton.setFill('#ffffff');
                this.playAgainButton.setInteractive();
            } else {
                this.playAgainButton.disableInteractive && this.playAgainButton.disableInteractive();
            }
        }

        // Handle Evolve button visibility and state
        this.evolveButton.visible = currentPhase === GamePhases.EVOLVE;
        
        // Update Evolve button state based on selected card and resources
        const cardInteractionSystem = this.phaseManager.cardInteractionSystem;
        if (currentPhase === GamePhases.EVOLVE) {
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

        // Ensure consistent positions after any visibility changes
        this.layoutButtons();
    }

    handleEndPhaseClick() {
        const result = this.phaseManager.advancePhase();
        this.updatePhaseMessage(result.message);
        const resource = this.phaseManager.cardInteractionSystem.getCurrentResource();
        this.updateButtons(this.phaseManager.getCurrentPhase(), resource);
        try { EventBus.emit(`phase:changed:${this.phaseManager.getCurrentPhase()}`); } catch (_) {}
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

            // Replace the old card in PlayedCards with the evolved version
            const playedCardsScene = this.scene.get('PlayedCardsScene');
            const discardPileScene = this.scene.get('DiscardPileScene');
            if (playedCardsScene) {
                // Remove the pre-evolution card from the played area
                playedCardsScene.removeCard(result.oldCard);
            }
            if (discardPileScene) {
                // Move the evolved card to discard pile (with animation)
                discardPileScene.addCard(result.evolvedCard);
            }
        }

        // Update button states
        this.updateButtons(this.phaseManager.getCurrentPhase(), result.remainingResource);
        try { if (result.success) EventBus.emit('evolve:done', result); } catch (_) {}
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
        try { if (result.success) EventBus.emit('market:built', result); } catch (_) {}
    }

    handlePlayAgainClick() {
        // Return to the Intro menu using the game's centralized method
        if (this.game && typeof this.game.returnToIntro === 'function') {
            this.game.returnToIntro();
            return;
        }
        // Fallback: hard refresh core scenes without tutorial
        if (typeof this.phaseManager?.resetGame === 'function') {
            this.phaseManager.resetGame();
        }
    }

    // Called from phase manager at game over
    showGameOverScreen(isWin, finalState) {
        // Basic message update and ensure Play Again button is visible
        const title = isWin ? 'You Win!' : 'Game Over';
        const points = finalState && typeof finalState.buildingPoints === 'number' ? finalState.buildingPoints : 0;
        this.updatePhaseMessage(`${title}  Building Points: ${points}. Click Play Again to restart.`);
        this.updateButtons(GamePhases.GAME_OVER, 0);
    }

    // Tutorial helpers
    getButtonBounds(key) {
        const map = {
            endPhase: this.endPhaseButton,
            build: this.buildButton,
            evolve: this.evolveButton
        };
        const btn = map[key];
        if (!btn) return { x: 0, y: 0, width: 0, height: 0 };
        const { bounds } = this.config;
        const x = bounds.x + (btn.x - btn.width / 2);
        const y = bounds.y + (btn.y - btn.height / 2);
        return { x, y, width: btn.width, height: btn.height };
    }

    forceEnable(flags) {
        if (!flags) return;
        if (typeof flags.endPhase === 'boolean') {
            this.endPhaseButton.visible = true;
            this.endPhaseButton.active = flags.endPhase;
            this.endPhaseButton.setBackgroundColor(flags.endPhase ? '#444444' : '#222222');
            this.endPhaseButton.setFill(flags.endPhase ? '#ffffff' : '#666666');
        }
        if (typeof flags.build === 'boolean') {
            this.buildButton.visible = true;
            this.buildButton.active = flags.build;
            this.buildButton.setBackgroundColor(flags.build ? '#444444' : '#222222');
            this.buildButton.setFill(flags.build ? '#ffffff' : '#666666');
        }
        if (typeof flags.evolve === 'boolean') {
            this.evolveButton.visible = true;
            this.evolveButton.active = flags.evolve;
            this.evolveButton.setBackgroundColor(flags.evolve ? '#444444' : '#222222');
            this.evolveButton.setFill(flags.evolve ? '#ffffff' : '#666666');
        }
        this.layoutButtons();
    }
}