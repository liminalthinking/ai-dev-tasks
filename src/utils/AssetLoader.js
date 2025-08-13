export class AssetLoader {
    static preloadCardImages(scene) {
        // Load all card images
        const cardImages = [
            'kampung',
            'hdb-block',
            'swamp',
            'kallang-river',
            'police-station',
            'city-hall',
            'provision-shop',
            'shopping-mall',
            'street-food-stall',
            'hawker-centre',
            'trishaw-hub',
            'bus-interchange',
            'wet-market',
            'supermarket',
            'classroom',
            'university',
            'pressure'
        ];

        // Load each card image
        cardImages.forEach(cardName => {
            if (!scene.textures.exists(cardName)) {
                scene.load.image(cardName, `assets/images/cards/${cardName}.png`);
            }
        });

        // Backward-compatible aliases for images with a hyphen issue
        // Some code paths might request textures with a leading underscore (e.g., "_shopping-mall").
        // Create lightweight aliases after load completes to avoid 404s.
        scene.load.on('complete', () => {
            const createAlias = (alias, source) => {
                try {
                    const tex = scene.textures.get(source);
                    if (tex && !scene.textures.exists(alias)) {
                        scene.textures.addImage(alias, tex.getSourceImage());
                    }
                } catch (_) { /* no-op */ }
            };
            createAlias('_shopping-mall', 'shopping-mall');
            createAlias('_hawker-centre', 'hawker-centre');
        });

        // Do not load 'card-back' here. It is owned by DeckScene to avoid
        // duplicate-key warnings when multiple scenes preload in parallel.
    }
}