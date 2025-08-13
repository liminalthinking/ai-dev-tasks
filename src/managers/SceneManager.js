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

    // Start scenes in a defined order, waiting for the first scene (typically
    // BackgroundScene) to finish loading before starting the rest. This avoids
    // texture races where dependent scenes create images before textures load.
    startScenesOrdered(orderedEntries) {
        if (!orderedEntries || orderedEntries.length === 0) return;

        // Add all scenes to the game, but only start the first immediately
        orderedEntries.forEach(([key, scene]) => {
            if (!this.scenes[key]) {
                this.game.scene.add(key, scene);
                this.scenes[key] = scene;
            }
        });

        const [firstKey] = orderedEntries[0];
        this.game.scene.start(firstKey);

        const startRest = () => {
            for (let i = 1; i < orderedEntries.length; i++) {
                const [key] = orderedEntries[i];
                this.game.scene.start(key);
            }
        };

        const firstScene = this.scenes[firstKey];
        // Wait for the first scene's CREATE event, which fires after preload
        // and loader completion, then start the rest. This avoids missing the
        // loader 'complete' event when it fires before we attach listeners.
        if (firstScene && firstScene.events && typeof firstScene.events.once === 'function') {
            firstScene.events.once(Phaser.Scenes.Events.CREATE, startRest);
        } else if (firstScene && firstScene.load && typeof firstScene.load.once === 'function') {
            // Fallback: use loader complete if events are unavailable
            firstScene.load.once('complete', startRest);
        } else {
            setTimeout(startRest, 0);
        }
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

        // Restart scenes in correct order, waiting for BackgroundScene load
        const orderedEntries = [
            ['BackgroundScene', this.scenes['BackgroundScene']],
            ['HUDScene', this.scenes['HUDScene']],
            ['MessagesScene', this.scenes['MessagesScene']],
            ['DeckScene', this.scenes['DeckScene']],
            ['PlayedCardsScene', this.scenes['PlayedCardsScene']],
            ['MarketScene', this.scenes['MarketScene']],
            ['DiscardPileScene', this.scenes['DiscardPileScene']],
            ['OverlayScene', this.scenes['OverlayScene']]
        ];
        this.startScenesOrdered(orderedEntries);
    }
}