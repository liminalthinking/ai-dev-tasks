// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Common styling
export const SCENE_STYLES = {
    labelText: {
        fontSize: '14px',
        fill: '#ffffff',
        fontFamily: 'Alegreya, serif',
        backgroundColor: '#333333',
        padding: { x: 8, y: 4 }
    },
    gameText: {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Alegreya, serif'
    },
    debugBounds: false,  // Hide scene boundaries in production
    // Always-on scene panel outline (not a debug feature)
    panelFrame: {
        border: 0x444444,
        thickness: 2,
        background: 0x000000,
        backgroundOpacity: 0.06
    },
    debugColors: {
        background: 0x222222,
        border: 0x444444,
        opacity: 0.2
    }
};

// Scene-specific configurations
export const SCENE_CONFIG = {
    BackgroundScene: {
        key: 'BackgroundScene',
        zIndex: 0,
        bounds: {
            x: 0,
            y: 0,
            width: GAME_WIDTH,
            height: GAME_HEIGHT
        },
        label: null  // Background doesn't need a label
    },
    HUDScene: {
        key: 'HUDScene',
        zIndex: 10,
        bounds: {
            x: 10,
            y: 10,
            width: GAME_WIDTH - 20,
            height: 80
        },
        label: null
    },
    MarketScene: {
        key: 'MarketScene',
        zIndex: 5,
        bounds: {
            x: 10,
            y: 100,
            // Width reduced to expand Messages; keep 10px gap between scenes
            width: GAME_WIDTH - 410,
            // Middle row height equal to bottom row height (split remaining space evenly)
            height: 300
        },
        label: 'Market'
    },
    PlayedCardsScene: {
        key: 'PlayedCardsScene',
        zIndex: 5,
        bounds: {
            x: 260,
            y: 410,
            width: GAME_WIDTH - 520,
            height: 300
        },
        label: 'Played Cards'
    },
    DeckScene: {
        key: 'DeckScene',
        zIndex: 5,
        bounds: {
            x: 10,
            y: 410,
            width: 240,
            height: 300
        },
        label: 'Deck'
    },
    DiscardPileScene: {
        key: 'DiscardPileScene',
        zIndex: 5,
        bounds: {
            x: GAME_WIDTH - 250,
            y: 410,
            width: 240,
            height: 300
        },
        label: 'Discard'
    },
    MessagesScene: {
        key: 'MessagesScene',
        zIndex: 10,
        bounds: {
            // Expanded by 100% (from 190 to 380) and aligned to right with 10px margin
            x: GAME_WIDTH - 390,
            y: 100,
            width: 380,
            height: 300
        },
        label: 'Messages'
    }
};
