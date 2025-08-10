import { CardData, CardType } from './CardProperties';

export class StartingDeck {
    constructor() {
        this.cards = [];
        this.initializeStartingCards();
    }

    // Initialize the starting deck with 2 Kampungs and 1 Swamp
    initializeStartingCards() {
        // Add 2 Kampungs
        this.cards.push({ ...CardData['kampung'] });
        this.cards.push({ ...CardData['kampung'] });
        
        // Add 1 Swamp
        this.cards.push({ ...CardData['swamp'] });

        // Shuffle the initial deck
        this.shuffle();
    }

    // Fisher-Yates shuffle algorithm
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    // Get the shuffled starting deck
    getCards() {
        return [...this.cards];
    }

    // Static method to get all possible starting card types
    static getStartingCardTypes() {
        return Object.keys(CardData).filter(cardName => 
            CardData[cardName].type === CardType.STARTING && 
            CardData[cardName].evolveCost > 0 // Only base cards
        );
    }

    // Static method to get evolved versions of starting cards
    static getEvolvedStartingCards() {
        return Object.keys(CardData).filter(cardName => 
            CardData[cardName].type === CardType.STARTING && 
            CardData[cardName].evolveCost === 0 // Only evolved cards
        );
    }

    // Static method to validate if a card is a starting card
    static isStartingCard(cardName) {
        return CardData[cardName]?.type === CardType.STARTING;
    }
}
