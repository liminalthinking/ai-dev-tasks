import { EventBus } from './EventBus';
import { IntroScene } from '../scenes/IntroScene';

// Full tutorial step schema (suggested defaults)
const DEFAULT_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome!',
        text: 'SG60: Building the Lion City is a single player deckbuilding game.\n\nEach game begins with an identical deck of 3 cards that you can evolve and add to as the game progresses..',
        panel: { anchor: 'top-center', offsetY: 100, maxWidth: 520, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'startingdeck',
        title: 'Your Starting Deck',
        text: 'Each deck starts with 2 kampung cards and 1 swamp card.\n\nThese cards produce Resource as well as Pressure.',
        panel: { anchor: 'top-center', offsetY: 100, maxWidth: 520, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'card-explain-kampung',
        mode: 'card-explainer',
        title: '',
        text: 'Each Kampung card provides 1 Resource which can be used to acquire additional cards for your deck.',
        panel: { anchor: 'center-left', offsetX: 100, maxWidth: 300 },
        media: {
            textureKey: 'provision-shop',
            url: 'assets/images/cards/provision-shop.png',
            fit: 'contain',
            anchor: 'center',
            offsetX: 24,
            caption: ''
        },
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'play-cards',
        title: 'Play Cards Phase',
        text: 'The game starts with the play cards phase.\n\nPlay a card from your deck by clicking on the deck',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-kampung',
        title: '',
        text: 'You have played a Kampung card.\n\nIt gives you 1 resource.',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'show-market',
        title: '',
        text: 'The cards in the middle row is the Market. \n\nThey are always available during the course of the game. ',
        panel: { anchor: 'center-right', offsetX: -24, offsetY: 0, maxWidth: 320 },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'show-market-card-2',
        title: '',
        text: 'These cards can be acquired during your turn when you have enough Resource.',
        panel: { anchor: 'center-right', offsetX: -24, offsetY: 0, maxWidth: 320 },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'play-cards-2',
        title: '',
        text: 'To increase the number of resource, you want to play as many cards as possible from your deck to gain Resource.\n\nClick the deck to play the next card',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-swamp',
        title: '',
        text: 'You have played a Swamp card.\n\nIt produces you 1 Pressure.',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.playCardBounds('swamp'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'explain-icon-pressure',
        title: '',
        text: 'Other than Resource, cards can also produce Pressure.\n\nThe game ends immediately when you have 5 Pressure.',
        panel: { anchor: 'bottom-center', offsetX: 24, offsetY: 0, maxWidth: 320 },
        highlight: (ctx) => ctx.playCardStatBounds('swamp', 'pressure'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'explain-objective-points',
        title: '',
        text: 'The objective of the game is to get as many Points as possible without busting.',
        panel: { anchor: 'top-left', offsetX: 0, offsetY: 75, maxWidth: 420 },
        highlight: (ctx) => ctx.hudResourcePressureBounds(),
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'hud-stats',
        title: '',
        text: 'You can track your Resource, Pressure and Points at the top.',
        panel: { anchor: 'top-left', offsetX: 0, offsetY: 75, maxWidth: 420 },
        highlight: (ctx) => ctx.hudResourcePressureBounds(),
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'play-cards-3',
        title: '',
        text: 'Since you are only at 1/5 Pressure, let\'s go ahead and draw the last card in your deck to gain more Resource.\n\nClick the deck to play the next card',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-kampung-2',
        title: '',
        text: 'You have played the 2nd Kampung card from your starting deck.\n\nIt gives you 1 resource.',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'empty-deck',
        title: '',
        text: 'Since there are no more cards in your deck, you must now end the Play Cards phase.\n\n',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'end-phase-explanation',
        title: '',
        text: 'Note that you may end the Play Cards phase at any time by clicking on the "End Phase" button.\n\nYou do not need to draw all the cards in your deck.\n\nNow click on the "End Phase" button to advance to the Build phase.',
        panel: { anchor: 'center-right', offsetY: 100, maxWidth: 320 },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }),
        waitFor: 'phase:changed:build'
    },
    {
        id: 'build-phase',
        title: '',
        text: 'You are now in the Build Phase.\n\n',
        panel: { anchor: 'center-center', offsetX: 24, maxWidth: 420 },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'build-phase-explanation',
        title: '',
        text: 'In the Build phase, you can build any number of cards from the Market you have enough Resource.\n\n.',
        panel: { anchor: 'bottom-center', offsetX: 0, maxWidth: 420 },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'eligible-cards',
        title: '',
        text: 'The cards you are eligibllt to buy have a silver medalion\n.',
        panel: { anchor: 'bottom-center', offsetX: 0, maxWidth: 420 },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'card-explain-provision-shop',
        mode: 'card-explainer',
        title: 'Provision Shop',
        text: 'Base Market card. Costs Resource to build; adds points. See Rules > Build.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 380 },
        media: {
            textureKey: 'provision-shop',
            url: 'assets/images/cards/provision-shop.png',
            fit: 'contain',
            anchor: 'center-left',
            offsetX: 24,
            caption: 'Affordable early pick to grow economy.'
        },
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'build',
        title: 'Build from the Market',
        text: 'Select an affordable card, then press Build. Card moves to discard; Resource decreases. See Rules > Build.',
        panel: { anchor: 'top-center', offsetY: 24, maxWidth: 560 },
        highlight: (ctx) => ctx.marketSlotBounds(0),
        allow: (ctx) => ctx.enableMarketOnly(['provision-shop']).allowButtons({ build: false }),
        onUserSelect: (ctx) => ctx.allowButtons({ build: true }),
        waitFor: 'market:built'
    },
    {
        id: 'card-explain-evolve',
        mode: 'card-explainer',
        title: 'Evolving Cards',
        text: 'Pay the evolve cost to upgrade a base card into a stronger one. See Rules > Evolve.',
        panel: { anchor: 'bottom-center', offsetY: -20, maxWidth: 520, align: 'center' },
        media: {
            textureKey: 'hawker-centre',
            url: 'assets/images/cards/hawker-centre.png',
            fit: 'contain',
            anchor: 'center',
            caption: 'Evolved cards improve points and outputs.'
        },
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'evolve',
        title: 'Evolve Played Cards',
        text: 'Select an eligible played card, then press Evolve. See Rules > Evolve.',
        panel: { anchor: 'center-left', offsetX: 24, maxWidth: 460 },
        highlight: (ctx) => ctx.firstEvolvableBounds(),
        allow: (ctx) => ctx.enableEvolveOnly().allowButtons({ evolve: false }),
        onUserSelect: (ctx) => ctx.allowButtons({ evolve: true }),
        waitFor: 'evolve:done'
    },
    {
        id: 'end-turn',
        title: 'End of Turn',
        text: 'End Phase adds a Pressure card and reshuffles discard into deck. See Rules > End of Turn.',
        panel: { anchor: 'bottom-right', offsetX: -24, offsetY: -24, maxWidth: 420 },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }).disableAllExceptMessages(),
        waitFor: 'endTurn:processed'
    },
    {
        id: 'finish',
        title: 'You’re Ready! ',
        text: 'Core loop: Play → Build → Evolve → End Turn. See Rules for details.',
        panel: { anchor: 'center', maxWidth: 520, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        actions: []
    }
];

export class TutorialManager {
    constructor({ game, sceneManager, phaseManager, cardInteractionSystem, eventBus = EventBus, steps = DEFAULT_STEPS }) {
        this.game = game;
        this.sceneManager = sceneManager;
        this.phaseManager = phaseManager;
        this.cardInteractionSystem = cardInteractionSystem;
        this.eventBus = eventBus;
        this.steps = steps;
        this.index = 0;
        this.scene = null;
        this._backdropAdvance = false;
        this._subscriptions = [];
    }

    attachScene(scene) {
        this.scene = scene;
    }

    start() {
        this.index = 0;
        this._renderCurrent();
    }

    _renderCurrent() {
        const step = this.steps[this.index];
        if (!step || !this.scene) return;
        // Configure backdrop advancement
        this._backdropAdvance = step.advance === 'clickAnywhere' || step.waitFor === 'next';
        // Apply allow (gating)
        try { typeof step.allow === 'function' && step.allow(this._ctx()); } catch (_) {}
        // Render
        const renderable = this._materialize(step);
        this.scene.renderStep(renderable);
        // Bind event waits (scaffold)
        this._unbindEvents();
        if (step.waitFor && typeof step.waitFor === 'string' && step.waitFor !== 'next') {
            this._handler = () => this.next();
            this._lastEvent = step.waitFor;
            this.eventBus.once(step.waitFor, this._handler);
        }
        // User selection helpers
        if (typeof step.onUserSelect === 'function') {
            const selHandler = () => step.onUserSelect(this._ctx());
            this.eventBus.on('market:slotSelected', selHandler);
            this.eventBus.on('evolve:selected', selHandler);
            this._subscriptions.push(['market:slotSelected', selHandler], ['evolve:selected', selHandler]);
        }
    }

    handleBackdropClick() {
        if (!this._backdropAdvance) return;
        // Debounce by unsetting until next render
        this._backdropAdvance = false;
        this.next();
    }

    next() {
        this._unbindEvents();
        if (this.index < this.steps.length - 1) {
            this.index++;
            this._renderCurrent();
        }
    }

    previous() {
        this._unbindEvents();
        if (this.index > 0) {
            this.index--;
            this._renderCurrent();
        }
    }

    _unbindEvents() {
        if (this._handler && this._lastEvent) {
            this.eventBus.off(this._lastEvent, this._handler);
        }
        if (this._subscriptions && this._subscriptions.length) {
            for (const [evt, fn] of this._subscriptions) {
                this.eventBus.off(evt, fn);
            }
            this._subscriptions = [];
        }
        this._handler = null;
        this._lastEvent = null;
    }

    exitToIntro() {
        if (this.game && typeof this.game.returnToIntro === 'function') {
            this.game.returnToIntro();
        }
    }

    // Context functions used by step definitions
    _ctx() {
        const deckScene = this.sceneManager.getScene('DeckScene');
        const marketScene = this.sceneManager.getScene('MarketScene');
        const messagesScene = this.sceneManager.getScene('MessagesScene');
        const playedScene = this.sceneManager.getScene('PlayedCardsScene');
        const hudScene = this.sceneManager.getScene('HUDScene');
        return {
            disableAll: () => {
                deckScene && deckScene.setInteractive(false);
                marketScene && marketScene.setInteractive(false);
                playedScene && playedScene.setInteractive(false);
                messagesScene && messagesScene.forceEnable({ endPhase: false, build: false, evolve: false });
                return this._ctx();
            },
            disableAllExceptMessages: () => {
                deckScene && deckScene.setInteractive(false);
                marketScene && marketScene.setInteractive(false);
                playedScene && playedScene.setInteractive(false);
                return this._ctx();
            },
            enableDeckOnly: () => {
                deckScene && deckScene.setInteractive(true);
                marketScene && marketScene.setInteractive(false);
                playedScene && playedScene.setInteractive(false);
                messagesScene && messagesScene.forceEnable({ endPhase: false, build: false, evolve: false });
                return this._ctx();
            },
            enableMarketOnly: (whitelist) => {
                deckScene && deckScene.setInteractive(false);
                marketScene && marketScene.setInteractive(true);
                marketScene && marketScene.setAllowedKeys(whitelist || null);
                playedScene && playedScene.setInteractive(false);
                messagesScene && messagesScene.forceEnable({ endPhase: false, build: false, evolve: false });
                return this._ctx();
            },
            enableEvolveOnly: () => {
                deckScene && deckScene.setInteractive(false);
                marketScene && marketScene.setInteractive(false);
                playedScene && playedScene.setInteractive(true);
                messagesScene && messagesScene.forceEnable({ endPhase: false, build: false, evolve: false });
                return this._ctx();
            },
            allowButtons: (flags) => { messagesScene && messagesScene.forceEnable(flags); return this._ctx(); },
            deckBounds: () => deckScene && deckScene.getDeckBounds ? deckScene.getDeckBounds() : null,
            marketBounds: () => {
                const cfg = marketScene && marketScene.config && marketScene.config.bounds;
                return cfg ? { x: cfg.x, y: cfg.y, width: cfg.width, height: cfg.height } : null;
            },
            marketSlotBounds: (i) => marketScene && marketScene.getSlotBounds ? marketScene.getSlotBounds(i) : null,
            buttonBounds: (k) => messagesScene && messagesScene.getButtonBounds ? messagesScene.getButtonBounds(k) : null,
            firstEvolvableBounds: () => playedScene && playedScene.getFirstEvolvableBounds ? playedScene.getFirstEvolvableBounds() : null,
            playCardBounds: (name) => playedScene && playedScene.getPlayedCardBoundsByName ? playedScene.getPlayedCardBoundsByName(name) : null,
            playCardStatBounds: (name, stat) => playedScene && playedScene.getPlayedCardStatBounds ? playedScene.getPlayedCardStatBounds(name, stat) : null,
            hudResourcePressureBounds: () => {
                // Approximate HUD group by taking HUD scene bounds top area
                const cfg = hudScene && hudScene.config && hudScene.config.bounds;
                if (!cfg) return null;
                return { x: cfg.x + 10, y: cfg.y + 10, width: 600, height: 80 };
            }
        };
    }

    // Convert functional fields to plain rects and simple values for rendering
    _materialize(step) {
        const ctx = this._ctx();
        const cloned = { ...step };
        if (typeof step.highlight === 'function') {
            cloned.highlight = () => step.highlight(ctx);
        }
        return cloned;
    }
}


