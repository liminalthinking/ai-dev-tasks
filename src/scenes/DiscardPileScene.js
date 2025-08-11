import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';

export class DiscardPileScene extends BaseScene {
    constructor() {
        super('DiscardPileScene');
        this.discardedCards = [];
        this.topCard = null;
        this.animationContainer = null;
        this.hoverPreviews = new Map();
    }

    createScene() {
        // Center within its viewport like DeckScene
        const cardScale = 0.52; // 30% larger than before
        // Use configured bounds to compute true center so it remains centered after layout changes
        const { bounds } = this.config;
        const x = bounds.width / 2;
        const y = bounds.height / 2;

        // Remove center text indicator for a cleaner look (keep scene label only)
        this.emptyPileText = this.add.text(x, y - 30, '', {
            fontSize: '16px',
            fill: '#666666'
        }).setOrigin(0.5);

        // Container for the top card display
        this.cardContainer = this.add.container(x, y);

        // Container for animations
        this.animationContainer = this.add.container(x, y);

        // Add hover text for card count
        this.countText = this.add.text(x, y + 30, '0 cards', {
            fontSize: '14px',
            fill: '#ffffff'
        }).setOrigin(0.5);
    }

    showHoverPreview(cardImage) {
        this.hideHoverPreview(cardImage);
        const previewScale = (cardImage.scale || 0.52) * 1.6;
        const { bounds } = this.config;
        const centerX = bounds.x + this.cardContainer.x + cardImage.x;
        const centerY = bounds.y + this.cardContainer.y + cardImage.y;
        const cardW = cardImage.width * cardImage.scaleX;
        const cardH = cardImage.height * cardImage.scaleY;

        const overlay = this.scene.get('OverlayScene');
        if (!overlay || !overlay.showCardPreview) return;
        const id = overlay.showCardPreview({
            textureKey: cardImage.texture.key,
            centerX,
            centerY,
            cardWidth: cardW,
            cardHeight: cardH,
            preferredAnchor: 'bottom-left',
            scaleFactor: 1.3
        });
        this.hoverPreviews.set(cardImage, id);
    }

    hideHoverPreview(cardImage) {
        const overlay = this.scene.get('OverlayScene');
        const id = this.hoverPreviews.get(cardImage);
        if (overlay && id) overlay.hideCardPreview(id);
        this.hoverPreviews.delete(cardImage);
    }

    addCard(cardData, animate = true) {
        // Add to tracking array
        this.discardedCards.push(cardData);

        if (animate) {
            // Animate card addition
            this.animateCardAddition(cardData);
        } else {
            // Update immediately without animation
            this.updateTopCard(cardData);
        }

        // Update card count
        this.updateCardCount();
    }

    animateCardAddition(cardData) {
        // Create card sprite for animation
        const cardSprite = this.add.image(50, 100, cardData.imageAsset)
            .setOrigin(0.5)
            .setScale(0.52);

        // Add to animation container
        this.animationContainer.add(cardSprite);

        // Animate card flying to discard pile
        this.tweens.add({
            targets: cardSprite,
            x: 50,
            y: 100,
            scaleX: 0.52,
            scaleY: 0.52,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Remove animation sprite
                cardSprite.destroy();
                // Update top card display
                this.updateTopCard(cardData);
            }
        });
    }

    async animatePressureCardAddition(pressureCard, insertIndex, totalCards) {
        // Create pressure card sprite
        const pressureSprite = this.add.image(50, 100, pressureCard.imageAsset)
            .setOrigin(0.5)
            .setScale(0.52)
            .setTint(0xff0000); // Red tint for pressure cards

        // Add to animation container
        this.animationContainer.add(pressureSprite);

        // Animate pressure card with special effects
        const timeline = this.tweens.timeline({
            onComplete: () => {
                pressureSprite.destroy();
                this.updateTopCard(pressureCard);
                this.showPressureWarning();
            }
        });

        // Pulse animation for pressure card
        timeline.add({
            targets: pressureSprite,
            scaleX: 0.65,
            scaleY: 0.65,
            duration: 200,
            ease: 'Power2'
        });

        timeline.add({
            targets: pressureSprite,
            scaleX: 0.52,
            scaleY: 0.52,
            duration: 200,
            ease: 'Power2'
        });

        // Move to final position
        timeline.add({
            targets: pressureSprite,
            x: 50,
            y: 100,
            duration: 300,
            ease: 'Back.easeOut'
        });

        return new Promise(resolve => {
            timeline.once('complete', resolve);
        });
    }

    showPressureWarning() {
        // Create warning text
        const warningText = this.add.text(50, 150, '⚠️ Pressure Added!', {
            fontSize: '16px',
            fill: '#ff0000',
            fontStyle: 'bold'
        });

        // Animate warning text
        this.tweens.add({
            targets: warningText,
            y: 130,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => warningText.destroy()
        });
    }

    updateTopCard(cardData) {
        // Remove previous top card if it exists
        if (this.topCard) {
            this.topCard.destroy();
        }

        // Create new top card display
        this.topCard = this.add.image(0, 0, cardData.imageAsset)
            .setOrigin(0.5)
            .setScale(0.52);

        // Add to container
        this.cardContainer.add(this.topCard);

        // Make top card interactive for hover effect
        this.topCard.setInteractive()
            .on('pointerover', () => {
                // New magnified hover preview (anchor top-left for discard area)
                this.showHoverPreview(this.topCard, 'top-left');
                // this.topCard.setTint(0xcccccc);
                // this.showCardDetails(cardData);
            })
            .on('pointerout', () => {
                this.hideHoverPreview(this.topCard);
                // this.topCard.clearTint();
                // this.hideCardDetails();
            });

        // Hide empty pile text
        this.emptyPileText.setVisible(false);
    }

    showCardDetails(cardData) {
        // Create details text
        const detailsText = this.add.text(150, 100, 
            `${cardData.name}\nResource: ${cardData.resource}\nPressure: ${cardData.pressure}\nPoints: ${cardData.points}`, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });

        this.cardDetails = detailsText;
    }

    hideCardDetails() {
        if (this.cardDetails) {
            this.cardDetails.destroy();
            this.cardDetails = null;
        }
    }

    updateCardCount() {
        const count = this.discardedCards.length;
        this.countText.setText(`${count} card${count !== 1 ? 's' : ''}`);
    }

    clearDiscardPile() {
        // Clear tracking array
        this.discardedCards = [];

        // Remove top card display
        if (this.topCard) {
            this.topCard.destroy();
            this.topCard = null;
        }

        // Show empty pile text
        this.emptyPileText.setVisible(true);

        // Update count
        this.updateCardCount();
    }

    getDiscardedCards() {
        return [...this.discardedCards];
    }

    // Show end turn summary
    showEndTurnSummary(turnSummary) {
        const summaryText = this.add.text(50, 250, 
            `Turn Summary:\nCards Played: ${turnSummary.cardsPlayed}\nCards Purchased: ${turnSummary.cardsPurchased}\nCards Evolved: ${turnSummary.cardsEvolved}\nNet Resources: ${turnSummary.netResources}`, {
            fontSize: '12px',
            fill: '#ffffff',
            backgroundColor: '#333333',
            padding: { x: 10, y: 10 }
        });

        // Animate summary appearance
        summaryText.setAlpha(0);
        this.tweens.add({
            targets: summaryText,
            alpha: 1,
            duration: 500,
            ease: 'Power2'
        });

        // Remove summary after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: summaryText,
                alpha: 0,
                duration: 500,
                onComplete: () => summaryText.destroy()
            });
        });
    }
}