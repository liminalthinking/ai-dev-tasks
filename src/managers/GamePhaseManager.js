export const GamePhases = {
    PLAY_CARDS: 'playCards',
    BUILD: 'build',
    EVOLVE: 'evolve',
    END_TURN: 'endTurn',
    GAME_OVER: 'gameOver'
};

export const PhaseMessages = {
    [GamePhases.PLAY_CARDS]: "This is the PLAY CARDS phase! \n\nClick the top of deck to play the next card and gain RESOURCE. Remember to watch your PRESSURE\n\nYou can click the End Phase button at anytime to move to the BUILD phase.",
    [GamePhases.BUILD]: "This is the BUILD phase! \n\nBuild new buildings from the MARKET with available resources. \n\nYou can click the End Phase button at any time to move to the EVOLVE phase.",
    [GamePhases.EVOLVE]: "This is the EVOLVE phase! \n\nEvolve cards from the Played Cards area, \n\nClick the End Phase button to end this turn.",
    [GamePhases.END_TURN]: "Processing end of turn...",
    [GamePhases.PRESSURE]: "The mounting pressure is too much for your growing city nation and it has been thrown into turmoil.\n\nRefresh your browser to try again",
    [GamePhases.GAME_OVER]: "Congratulations! \n\nYour nation survived 12 turns and achieved {points} Building Points!\n\nSee if you can do even better next game! Refresh your browser to play again"
};

export class GamePhaseManager {
    constructor(cardInteractionSystem, sceneManager) {
        this.cardInteractionSystem = cardInteractionSystem;
        this.sceneManager = sceneManager;
        this.currentPhase = GamePhases.PLAY_CARDS;
        this.currentTurn = 1;
        this.maxTurns = 12;
        this.buildingPoints = 0;
        this.isProcessingEndTurn = false;
        
        // Turn tracking - just records what happened each turn
        this.turnHistory = [];
        this.turnState = {
            cardsPlayed: 0,
            resourcesGained: 0,
            resourcesSpent: 0,
            pressureGained: 0,
            cardsPurchased: 0,
            cardsEvolved: 0,
            startTime: Date.now()
        };
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    getBuildingPoints() {
        return this.buildingPoints;
    }

    getCurrentPhaseMessage() {
        if (this.currentPhase === GamePhases.GAME_OVER) {
            return PhaseMessages[GamePhases.GAME_OVER].replace('{points}', this.buildingPoints);
        }
        return PhaseMessages[this.currentPhase];
    }

    // Handle card drawing during Play Cards phase
    async handleCardDraw() {
        if (this.currentPhase !== GamePhases.PLAY_CARDS) {
            return {
                success: false,
                message: 'Can only draw cards during Play Cards phase'
            };
        }

        const result = await this.cardInteractionSystem.drawCard();
        
        if (result) {
            // Update turn state
            this.updateTurnState('cardPlayed');
            if (result.resourceChange > 0) {
                this.updateTurnState('resourceGained', result.resourceChange);
            }
            if (result.pressureChange > 0) {
                this.updateTurnState('pressureGained', result.pressureChange);
            }

            // Check for game over conditions BEFORE updating scenes so UI reflects bust immediately
            const gameOverCheck = this.checkGameOver();
            if (gameOverCheck.isGameOver) {
                // Update scenes to show GAME_OVER state and hide End Phase button
                this.updateScenes();
                return {
                    success: true,
                    gameOver: true,
                    message: gameOverCheck.message,
                    turnState: this.getTurnState(),
                    finalState: gameOverCheck.finalState,
                    isWin: gameOverCheck.isWin
                };
            }

            // Not game over: update scenes with new state
            this.updateScenes();

            return {
                success: true,
                ...result,
                turnState: this.getTurnState()
            };
        }

        return {
            success: false,
            message: 'No more cards in deck. Click End Phase to continue.',
            turnState: this.getTurnState()
        };
    }

    // Handle market card purchase during Build phase
    handleCardPurchase(cardName) {
        if (this.currentPhase !== GamePhases.BUILD) {
            return {
                success: false,
                message: 'Can only purchase cards during Build phase'
            };
        }

        const result = this.cardInteractionSystem.buildCard(cardName);
        
        if (result.success) {
            // Update turn state
            this.updateTurnState('cardPurchased');
            this.updateTurnState('resourceSpent', result.card.cost);

            // Update all scenes with new state
            this.updateScenes();

            // Get the discard pile scene to add the purchased card
            const discardPileScene = this.sceneManager.getScene('DiscardPileScene');
            if (discardPileScene) {
                discardPileScene.addCard(result.card);
            }

            // Get the market scene to refresh the display
            const marketScene = this.sceneManager.getScene('MarketScene');
            if (marketScene) {
                marketScene.refreshMarket();
            }

            return {
                success: true,
                ...result,
                turnState: this.getTurnState()
            };
        }

        return {
            success: false,
            message: result.message || 'Failed to purchase card',
            turnState: this.getTurnState()
        };
    }

    // Called when End Phase button is clicked
    advancePhase() {
        switch (this.currentPhase) {
            case GamePhases.PLAY_CARDS:
                this.currentPhase = GamePhases.BUILD;
                break;

            case GamePhases.BUILD:
                this.currentPhase = GamePhases.EVOLVE;
                break;

            case GamePhases.EVOLVE:
                this.currentPhase = GamePhases.END_TURN;
                this.processEndTurn();
                break;

            case GamePhases.END_TURN:
                if (this.currentTurn >= this.maxTurns) {
                    this.currentPhase = GamePhases.GAME_OVER;
                } else {
                    this.startNewTurn();
                }
                break;
        }

        // Update all scenes with new phase
        this.updateScenes();
        
        return {
            success: true,
            message: this.getCurrentPhaseMessage(),
            phase: this.currentPhase,
            turnState: this.getTurnState()
        };
    }

    startNewTurn() {
        // Save previous turn state to history
        if (this.currentTurn > 0) {
            const turnDuration = Date.now() - this.turnState.startTime;
            this.turnHistory.push({
                ...this.turnState,
                turnNumber: this.currentTurn,
                duration: turnDuration,
                endState: this.cardInteractionSystem.getGameState()
            });
        }

        // Increment turn and reset phase
        this.currentTurn++;
        this.currentPhase = GamePhases.PLAY_CARDS;

        // Reset turn state
        this.turnState = {
            cardsPlayed: 0,
            resourcesGained: 0,
            resourcesSpent: 0,
            pressureGained: 0,
            cardsPurchased: 0,
            cardsEvolved: 0,
            startTime: Date.now()
        };
    }

    // Get turn history
    getTurnHistory() {
        return [...this.turnHistory];
    }

    // Get current turn state
    getTurnState() {
        return {
            ...this.turnState,
            duration: Date.now() - this.turnState.startTime
        };
    }

    // Update turn state based on action
    updateTurnState(action, amount = 1) {
        switch (action) {
            case 'cardPlayed':
                this.turnState.cardsPlayed += amount;
                break;
            case 'resourceGained':
                this.turnState.resourcesGained += amount;
                break;
            case 'resourceSpent':
                this.turnState.resourcesSpent += amount;
                break;
            case 'pressureGained':
                this.turnState.pressureGained += amount;
                break;
            case 'cardPurchased':
                this.turnState.cardsPurchased += amount;
                break;
            case 'cardEvolved':
                this.turnState.cardsEvolved += amount;
                break;
        }
    }

    async processEndTurn() {
        if (this.isProcessingEndTurn) return;
        this.isProcessingEndTurn = true;

        try {
            // Get scenes for updates
            const discardPileScene = this.sceneManager.getScene('DiscardPileScene');
            const playedCardsScene = this.sceneManager.getScene('PlayedCardsScene');
            
        // Process end of turn actions
            const endTurnResult = await this.cardInteractionSystem.endTurn(this.currentTurn);
            
            // Show turn summary if available
            if (endTurnResult.turnSummary && discardPileScene) {
                discardPileScene.showEndTurnSummary(endTurnResult.turnSummary);
            }
        
        // Calculate total building points
        this.buildingPoints = this.cardInteractionSystem.playerDeck.calculateTotalPoints();
        
        // Check for game over conditions
        const gameOverCheck = this.checkGameOver();
        if (gameOverCheck.isGameOver) {
            // Game is over - stay in GAME_OVER phase
            this.currentPhase = GamePhases.GAME_OVER;
            
            // Update messages with final state
            const messagesScene = this.sceneManager.getScene('MessagesScene');
            if (messagesScene) {
                messagesScene.updatePhaseMessage(gameOverCheck.message);
                messagesScene.showGameOverScreen(gameOverCheck.isWin, gameOverCheck.finalState);
            }
        } else {
            // Continue to next turn
            this.startNewTurn();
        }

            // Update scenes with new state
            this.updateScenes();
            // Clear discard top if pile is empty after reshuffle
            const discardScene = this.sceneManager.getScene('DiscardPileScene');
            if (discardScene && endTurnResult.deckCounts.discardPile === 0) {
                discardScene.clearDiscardPile();
            }
            if (playedCardsScene) {
                // Clear played cards area at end of turn
                playedCardsScene.clearSelection();
                // Destroy all sprites in container
                if (playedCardsScene.cardContainer) {
                    playedCardsScene.cardContainer.removeAll(true);
                }
                playedCardsScene.playedCards = [];
            }
        } finally {
            this.isProcessingEndTurn = false;
        }
    }

    updateScenes() {
        // Get the current game state
        const gameState = this.cardInteractionSystem.getGameState();
        
        // Update HUD: guard for missing scene or not yet initialized elements
        const hudScene = this.sceneManager.getScene('HUDScene');
        if (hudScene && typeof hudScene.updateDisplay === 'function' && hudScene.scene && hudScene.scene.isActive()) {
            // Calculate resource change for display
            const resourceChange = gameState.resourceChange || 
                (this.currentPhase === GamePhases.BUILD && gameState.lastPurchaseCost ? -gameState.lastPurchaseCost : 0);

            hudScene.updateDisplay(
                gameState.resource,
                gameState.pressure,
                this.buildingPoints,
                this.currentTurn,
                resourceChange,
                gameState.pressureChange
            );
        }

        // Update Messages
        const messagesScene = this.sceneManager.getScene('MessagesScene');
        if (messagesScene && typeof messagesScene.updatePhaseMessage === 'function') {
            messagesScene.updatePhaseMessage(this.getCurrentPhaseMessage());
            messagesScene.updateButtons(this.currentPhase, gameState.resource);
        }

        // Update scene interactivity based on phase
        // Defer one tick to avoid calling setInteractive before scenes' create hooks finish
        const timer = this.sceneManager.getScene('BackgroundScene');
        if (timer && timer.time && typeof timer.time.addEvent === 'function') {
            timer.time.addEvent({ delay: 0, callback: () => this.updateSceneInteractivity() });
        } else {
            this.updateSceneInteractivity();
        }
    }

    updateSceneInteractivity() {
        const deckScene = this.sceneManager.getScene('DeckScene');
        const marketScene = this.sceneManager.getScene('MarketScene');
        const playedCardsScene = this.sceneManager.getScene('PlayedCardsScene');

        // Enable/disable scene interactions based on current phase
        if (deckScene && typeof deckScene.setInteractive === 'function') {
            deckScene.setInteractive(this.currentPhase === GamePhases.PLAY_CARDS);
        }

        if (marketScene && typeof marketScene.setInteractive === 'function') {
            marketScene.setInteractive(this.currentPhase === GamePhases.BUILD);
        }

        if (playedCardsScene && typeof playedCardsScene.setInteractive === 'function') {
            playedCardsScene.setInteractive(this.currentPhase === GamePhases.EVOLVE);
        }
    }

    checkGameOver() {
        const gameState = this.cardInteractionSystem.getGameState();
        
        // Check win condition (completed 12 turns)
        if (this.currentTurn >= this.maxTurns && this.currentPhase === GamePhases.END_TURN) {
            this.currentPhase = GamePhases.GAME_OVER;
            return {
                isGameOver: true,
                isWin: true,
                message: `Congratulations! Your nation survived ${this.maxTurns} turns and achieved ${this.buildingPoints} Building Points!`,
                finalState: {
                    ...gameState,
                    buildingPoints: this.buildingPoints,
                    turnHistory: this.getTurnHistory()
                }
            };
        }
        
        // Check bust condition (pressure >= 5)
        if (gameState.pressure >= 5) {
            this.currentPhase = GamePhases.GAME_OVER;
            return {
                isGameOver: true,
                isWin: false,
                message: 'Game Over! Your nation collapsed under too much pressure!',
                finalState: {
                    ...gameState,
                    buildingPoints: this.buildingPoints,
                    turnHistory: this.getTurnHistory()
                }
            };
        }

        return {
            isGameOver: false
        };
    }

    /*
    resetGame() {
        this.currentPhase = GamePhases.PLAY_CARDS;
        this.currentTurn = 1;
        this.buildingPoints = 0;
        this.isProcessingEndTurn = false;
        // Recreate core systems for a fresh state
        this.cardInteractionSystem.resetState();
        // Reset decks and market
        if (this.cardInteractionSystem.playerDeck) {
            this.cardInteractionSystem.playerDeck = new (require('../data/PlayerDeck').PlayerDeck)();
        }
        if (this.cardInteractionSystem.marketCards) {
            this.cardInteractionSystem.marketCards = new (require('../data/MarketCards').MarketCards)();
        }

        // Reset card systems and scenes through scene manager
        this.sceneManager.resetAllScenes();
        // After BackgroundScene restarts and finishes create, refresh HUD/messages
        const scheduleRefresh = () => {
            const messagesScene = this.sceneManager.getScene('MessagesScene');
            if (messagesScene && typeof messagesScene.updatePhaseMessage === 'function') {
                messagesScene.updatePhaseMessage(this.getCurrentPhaseMessage());
                messagesScene.updateButtons(this.currentPhase, 0);
            }
            this.updateSceneInteractivity();
        };
        const bg = this.sceneManager.getScene('BackgroundScene');
        let scheduled = false;
        const maybeSchedule = () => { if (!scheduled) { scheduled = true; scheduleRefresh(); } };
        if (bg) {
            if (bg.events && typeof bg.events.once === 'function') {
                bg.events.once(Phaser.Scenes.Events.CREATE, maybeSchedule);
            }
            if (bg.load && typeof bg.load.once === 'function') {
                bg.load.once('complete', maybeSchedule);
            }
        }
        setTimeout(maybeSchedule, 0);
    }
    */
}