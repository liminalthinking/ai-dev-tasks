// Game dimensions
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

// Common styling
export const SCENE_STYLES = {
    labelText: {
        fontSize: '14px',
        fill: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 8, y: 4 }
    },
    gameText: {
        fontSize: '16px',
        fill: '#ffffff'
    },
    debugBounds: true,  // Set to true to show scene boundaries during development
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
            height: 40
        },
        label: 'HUD'
    },
    MarketScene: {
        key: 'MarketScene',
        zIndex: 5,
        bounds: {
            x: 10,
            y: 60,
            width: GAME_WIDTH - 220,
            height: 180
        },
        label: 'Market'
    },
    PlayedCardsScene: {
        key: 'PlayedCardsScene',
        zIndex: 5,
        bounds: {
            x: 180,
            y: 250,
            width: GAME_WIDTH - 360,
            height: GAME_HEIGHT - 260
        },
        label: 'Played Cards'
    },
    DeckScene: {
        key: 'DeckScene',
        zIndex: 5,
        bounds: {
            x: 10,
            y: 250,
            width: 160,
            height: GAME_HEIGHT - 260
        },
        label: 'Deck'
    },
    DiscardPileScene: {
        key: 'DiscardPileScene',
        zIndex: 5,
        bounds: {
            x: GAME_WIDTH - 170,
            y: 250,
            width: 160,
            height: GAME_HEIGHT - 260
        },
        label: 'Discard'
    },
    MessagesScene: {
        key: 'MessagesScene',
        zIndex: 10,
        bounds: {
            x: GAME_WIDTH - 200,
            y: 60,
            width: 190,
            height: 180
        },
        label: 'Messages'
    }
};
