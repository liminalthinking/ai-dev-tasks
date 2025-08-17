import { EventBus } from './EventBus';
import { IntroScene } from '../scenes/IntroScene';

// Minimal step schema scaffold
const DEFAULT_STEPS = [
    {
        id: 'welcome',
        title: 'Welcome to SG60',
        text: 'We’ll play a short guided run. See Rules > Overview for the full loop.',
        panel: { anchor: 'top-center', offsetY: 24, maxWidth: 520, align: 'center' },
        highlight: null,
        allow: () => {},
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
        allow: () => {}
    },
    {
        id: 'finish',
        title: 'You’re Ready!',
        text: 'Core loop: Play → Build → Evolve → End Turn. See Rules for details.',
        panel: { anchor: 'center', maxWidth: 520, align: 'center' },
        highlight: null,
        allow: () => {},
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
        // Apply allow (gating placeholder for now)
        try { typeof step.allow === 'function' && step.allow(); } catch (_) {}
        // Render
        this.scene.renderStep(step);
        // Bind event waits (scaffold)
        this._unbindEvents();
        if (step.waitFor && typeof step.waitFor === 'string' && step.waitFor !== 'next') {
            this._handler = () => this.next();
            this._lastEvent = step.waitFor;
            this.eventBus.once(step.waitFor, this._handler);
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
        this._handler = null;
        this._lastEvent = null;
    }

    exitToIntro() {
        if (this.game && typeof this.game.returnToIntro === 'function') {
            this.game.returnToIntro();
        }
    }
}


