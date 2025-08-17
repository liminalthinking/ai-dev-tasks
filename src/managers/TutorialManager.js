import { EventBus } from './EventBus';
import { IntroScene } from '../scenes/IntroScene';

// Full tutorial step schema (suggested defaults)
const DEFAULT_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to SG60',
        text: 'We’ll play a short guided run. See Rules > Overview for the full loop.',
        panel: { anchor: 'top-center', offsetY: 24, maxWidth: 520, align: 'center' },
        highlight: null,
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'play-cards',
        title: 'Play Cards Phase',
        text: 'Click the deck to draw. You gain Resource and may gain Pressure (bust at 5). See Rules > Play Cards.',
        panel: { anchor: 'center-right', offsetX: -24, maxWidth: 420 },
        highlight: (ctx) => ctx.deckBounds(),
        allow: (ctx) => ctx.enableDeckOnly(),
        waitFor: 'card:drawn'
    },
    {
        id: 'hud-stats',
        title: 'HUD Updates',
        text: 'Resource increases from played cards; Pressure rises too. Track both here. See Rules > HUD.',
        panel: { anchor: 'top-left', offsetX: 24, offsetY: 24, maxWidth: 420 },
        highlight: (ctx) => ctx.hudResourcePressureBounds(),
        allow: (ctx) => ctx.disableAll(),
        waitFor: 'next'
    },
    {
        id: 'advance-to-build',
        title: 'Advance to Build',
        text: 'Advance when done drawing via End Phase. See Rules > Phase Flow.',
        panel: { anchor: 'bottom-center', offsetY: -24, maxWidth: 420 },
        highlight: (ctx) => ctx.buttonBounds('endPhase'),
        allow: (ctx) => ctx.allowButtons({ endPhase: true }),
        waitFor: 'phase:changed:build'
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
            marketSlotBounds: (i) => marketScene && marketScene.getSlotBounds ? marketScene.getSlotBounds(i) : null,
            buttonBounds: (k) => messagesScene && messagesScene.getButtonBounds ? messagesScene.getButtonBounds(k) : null,
            firstEvolvableBounds: () => playedScene && playedScene.getFirstEvolvableBounds ? playedScene.getFirstEvolvableBounds() : null,
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


