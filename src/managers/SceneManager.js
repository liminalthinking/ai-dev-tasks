export class SceneManager {
    constructor(game) {
        this.game = game;
        this.scenes = {};
    }

    startScene(key, scene) {
        if (!this.scenes[key]) {
            this.game.scene.add(key, scene);
            this.scenes[key] = scene;
        }
        this.game.scene.start(key);
    }

    stopScene(key) {
        if (this.scenes[key]) {
            this.game.scene.stop(key);
        }
    }

    getScene(key) {
        return this.scenes[key];
    }

    getScenes() {
        return this.scenes;
    }

    resetAllScenes() {
        // Stop all scenes
        Object.keys(this.scenes).forEach(key => {
            this.game.scene.stop(key);
        });

        // Restart scenes in correct order
        this.startScene('BackgroundScene', this.scenes['BackgroundScene']);
        this.startScene('HUDScene', this.scenes['HUDScene']);
        this.startScene('MessagesScene', this.scenes['MessagesScene']);
        this.startScene('DeckScene', this.scenes['DeckScene']);
        this.startScene('PlayedCardsScene', this.scenes['PlayedCardsScene']);
        this.startScene('MarketScene', this.scenes['MarketScene']);
        this.startScene('DiscardPileScene', this.scenes['DiscardPileScene']);
        this.startScene('OverlayScene', this.scenes['OverlayScene']);
    }
}