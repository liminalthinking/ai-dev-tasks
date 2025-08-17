import { CardData, CardUtils } from './CardProperties';
import { StartingDeck } from './StartingDeck';

export class PlayerDeck {
    constructor() {
        this.drawPile = [];
        this.playedCards = [];
        this.discardPile = [];
        this.isShuffling = false;
        this.initializeDeck();
    }

    // Initialize deck with starting cards
    initializeDeck() {
        const startingDeck = new StartingDeck();
        this.drawPile = startingDeck.getCards();
        this.shuffleDeck();  // Shuffle initial deck
    }

    // Draw a card from the draw pile
    async drawCard() {
        // If draw pile is empty, shuffle discard pile back in
        if (this.drawPile.length === 0) {
            await this.shuffleDiscardPile();
        }

        // Return null if no cards available
        if (this.drawPile.length === 0) {
            return null;
        }

        return this.drawPile.pop();
    }

    // Play a card from hand to the played cards area
    playCard(card) {
        this.playedCards.push(card);
        return card;
    }

    // Move a card to the discard pile
    discardCard(card) {
        this.discardPile.push(card);
    }

    // Check if a card is in the played cards area
    isCardInPlay(cardName) {
        return this.playedCards.some(card => card.name === cardName);
    }

    // Remove a card from played cards
    removeFromPlay(cardName) {
        const index = this.playedCards.findIndex(card => card.name === cardName);
        if (index !== -1) {
            const [removedCard] = this.playedCards.splice(index, 1);
            return removedCard;
        }
        return null;
    }

    // Evolve a played card
    evolveCard(cardToEvolve) {
        // Validate card can be evolved
        if (!CardUtils.canEvolve(cardToEvolve.name)) {
            console.error(`${cardToEvolve.name} cannot be evolved`);
            return null;
        }

        const evolvedCardName = cardToEvolve.evolvesTo;
        const evolvedCardData = CardData[evolvedCardName];
        
        if (!evolvedCardData) {
            console.error(`Evolution target ${evolvedCardName} not found`);
            return null;
        }

        // Create the evolved card
        const evolvedCard = { ...evolvedCardData };
        
        // Remove the original card from played cards
        this.removeFromPlay(cardToEvolve.name);
        
        // Add evolved card to played cards
        this.playedCards.push(evolvedCard);
        
        return evolvedCard;
    }

    // Shuffle the draw pile
    shuffleDeck() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.drawPile[i], this.drawPile[j]] = [this.drawPile[j], this.drawPile[i]];
        }
    }

    // Shuffle discard pile back into draw pile with animation support
    async shuffleDiscardPile() {
        if (this.isShuffling || this.discardPile.length === 0) {
            return;
        }

        this.isShuffling = true;

        try {
            // Return information for animation
            const shuffleInfo = {
                cardsToShuffle: [...this.discardPile],
                originalDiscardCount: this.discardPile.length
            };

            // Add all cards from discard pile to draw pile
            this.drawPile.push(...this.discardPile);
            this.discardPile = [];

            // Shuffle the combined pile
            this.shuffleDeck();

            return {
                success: true,
                ...shuffleInfo,
                newDrawPileCount: this.drawPile.length
            };
        } finally {
            this.isShuffling = false;
        }
    }

    // End turn: move all played cards to discard pile
    endTurn() {
        // Move all played cards to discard pile
        const movedCount = this.playedCards.length;
        this.discardPile.push(...this.playedCards);
        this.playedCards = [];

        return {
            discardedCount: movedCount,
            newDiscardPileCount: this.discardPile.length
        };
    }

    // Get current counts
    getCounts() {
        return {
            drawPile: this.drawPile.length,
            playedCards: this.playedCards.length,
            discardPile: this.discardPile.length,
            total: this.drawPile.length + this.playedCards.length + this.discardPile.length
        };
    }

    // Get all cards in played area
    getPlayedCards() {
        return [...this.playedCards];
    }

    // Get all cards in discard pile
    getDiscardPile() {
        return [...this.discardPile];
    }

    // Check if draw pile is empty
    isDrawPileEmpty() {
        return this.drawPile.length === 0;
    }

    // Check if shuffle is needed
    needsShuffle() {
        return this.drawPile.length === 0 && this.discardPile.length > 0;
    }

    // Calculate total points from all cards
    calculateTotalPoints() {
        const allCards = [
            ...this.drawPile,
            ...this.playedCards,
            ...this.discardPile
        ];
        return allCards.reduce((total, card) => total + (card.points || 0), 0);
    }

    // Deterministic deck for tutorial: ensure first draw yields Resource (kampung)
    seedForTutorial() {
        // Clear all piles
        this.drawPile = [];
        this.playedCards = [];
        this.discardPile = [];
        // Build a known order; drawCard() pops from the end, so put the desired first draw last
        const swamp = { ...CardData['swamp'] };
        const kampung1 = { ...CardData['kampung'] };
        const kampung2 = { ...CardData['kampung'] };
        this.drawPile = [swamp, kampung1, kampung2]; // first draw -> kampung2 (resource 1)
    }
}