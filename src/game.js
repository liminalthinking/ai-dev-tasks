import 'phaser';
import { SceneManager } from './managers/SceneManager';
import { GamePhaseManager } from './managers/GamePhaseManager';
import { CardInteractionSystem } from './systems/CardInteractionSystem';
import { PlayerDeck } from './data/PlayerDeck';
import { MarketCards } from './data/MarketCards';

// Import all scenes
import { BackgroundScene } from './scenes/BackgroundScene';
import { HUDScene } from './scenes/HUDScene';
import { MessagesScene } from './scenes/MessagesScene';
import { DeckScene } from './scenes/DeckScene';
import { PlayedCardsScene } from './scenes/PlayedCardsScene';
import { MarketScene } from './scenes/MarketScene';
import { DiscardPileScene } from './scenes/DiscardPileScene';
import { OverlayScene } from './scenes/OverlayScene';
import { IntroScene } from './scenes/IntroScene';
import { GameRulesScene } from './scenes/GameRulesScene';

import { GAME_WIDTH, GAME_HEIGHT } from './config/SceneConfig';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#2d2d2d',
    parent: 'game',
    scene: [],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    audio: {
        disableWebAudio: true
    }
};

class Game extends Phaser.Game {
    constructor() {
        super(config);

        // Core manager for registering/starting scenes
        this.sceneManager = new SceneManager(this);

        // Lazily initialize core game systems when Start Game is clicked
        this.playerDeck = null;
        this.marketCards = null;
        this.cardInteractionSystem = null;
        this.phaseManager = null;

        // Track whether core scenes have started to avoid double-start
        this.coreScenesStarted = false;

        // Add and start intro/rules scenes
        this.scene.add('IntroScene', new IntroScene(this));
        this.scene.add('GameRulesScene', new GameRulesScene(this));
        this.scene.start('IntroScene');

        // Scenes will handle enabling interactivity on their own create hooks
    }

    // Called by IntroScene when the user clicks Start Game
    startCoreScenes() {
        // Always hide/remove intro/rules first to prevent any restarts/flicker
        try { this.scene.stop('IntroScene'); } catch (_) {}
        try { this.scene.stop('GameRulesScene'); } catch (_) {}
        try { this.scene.remove('IntroScene'); } catch (_) {}
        try { this.scene.remove('GameRulesScene'); } catch (_) {}

        if (this.coreScenesStarted) {
            return; // Core already running
        }
        this.coreScenesStarted = true;

        if (!this.playerDeck) {
            this.playerDeck = new PlayerDeck();
        }
        if (!this.marketCards) {
            this.marketCards = new MarketCards();
        }
        if (!this.cardInteractionSystem) {
            this.cardInteractionSystem = new CardInteractionSystem(this.playerDeck, this.marketCards);
        }
        if (!this.phaseManager) {
            this.phaseManager = new GamePhaseManager(this.cardInteractionSystem, this.sceneManager);
        }

        // Start the full game stack (Background first, then others)
        this.sceneManager.startScenesOrdered([
            ['BackgroundScene', new BackgroundScene()],
            ['HUDScene', new HUDScene(this.phaseManager)],
            ['MessagesScene', new MessagesScene(this.phaseManager)],
            ['DeckScene', new DeckScene(this.cardInteractionSystem, this.phaseManager)],
            ['PlayedCardsScene', new PlayedCardsScene(this.cardInteractionSystem, this.phaseManager)],
            ['MarketScene', new MarketScene(this.cardInteractionSystem, this.phaseManager)],
            ['DiscardPileScene', new DiscardPileScene()],
            ['OverlayScene', new OverlayScene()]
        ]);

        // Ensure intro/rules remain removed
        try { this.scene.remove('IntroScene'); } catch (_) {}
        try { this.scene.remove('GameRulesScene'); } catch (_) {}
    }
}

window.onload = () => {
    new Game();
};