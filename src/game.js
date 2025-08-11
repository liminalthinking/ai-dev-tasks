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

        // Initialize managers and systems
        this.sceneManager = new SceneManager(this);
        
        // Initialize game components
        this.playerDeck = new PlayerDeck();
        this.marketCards = new MarketCards();
        this.cardInteractionSystem = new CardInteractionSystem(this.playerDeck, this.marketCards);
        
        // Initialize phase manager
        this.phaseManager = new GamePhaseManager(this.cardInteractionSystem, this.sceneManager);

        // Start scenes in order
        this.sceneManager.startScene('BackgroundScene', new BackgroundScene());
        this.sceneManager.startScene('HUDScene', new HUDScene(this.phaseManager));
        this.sceneManager.startScene('MessagesScene', new MessagesScene(this.phaseManager));
        this.sceneManager.startScene('DeckScene', new DeckScene(this.cardInteractionSystem, this.phaseManager));
        this.sceneManager.startScene('PlayedCardsScene', new PlayedCardsScene(this.cardInteractionSystem, this.phaseManager));
        this.sceneManager.startScene('MarketScene', new MarketScene(this.cardInteractionSystem, this.phaseManager));
        this.sceneManager.startScene('DiscardPileScene', new DiscardPileScene());
        this.sceneManager.startScene('OverlayScene', new OverlayScene());

        // Scenes will handle enabling interactivity on their own create hooks
    }
}

window.onload = () => {
    new Game();
};