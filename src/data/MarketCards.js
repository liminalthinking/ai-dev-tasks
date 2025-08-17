import { CardData, CardType, CardUtils } from './CardProperties';

export class MarketCards {
    constructor() {
        // Initialize supply counts for each market card type
        this.cardSupply = {
            'provision-shop': 4,
            'classroom': 4,
            'wet-market': 4,
            'police-station': 4,
            'trishaw-hub': 4,
            'street-food-stall': 4
        };

        // Fixed order of market slots
        this.marketSlots = [
            'provision-shop',
            'classroom',
            'wet-market',
            'police-station',
            'trishaw-hub',
            'street-food-stall'
        ];
    }

    // Get all available market cards and their counts
    getMarketState() {
        return {
            slots: this.marketSlots,
            supply: { ...this.cardSupply }
        };
    }

    // Check if a card can be purchased (is available in market)
    isCardAvailable(cardName) {
        return this.cardSupply[cardName] > 0;
    }

    // Get remaining count for a specific card
    getCardCount(cardName) {
        return this.cardSupply[cardName] || 0;
    }

    // Purchase a card from the market
    purchaseCard(cardName) {
        // Verify card is a base market card
        if (!CardUtils.isBaseMarketCard(cardName)) {
            console.error(`${cardName} is not a base market card`);
            return null;
        }

        // Check if card is available
        if (!this.isCardAvailable(cardName)) {
            console.error(`${cardName} is not available in the market`);
            return null;
        }

        // Reduce supply and return card data
        this.cardSupply[cardName]--;
        return { ...CardData[cardName] };
    }

    // Check if a card can be purchased with given resources
    canPurchaseCard(cardName, availableResource) {
        const card = CardData[cardName];
        return card && 
               this.isCardAvailable(cardName) && 
               card.cost <= availableResource;
    }

    // Get all purchasable cards given available resources
    getPurchasableCards(availableResource) {
        return this.marketSlots.filter(cardName => 
            this.canPurchaseCard(cardName, availableResource)
        );
    }

    // Get card data for a market slot
    getSlotCard(slotIndex) {
        const cardName = this.marketSlots[slotIndex];
        if (cardName && this.isCardAvailable(cardName)) {
            return {
                ...CardData[cardName],
                remainingCount: this.cardSupply[cardName]
            };
        }
        return null;
    }

    // Check if market is empty (no cards available)
    isEmpty() {
        return Object.values(this.cardSupply).every(count => count === 0);
    }

    // Get total remaining cards in market
    getTotalRemainingCards() {
        return Object.values(this.cardSupply).reduce((sum, count) => sum + count, 0);
    }

    // Get all evolved versions of market cards
    static getEvolvedMarketCards() {
        return Object.keys(CardData).filter(cardName => {
            const card = CardData[cardName];
            return card.type === CardType.MARKET && card.evolveCost === 0;
        });
    }

    // Validate if a card is a market card (base or evolved)
    static isMarketCard(cardName) {
        return CardData[cardName]?.type === CardType.MARKET;
    }

    // Deterministic market for tutorial: leave defaults but allow override
    seedForTutorial() {
        // Ensure at least one affordable slot (provision-shop cost 1)
        this.cardSupply['provision-shop'] = Math.max(this.cardSupply['provision-shop'] || 0, 1);
        // Keep fixed slots order as-is
    }
}
