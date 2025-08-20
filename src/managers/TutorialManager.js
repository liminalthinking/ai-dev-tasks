import { EventBus } from './EventBus';
import { IntroScene } from '../scenes/IntroScene';

// Full tutorial step schema (suggested defaults)
const DEFAULT_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome!',
        text: 'SG60: Building the Lion City is a single player deckbuilding game.\n\nEach game begins with an identical deck of 3 cards that you can evolve and add to as the game progresses..',
        panel: { anchor: 'top-center', offsetY: 100, maxWidth: 320, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'startingdeck',
        title: 'Your Starting Deck',
        text: 'Each deck starts with 2 kampung cards and 1 swamp card.\n\nThese cards produce Resource as well as Pressure.',
        panel: { anchor: 'top-center', offsetY: 100, maxWidth: 320, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    /*
    {
        id: 'card-explain-kampung',
        mode: 'card-explainer',
        title: '',
        text: 'Each Kampung card provides 1 Resource which can be used to acquire additional cards for your deck.',
        panel: { anchor: 'center-left', offsetX: 100, maxWidth: 320, align: 'center' },
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
    */
    {
        id: 'play-cards',
        title: 'Play Cards Phase',
        text: 'The game starts with the play cards phase.\n\nPlay a card from your deck by clicking on the deck',
        panel: { anchor: 'bottom-center', offsetX: -200, offsetY: -100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-kampung',
        
        text: 'You have played a Kampung card.\n\n',
        panel: { anchor: 'bottom-center', offsetX: 20, offsetY: -100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next',
    },
    {
        id: 'explain-icon-resource',
        title: '',
        text: 'The Kampung card gives you 1 resource. You can use the resource to build new cards into your deck.',
        panel: { anchor: 'bottom-center', offsetX: -40, offsetY: -50, maxWidth: 320, align: 'center' },
        highlight: (ctx) => {
            const rect = ctx.playCardStatBounds('kampung', 'resource');
            return {
                x: rect.x - 10,
                y: rect.y - 40,
                width: rect.width,
                height: rect.height
            };
        },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'show-market',
        title: '',
        text: 'The cards in the middle row is the Market. \n\nThis is where you can build new cards.\n\nThey are always available during the course of the game. ',
        panel: { anchor: 'center-right', offsetX: -24, offsetY: 0, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'show-market-card-2',
        title: '',
        text: 'These cards can be acquired during your turn when you have enough Resource.',
        panel: { anchor: 'center-right', offsetX: -24, offsetY: 0, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'play-cards-2',
        title: '',
        text: 'To increase the number of resource, you want to play as many cards as possible from your deck to gain Resource.\n\nClick the deck to play the next card',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-swamp',
        title: '',
        text: 'You have played a Swamp card.',
        panel: { anchor: 'bottom-center', offsetX: -20, offsetY: -50, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.playCardBounds('swamp'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'show-icon-pressure',
        title: '',
        text: 'The Swmap card produces 1 Pressure.',
        panel: { anchor: 'bottom-center', offsetX: -20, offsetY: -50, maxWidth: 320, align: 'center' },
        highlight: (ctx) => {
            const rect = ctx.playCardStatBounds('swamp', 'pressure');
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'explain-icon-pressure',
        title: '',
        text: 'Other than Resource, cards can also produce Pressure.\n\nThis reflects the tension with growing a city nation.',
        panel: { anchor: 'bottom-center', offsetX: 24, offsetY: 0, maxWidth: 320, align: 'center' },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'hud-stats',
        title: '',
        text: 'You can track your Resource, Pressure and Points at the top.',
        panel: { anchor: 'top-left', offsetX: 0, offsetY: 100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.hudResourcePressureBounds(),
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'explain-objective-points',
        title: '',
        text: 'Remember, the objective of the game is to get as many Points as possible without reaching 5/5 Pressure.',
        panel: { anchor: 'top-left', offsetX: 0, offsetY: 100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.hudResourcePressureBounds(),
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'play-cards-3',
        title: '',
        text: 'Since you are only at 1/5 Pressure, let\'s go ahead and draw the last card in your deck to gain more Resource.\n\nClick the deck to play the next card',
        panel: { anchor: 'bottom-center', offsetX: -200, offsetY: -100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'play-cards-kampung-2',
        title: '',
        text: 'You have played the 2nd Kampung card from your starting deck.\n\nIt gives you 1 additional resource to use this turn.',
        panel: { anchor: 'bottom-center', offsetX: 0, offsetY: -50, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'empty-deck',
        title: '',
        text: 'Since there are no more cards in your deck, you must now end the Play Cards phase.\n\n',
        panel: { anchor: 'bottom-left', offsetX: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.playCardBounds('kampung'),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'end-phase-explanation',
        title: '',
        text: 'Note that you may end the Play Cards phase at any time by clicking on the "End Phase" button.\n\nYou do not need to draw all the cards in your deck.\n\nNow click on the "End Phase" button to advance to the Build phase.',
        panel: { anchor: 'center-right', offsetY: 100, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }),
        waitFor: 'phase:changed:build'
    },
    {
        id: 'build-phase',
        title: '',
        text: 'You are now in the Build Phase.\n\n',
        panel: { anchor: 'center-center', offsetX: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'build-phase-explanation',
        title: '',
        text: 'You can select and build new cards from the Market into your deck.\n\n',
        panel: { anchor: 'center-center', offsetX: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.marketBounds(),
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'build-phase-select',
        title: '',
        text: 'Only the cards that you have enough Resource to build can be selected.\n\n',
        panel: { anchor: 'bottom-center', offsetX: 0, maxWidth: 320, align: 'center' },
        // Highlight all affordable cards (returns an array of rects)
        highlight: (ctx) => {
            const rects = ctx.marketAffordableBounds && ctx.marketAffordableBounds();
            if (rects && rects.length) return rects;
            return ctx.marketSlotBounds(0);
        },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    
    {
        id: 'number-cards',
        title: '',
        text: 'There are 4 of each card type available\n\n',
        panel: { anchor: 'bottom-center', offsetX: 0, maxWidth: 320, align: 'center' },
        highlight: (ctx) => {
            // Highlight the area containing all the card counts (e.g., "x4") below the market cards.
            // We'll assume ctx.marketCardCountBounds() returns a rect covering the area below all market cards where the counts are shown.
            if (ctx.marketCardCountBounds) {
                const rect = ctx.marketCardCountBounds();
                if (rect && rect.width && rect.height) return rect;
            }
            // Fallback: highlight a region just below the first market slot
            const slot = ctx.marketSlotBounds && ctx.marketSlotBounds(0);
            if (slot && slot.width && slot.height) {
                // Assume card counts are shown in a horizontal row below the market cards
                return {
                    x: slot.x,
                    y: slot.y + slot.height,
                    width: slot.width * 6, // assuming 5 market slots
                    height: 25 // reasonable height for the count area
                };
            }
            return null;
        },
        advance: 'clickAnywhere',
        waitFor: 'next'
    },
    {
        id: 'select-street-food-stall',
        mode: 'card-explainer',
        text: 'Let\'s look more closely at one of the cards.\n\nClick to select the "Street Food Stall" card.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        // Disable mouseover; enable clicks only for Street Food Stall
        allow: (ctx) => {
            if (ctx && ctx.disableMarketMouseover) ctx.disableMarketMouseover();
            return ctx.enableMarketOnly(['street-food-stall']);
        },
        highlight: (ctx) => ctx.marketSlotBounds(5),
        waitFor: 'market:selected:street-food-stall'
    },
    {
        id: 'card-explain-street-food-stall',
        mode: 'card-explainer',
        title: '',
        text: 'Each card in the Market has several key sections.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'street-food-stall-highlight-cost',
        mode: 'card-explainer',
        title: '',
        text: 'This area indicates the card cost.\n\nHere, the Street Food Stall costs 1 Resource to Build.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 280, offsetY: 5, width: 84, height: 84 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'street-food-stall-highlight-produce',
        mode: 'card-explainer',
        title: '',
        text: 'This area indicates what it produces.\n\nHere, the Street Food Stall produces 1 Resource and 1 Pressure.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 20, offsetY: 300, width: 125, height: 62 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'street-food-stall-highlight-canevolve',
        mode: 'card-explainer',
        title: '',
        text: 'Each card in the Market can be evolved exactly once.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 10, offsetY: 360, width: 355, height: 145 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },
    {
        id: 'street-food-stall-highlight-evolvecost',
        mode: 'card-explainer',
        title: '',
        text: 'This is the Resource cost to evolve the card.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 63, offsetY: 385, width: 45, height: 45 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },    
    {
        id: 'street-food-stall-highlight-evolveto',
        mode: 'card-explainer',
        title: '',
        text: 'This is the card it will evolve to.\n\nIn this case, the Street Food Stall will evolve into a Hawker Centre.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 180, offsetY: 385, width: 150, height: 40 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },    
    {
        id: 'street-food-stall-highlight-evolveproduce',
        mode: 'card-explainer',
        title: '',
        text: 'This is what the evolved card will produce.\n\nIn this case, the Hawker Centre will produce 3 Resource, 4 Points and 1 Pressure.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        media: {
            textureKey: 'street-food-stall',
            url: 'assets/images/cards/street-food-stall.png',
            fit: 'contain',
            anchor: 'center-center',
            offsetX: 24,
        },
        // Blue highlight: x=295, y=430, width=60, height=38 (from visual estimation)
        highlight: (ctx) => ctx.mediaRelativeRect({ from: 'topLeft', offsetX: 235, offsetY: 420, width: 120, height: 40 }),
        advance: 'clickAnywhere',
        allow: (ctx) => ctx.disableAll()
    },    
    {
        id: 'select-street-food-stall-build',
        mode: 'card-explainer',
        text: 'Let\'s Build the Street Food Stall.\n\nClick to select the "Street Food Stall" card.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 320, align: 'center' },
        // Disable mouseover; enable clicks only for Street Food Stall
        allow: (ctx) => {
            if (ctx && ctx.disableMarketMouseover) ctx.disableMarketMouseover();
            return ctx.enableMarketOnly(['street-food-stall']);
        },
        highlight: (ctx) => ctx.marketSlotBounds(5),
        waitFor: 'market:selected:street-food-stall'
    },
    {
        id: 'build-street-food-stall-clickbuild',
        text: 'Now click the Build Button.',
        panel: { anchor: 'top-center', offsetY: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.buttonBounds('build'),
        // Enable Build immediately; selection from previous step should persist
        allow: (ctx) => ctx.allowButtons({ build: true }),
        // No need to wait for reselection; keep this for robustness if user reselects
        //onUserSelect: (ctx) => ctx.allowButtons({ build: true }),
        waitFor: 'market:built'
    },
    {
        id: 'select-provision-shop',
        text: 'We have 1 more Resource. Let\'s Build a different card this time - The Provision Shop.\n\nClick to select the "Provision Shop" card.',
        panel: { anchor: 'center-center', offsetX: -24, maxWidth: 320, align: 'center' },
        // Disable mouseover; enable clicks only for Street Food Stall
        allow: (ctx) => {
            if (ctx && ctx.disableMarketMouseover) ctx.disableMarketMouseover();
            return ctx.enableMarketOnly(['provision-shop']);
        },
        highlight: (ctx) => ctx.marketSlotBounds(0),
        waitFor: 'market:selected:provision-shop'
    },
    {
        id: 'build-provision-shop-clickbuild',
        text: 'Now click the Build Button.',
        panel: { anchor: 'top-center', offsetY: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.buttonBounds('build'),
        // Enable Build immediately; selection from previous step should persist
        allow: (ctx) => ctx.allowButtons({ build: true }),
        // Advance to next step after building successfully
        waitFor: 'market:built'
    },
    {
        id: 'no-more-resources-end-buildphase',
        text: 'You have no more Resources to build this turn.\n\nClick the End Phase button to continue.',
        panel: { anchor: 'center-center', offsetX: -24, offsetY: -24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }).disableAllExceptMessages(),
        waitFor: 'phase:changed:evolve'
    },
    {
        id: 'card-explain-evolve',
        mode: 'card-explainer',
        title: 'Evolving Cards',
        text: 'Pay the evolve cost to upgrade a base card into a stronger one. See Rules > Evolve.',
        panel: { anchor: 'bottom-center', offsetY: -20, maxWidth: 320, align: 'center' },
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
        panel: { anchor: 'center-left', offsetX: 24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.firstEvolvableBounds(),
        allow: (ctx) => ctx.enableEvolveOnly().allowButtons({ evolve: false }),
        onUserSelect: (ctx) => ctx.allowButtons({ evolve: true }),
        waitFor: 'evolve:done'
    },
    {
        id: 'end-turn',
        title: 'End of Turn',
        text: 'End Phase adds a Pressure card and reshuffles discard into deck. See Rules > End of Turn.',
        panel: { anchor: 'bottom-right', offsetX: -24, offsetY: -24, maxWidth: 320, align: 'center' },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }).disableAllExceptMessages(),
        waitFor: 'endTurn:processed'
    },
    {
        id: 'finish',
        title: 'You\'re Ready! ',
        text: 'Core loop: Play → Build → Evolve → End Turn. See Rules for details.',
        panel: { anchor: 'center', maxWidth: 320, align: 'center' },
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
        const tutorialScene = this.scene;
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
            marketAffordableCardIndexes: () => marketScene && marketScene.getAffordableSlotIndexes ? marketScene.getAffordableSlotIndexes() : [],
            marketAffordableBounds: () => marketScene && marketScene.getAffordableSlotBounds ? marketScene.getAffordableSlotBounds() : [],
            disableMarketMouseover: () => { if (marketScene && marketScene.disableMouseover) marketScene.disableMouseover(); return this._ctx(); },
            enableMarketMouseover: () => { if (marketScene && marketScene.enableMouseover) marketScene.enableMouseover(); return this._ctx(); },
            buttonBounds: (k) => messagesScene && messagesScene.getButtonBounds ? messagesScene.getButtonBounds(k) : null,
            firstEvolvableBounds: () => playedScene && playedScene.getFirstEvolvableBounds ? playedScene.getFirstEvolvableBounds() : null,
            playCardBounds: (name) => playedScene && playedScene.getPlayedCardBoundsByName ? playedScene.getPlayedCardBoundsByName(name) : null,
            playCardStatBounds: (name, stat) => playedScene && playedScene.getPlayedCardStatBounds ? playedScene.getPlayedCardStatBounds(name, stat) : null,
            hudResourcePressureBounds: () => {
                // Approximate HUD group by taking HUD scene bounds top area
                const cfg = hudScene && hudScene.config && hudScene.config.bounds;
                if (!cfg) return null;
                return { x: cfg.x + 10, y: cfg.y + 10, width: 600, height: 80 };
            },
            // Provide accessors for media info and helper to compute rect relative to media
            mediaInfo: () => tutorialScene && typeof tutorialScene.getMediaInfo === 'function' ? tutorialScene.getMediaInfo() : null,
            mediaRelativeRect: (opts) => {
                const info = tutorialScene && typeof tutorialScene.getMediaInfo === 'function' ? tutorialScene.getMediaInfo() : null;
                if (!info) return null;
                const from = (opts && opts.from) || 'topLeft'; // 'topLeft' or 'center'
                const base = from === 'center' ? info.center : info.topLeft;
                const x = base.x + ((opts && opts.offsetX) || 0);
                const y = base.y + ((opts && opts.offsetY) || 0);
                const width = (opts && opts.width) || 0;
                const height = (opts && opts.height) || 0;
                return { x, y, width, height };
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


