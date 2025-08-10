import { CardData, CardType } from './CardProperties';

export class PressureCards {
    constructor() {
        // Get the pressure card template
        this.pressureCardTemplate = CardData['pressure'];
        
        if (!this.pressureCardTemplate || this.pressureCardTemplate.type !== CardType.PRESSURE) {
            throw new Error('Pressure card template not found in CardData');
        }
    }

    // Create a new pressure card instance
    createPressureCard(turn) {
        // Return a new copy of the pressure card template with turn info
        return {
            ...this.pressureCardTemplate,
            addedOnTurn: turn,  // Track when the pressure card was added
            id: `pressure-${turn}-${Date.now()}`  // Unique ID for animation tracking
        };
    }

    // Add a pressure card to a deck or pile with animation info
    addPressureCardTo(cards, turn, position = 'random') {
        const pressureCard = this.createPressureCard(turn);

        if (position === 'random') {
            // Insert at random position
            const insertIndex = Math.floor(Math.random() * (cards.length + 1));
            cards.splice(insertIndex, 0, pressureCard);
            return {
                card: pressureCard,
                insertIndex,
                totalCards: cards.length
            };
        } else if (position === 'top') {
            // Add to top of pile/deck
            cards.push(pressureCard);
            return {
                card: pressureCard,
                insertIndex: cards.length - 1,
                totalCards: cards.length
            };
        } else if (position === 'bottom') {
            // Add to bottom of pile/deck
            cards.unshift(pressureCard);
            return {
                card: pressureCard,
                insertIndex: 0,
                totalCards: cards.length
            };
        }
    }

    // Calculate total pressure from a collection of cards
    static calculateTotalPressure(cards) {
        return cards.reduce((total, card) => total + (card.pressure || 0), 0);
    }

    // Check if total pressure exceeds the limit (5)
    static isPressureBust(totalPressure) {
        return totalPressure >= 5;
    }

    // Check if a card is a pressure card
    static isPressureCard(card) {
        return card?.type === CardType.PRESSURE;
    }

    // Format pressure display (e.g., "3/5")
    static formatPressureDisplay(currentPressure) {
        return `${currentPressure}/5`;
    }

    // Get all pressure cards from a collection
    static filterPressureCards(cards) {
        return cards.filter(card => PressureCards.isPressureCard(card));
    }

    // Get pressure cards added on a specific turn
    static getPressureCardsFromTurn(cards, turn) {
        return cards.filter(card => 
            PressureCards.isPressureCard(card) && 
            card.addedOnTurn === turn
        );
    }
}