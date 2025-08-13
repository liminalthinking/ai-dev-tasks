import { CardUtils } from '../data/CardProperties';
import { PressureCards } from '../data/PressureCards';

export class CardInteractionSystem {
    constructor(playerDeck, marketCards) {
        this.playerDeck = playerDeck;
        this.marketCards = marketCards;
        this.currentResource = 0;
        this.currentPressure = 0;
        this.selectedCard = null;
        this.lastPurchaseCost = 0;
        this.lastEvolutionCost = 0;
        this.turnState = {
            cardsPlayed: 0,
            cardsPurchased: 0,
            cardsEvolved: 0,
            resourcesGained: 0,
            resourcesSpent: 0,
            pressureGained: 0
        };
    }

    // Play Cards Phase interactions
    async drawCard() {
        const card = await this.playerDeck.drawCard();
        if (card) {
            // Add card to played cards
            this.playerDeck.playCard(card);
            
            // Calculate resource and pressure changes
            const resourceChange = card.resource || 0;
            const pressureChange = card.pressure || 0;
            
            // Update totals
            this.currentResource = Math.max(0, this.currentResource + resourceChange);
            this.currentPressure = Math.max(0, this.currentPressure + pressureChange);

            // Update turn state
            this.turnState.cardsPlayed++;
            if (resourceChange > 0) this.turnState.resourcesGained += resourceChange;
            if (pressureChange > 0) this.turnState.pressureGained += pressureChange;

            return {
                card,
                resourceChange,
                pressureChange,
                currentResource: this.currentResource,
                currentPressure: this.currentPressure,
                isBust: PressureCards.isPressureBust(this.currentPressure)
            };
        }
        return null;
    }

    // Build Phase interactions
    canBuildCard(cardName) {
        const card = CardUtils.getCardData(cardName);
        return card && 
               this.marketCards.isCardAvailable(cardName) && 
               card.cost <= this.currentResource;
    }

    buildCard(cardName) {
        if (!this.canBuildCard(cardName)) {
            return {
                success: false,
                message: 'Cannot build card: insufficient resources or card not available'
            };
        }

        const card = this.marketCards.purchaseCard(cardName);
        if (card) {
            // Store cost for HUD animation
            this.lastPurchaseCost = card.cost;
            
            // Deduct resources
            this.currentResource -= card.cost;
            
            // Add to discard pile
            this.playerDeck.discardCard(card);

            // Update turn state
            this.turnState.cardsPurchased++;
            this.turnState.resourcesSpent += card.cost;

            return {
                success: true,
                card,
                remainingResource: this.currentResource,
                remainingCount: this.marketCards.getCardCount(cardName)
            };
        }

        return {
            success: false,
            message: 'Failed to purchase card'
        };
    }

    // Evolve Phase interactions
    canEvolveCard(cardName) {
        const key = CardUtils.resolveKey(cardName);
        const card = key ? CardUtils.getCardData(key) : null;
        // Use the canonical key for capability checks; passing display names
        // would fail lookups inside CardData.
        return card && CardUtils.canEvolve(key);
    }

    getEvolvedCardData(cardName) {
        const key = CardUtils.resolveKey(cardName);
        return key ? CardUtils.getEvolvedCard(key) : null;
    }

    selectCardForEvolution(card) {
        const key = CardUtils.resolveKey(card.name);
        if (!key || !this.canEvolveCard(key)) {
            return {
                success: false,
                message: 'Card cannot be evolved'
            };
        }

        // Check if card is in played cards
        if (!this.playerDeck.isCardInPlay(card.name)) {
            return {
                success: false,
                message: 'Card must be in play to evolve'
            };
        }

        this.selectedCard = { ...CardUtils.getCardData(key) };
        const canAfford = this.currentResource >= this.selectedCard.evolveCost;

        return {
            success: true,
            card: this.selectedCard,
            evolveCost: card.evolveCost,
            canAffordEvolution: canAfford,
            evolvedCard: this.getEvolvedCardData(key),
            message: canAfford ? null : 'Insufficient resources for evolution'
        };
    }

    canEvolveSelectedCard() {
        return this.selectedCard && 
               this.canEvolveCard(this.selectedCard.name) && 
               this.currentResource >= this.selectedCard.evolveCost &&
               this.playerDeck.isCardInPlay(this.selectedCard.name);
    }

    evolveSelectedCard() {
        if (!this.canEvolveSelectedCard()) {
            const message = !this.selectedCard ? 'No card selected' :
                          !this.canEvolveCard(this.selectedCard.name) ? 'Card cannot be evolved' :
                          !this.playerDeck.isCardInPlay(this.selectedCard.name) ? 'Card must be in play' :
                          'Insufficient resources';
            
            return {
                success: false,
                message
            };
        }

        // Store cost for HUD animation
        this.lastEvolutionCost = this.selectedCard.evolveCost;

        // Deduct evolution cost
        this.currentResource -= this.selectedCard.evolveCost;

        // Get evolved card data
        const evolvedCard = this.getEvolvedCardData(this.selectedCard.name);

        // Remove old card from play and move evolved card to discard pile
        this.playerDeck.removeFromPlay(this.selectedCard.name);
        this.playerDeck.discardCard(evolvedCard);

        // Since the evolved card is discarded immediately, its stats do not
        // affect current turn resource/pressure beyond the evolve cost.
        const resourceChange = 0;
        const pressureChange = 0;
        
        // Update turn state
        this.turnState.cardsEvolved++;
        this.turnState.resourcesSpent += this.selectedCard.evolveCost;
        if (resourceChange > 0) this.turnState.resourcesGained += resourceChange;
        if (pressureChange > 0) this.turnState.pressureGained += pressureChange;

        // Clear selection
        const oldCard = this.selectedCard;
        this.selectedCard = null;

        return {
            success: true,
            oldCard,
            evolvedCard,
            resourceChange,
            pressureChange,
            remainingResource: this.currentResource,
            currentPressure: this.currentPressure
        };
    }

    clearCardSelection() {
        this.selectedCard = null;
    }

    // End of turn cleanup
    async endTurn(currentTurn) {
        // Get turn summary before reset
        const turnSummary = { ...this.turnState };

        // Add pressure card to discard pile
        const pressureCards = new PressureCards();
        const pressureResult = pressureCards.addPressureCardTo(
            this.playerDeck.discardPile,
            currentTurn
        );

        // Move all played cards to discard pile
        const discardResult = this.playerDeck.endTurn();

        // Rebuild the draw pile: shuffle discard + existing draw to form new deck as per PRD
        if (this.playerDeck.discardPile.length > 0) {
            this.playerDeck.drawPile.push(...this.playerDeck.discardPile);
            this.playerDeck.discardPile = [];
            this.playerDeck.shuffleDeck();
        }

        // Reset all state
        this.resetState();

        return {
            turnSummary,
            pressureResult,
            discardResult,
            deckCounts: this.playerDeck.getCounts()
        };
    }

    // Reset all state for next turn
    resetState() {
        // Reset resources and pressure
        this.currentResource = 0;
        this.currentPressure = 0;

        // Reset card selections and costs
        this.selectedCard = null;
        this.lastPurchaseCost = 0;
        this.lastEvolutionCost = 0;

        // Reset turn state tracking
        this.turnState = {
            cardsPlayed: 0,
            cardsPurchased: 0,
            cardsEvolved: 0,
            resourcesGained: 0,
            resourcesSpent: 0,
            pressureGained: 0
        };
    }

    // Get current game state
    getGameState() {
        return {
            resource: this.currentResource,
            pressure: this.currentPressure,
            resourceChange: 0, // Will be updated by drawCard
            pressureChange: 0, // Will be updated by drawCard
            lastPurchaseCost: this.lastPurchaseCost,
            lastEvolutionCost: this.lastEvolutionCost,
            selectedCard: this.selectedCard,
            deckCounts: this.playerDeck.getCounts(),
            marketState: this.marketCards.getMarketState(),
            turnState: { ...this.turnState }
        };
    }

    // Get turn summary
    getTurnSummary() {
        return {
            ...this.turnState,
            netResources: this.turnState.resourcesGained - this.turnState.resourcesSpent,
            totalPressure: this.turnState.pressureGained,
            cardCount: this.turnState.cardsPlayed + this.turnState.cardsPurchased
        };
    }

    // Resource and pressure getters
    getCurrentResource() {
        return this.currentResource;
    }

    getCurrentPressure() {
        return this.currentPressure;
    }

    // Get purchasable cards based on current resources
    getPurchasableCards() {
        return this.marketCards.getPurchasableCards(this.currentResource);
    }

    // Get cards that can be evolved (regardless of resource)
    getEvolvableCards() {
        return this.playerDeck.getPlayedCards().filter(card => 
            this.canEvolveCard(card.name)
        );
    }
}