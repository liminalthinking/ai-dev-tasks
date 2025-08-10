// Card type definitions
export const CardType = {
    STARTING: 'starting',
    MARKET: 'market',
    PRESSURE: 'pressure'
};

// Card data structure for all cards in the game
export const CardData = {
    // Starting Cards
    'kampung': {
        name: 'Kampung',
        type: CardType.STARTING,
        cost: 0,
        evolveCost: 3,
        resource: 1,
        pressure: 0,
        points: 0,
        evolvesTo: 'hdb-block',
        imageAsset: 'kampung'
    },
    'hdb-block': {
        name: 'HDB Block',
        type: CardType.STARTING,
        cost: 0,
        evolveCost: 0, // Cannot evolve further
        resource: 2,
        pressure: 0,
        points: 2,
        evolvesTo: '',
        imageAsset: 'hdb-block'
    },
    'swamp': {
        name: 'Swamp',
        type: CardType.STARTING,
        cost: 0,
        evolveCost: 4,
        resource: 0,
        pressure: 1,
        points: 0,
        evolvesTo: 'kallang-river',
        imageAsset: 'swamp'
    },
    'kallang-river': {
        name: 'Kallang River',
        type: CardType.STARTING,
        cost: 0,
        evolveCost: 0, // Cannot evolve further
        resource: 1,
        pressure: 0,
        points: 3,
        evolvesTo: '',
        imageAsset: 'kallang-river'
    },

    // Market Cards
    'police-station': {
        name: 'Police Station',
        type: CardType.MARKET,
        cost: 2,
        evolveCost: 3,
        resource: 1,
        pressure: 1,
        points: 1,
        evolvesTo: 'city-hall',
        imageAsset: 'police-station'
    },
    'city-hall': {
        name: 'City Hall',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 2,
        pressure: 0,
        points: 3,
        evolvesTo: '',
        imageAsset: 'city-hall'
    },
    'provision-shop': {
        name: 'Provision Shop',
        type: CardType.MARKET,
        cost: 1,
        evolveCost: 4,
        resource: 1,
        pressure: 0,
        points: 1,
        evolvesTo: 'shopping-mall',
        imageAsset: 'provision-shop'
    },
    'shopping-mall': {
        name: 'Shopping Mall',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 3,
        pressure: 1,
        points: 2,
        evolvesTo: '',
        imageAsset: 'shopping-mall'
    },
    'street-food-stall': {
        name: 'Street Food Stall',
        type: CardType.MARKET,
        cost: 1,
        evolveCost: 2,
        resource: 2,
        pressure: 1,
        points: 0,
        evolvesTo: 'hawker-centre',
        imageAsset: 'street-food-stall'
    },
    'hawker-centre': {
        name: 'Hawker Centre',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 3,
        pressure: 1,
        points: 4,
        evolvesTo: '',
        imageAsset: 'hawker-centre'
    },
    'trishaw-hub': {
        name: 'Trishaw Hub',
        type: CardType.MARKET,
        cost: 3,
        evolveCost: 5,
        resource: 0,
        pressure: 1,
        points: 2,
        evolvesTo: 'bus-interchange',
        imageAsset: 'trishaw-hub'
    },
    'bus-interchange': {
        name: 'Bus Interchange',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 1,
        pressure: 0,
        points: 5,
        evolvesTo: '',
        imageAsset: 'bus-interchange'
    },
    'wet-market': {
        name: 'Wet Market',
        type: CardType.MARKET,
        cost: 2,
        evolveCost: 3,
        resource: 1,
        pressure: 1,
        points: 1,
        evolvesTo: 'supermarket',
        imageAsset: 'wet-market'
    },
    'supermarket': {
        name: 'Supermarket',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 2,
        pressure: 1,
        points: 3,
        evolvesTo: '',
        imageAsset: 'supermarket'
    },
    'classroom': {
        name: 'Classroom',
        type: CardType.MARKET,
        cost: 4,
        evolveCost: 6,
        resource: 1,
        pressure: 0,
        points: 2,
        evolvesTo: 'university',
        imageAsset: 'classroom'
    },
    'university': {
        name: 'University',
        type: CardType.MARKET,
        cost: 0,
        evolveCost: 0,
        resource: 2,
        pressure: 0,
        points: 6,
        evolvesTo: '',
        imageAsset: 'university'
    },

    // Pressure Card
    'pressure': {
        name: 'Pressure',
        type: CardType.PRESSURE,
        cost: 0,
        evolveCost: 0,
        resource: 0,
        pressure: 1,
        points: 0,
        evolvesTo: '',
        imageAsset: 'pressure'
    }
};

// Helper functions for card operations
export const CardUtils = {
    // Get card data by name
    getCardData(cardName) {
        return CardData[cardName];
    },

    // Check if a card can be evolved
    canEvolve(cardName) {
        const card = CardData[cardName];
        return card && card.evolveCost > 0 && card.evolvesTo !== '';
    },

    // Get evolved version of a card
    getEvolvedCard(cardName) {
        const card = CardData[cardName];
        return card && card.evolvesTo ? CardData[card.evolvesTo] : null;
    },

    // Check if a card is a base (non-evolved) market card
    isBaseMarketCard(cardName) {
        const card = CardData[cardName];
        return card && card.type === CardType.MARKET && card.evolveCost > 0;
    },

    // Get all base market card names
    getBaseMarketCards() {
        return Object.keys(CardData).filter(cardName => 
            this.isBaseMarketCard(cardName)
        );
    }
};
