import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';

export class HUDScene extends BaseScene {
    constructor(phaseManager) {
        super('HUDScene');
        this.phaseManager = phaseManager;
    }

    preload() {
        // Load small HUD icons with unique keys to avoid conflicts with card textures
        if (!this.textures.exists('icon-resource')) {
            this.load.image('icon-resource', 'assets/icons/resource.png');
        }
        if (!this.textures.exists('icon-pressure')) {
            this.load.image('icon-pressure', 'assets/icons/pressure.png');
        }
        if (!this.textures.exists('icon-points')) {
            this.load.image('icon-points', 'assets/icons/points.png');
        }
    }

    createScene() {
        this.ensureHudInitialized();
    }

    ensureHudInitialized() {
        if (this._hudReady) return; // already initialized

        // Create HUD elements with initial values
        const padding = 20;
        const topMargin = 20;
        const iconSize = 18;
        const gap = 8;        // gap between icon and its text
        const groupGap = 40;  // gap between groups
        this._hudLayout = { padding, topMargin, iconSize, gap, groupGap };

        // Two-row HUD groups
        this.turnLabel = this.add.text(0, topMargin, 'Turn', { fontSize: '16px', fill: '#ffffff' });
        this.turnValue = this.add.text(0, topMargin + 24, '1/12', { fontSize: '20px', fill: '#ffffff' });

        // Resource group
        this.resourceIcon = this.add.image(padding, topMargin, 'icon-resource')
            .setOrigin(0, 0)
            .setDisplaySize(iconSize, iconSize);
        this.resourceLabel = this.add.text(0, topMargin, 'Resource', { fontSize: '16px', fill: '#ffffff' });
        this.resourceValue = this.add.text(0, topMargin + 24, '0', { fontSize: '20px', fill: '#ffffff' });

        // Pressure group
        this.pressureIcon = this.add.image(0, topMargin, 'icon-pressure')
            .setOrigin(0, 0)
            .setDisplaySize(iconSize, iconSize);
        this.pressureLabel = this.add.text(0, topMargin, 'Pressure', { fontSize: '16px', fill: '#ffffff' });
        this.pressureValue = this.add.text(0, topMargin + 24, '0/5', { fontSize: '20px', fill: '#ffffff' });

        // Points group
        this.pointsIcon = this.add.image(0, topMargin, 'icon-points')
            .setOrigin(0, 0)
            .setDisplaySize(iconSize, iconSize);
        this.pointsLabel = this.add.text(0, topMargin, 'Building Points', { fontSize: '16px', fill: '#ffffff' });
        this.pointsValue = this.add.text(0, topMargin + 24, '0', { fontSize: '20px', fill: '#ffffff' });

        // Container for evolution animations
        this.evolutionContainer = this.add.container(0, 0);

        // Initial layout
        this.layoutHudRow();
        this._hudReady = true;
    }

    updateDisplay(resource, pressure, points, turn, resourceChange, pressureChange) {
        // Ensure HUD is initialized; if not yet, try to initialize lazily
        if (!this._hudReady) {
            this.ensureHudInitialized();
            if (!this._hudReady) return;
        }
        // Update resource display with animation if there's a change
        if (resource !== undefined) {
            this.resourceValue.setText(`${resource}`);
            if (resourceChange) {
                this.showResourceChange(resourceChange);
            }
        }

        // Update pressure display with animation if there's a change
        if (pressure !== undefined) {
            this.pressureValue.setText(`${pressure}/5`);
            
            // Visual feedback for high pressure - only color the number
            if (pressure >= 4) {
                this.pressureValue.setFill('#ff0000');
            } else if (pressure >= 3) {
                this.pressureValue.setFill('#ff9900');
            } else {
                this.pressureValue.setFill('#ffffff');
            }

            // Ensure label stays white
            this.pressureLabel.setFill('#ffffff');

            if (pressureChange) {
                this.showPressureChange(pressureChange);
            }
        }

        // Update points display
        if (points !== undefined) {
            this.pointsValue.setText(`${points}`);
        }

        // Update turn display
        if (turn !== undefined) {
            this.turnValue.setText(`${turn}/12`);
        }

        // Reflow positions to keep spacing consistent when text widths change
        this.layoutHudRow();
    }

    layoutHudRow() {
        const { padding, topMargin, iconSize, gap, groupGap } = this._hudLayout;
        // Start with Turn on the left
        let cursorX = padding;
        this.turnLabel.setPosition(cursorX, topMargin);
        this.turnValue.y = topMargin + 24;
        this.turnValue.x = this.turnLabel.x + (this.turnLabel.width / 2) - (this.turnValue.width / 2);
        cursorX = this.turnLabel.x + this.turnLabel.width + groupGap;

        // Resource group
        this.resourceIcon.setPosition(cursorX, topMargin);
        this.resourceLabel.x = this.resourceIcon.x + iconSize + gap;
        this.resourceLabel.y = topMargin;
        {
            const groupStart = this.resourceIcon.x;
            const groupWidth = (this.resourceLabel.x + this.resourceLabel.width) - groupStart;
            this.resourceValue.y = topMargin + 24;
            this.resourceValue.x = groupStart + (groupWidth / 2) - (this.resourceValue.width / 2);
        }

        // Pressure group starts after resource
        cursorX = this.resourceLabel.x + this.resourceLabel.width + groupGap;
        this.pressureIcon.setPosition(cursorX, topMargin);
        this.pressureLabel.x = this.pressureIcon.x + iconSize + gap;
        this.pressureLabel.y = topMargin;
        {
            const groupStart = this.pressureIcon.x;
            const groupWidth = (this.pressureLabel.x + this.pressureLabel.width) - groupStart;
            this.pressureValue.y = topMargin + 24;
            this.pressureValue.x = groupStart + (groupWidth / 2) - (this.pressureValue.width / 2);
        }

        // Points group starts after pressure max
        cursorX = this.pressureLabel.x + this.pressureLabel.width + groupGap;
        this.pointsIcon.setPosition(cursorX, topMargin);
        this.pointsLabel.x = this.pointsIcon.x + iconSize + gap;
        this.pointsLabel.y = topMargin;
        {
            const groupStart = this.pointsIcon.x;
            const groupWidth = (this.pointsLabel.x + this.pointsLabel.width) - groupStart;
            this.pointsValue.y = topMargin + 24;
            this.pointsValue.x = groupStart + (groupWidth / 2) - (this.pointsValue.width / 2);
        }
    }

    showResourceChange(change, source = 'normal') {
        let x = this.resourceValue.x + this.resourceValue.width + 10;
        let y = this.resourceValue.y;
        let color = change > 0 ? '#00ff00' : '#ff0000';
        let text = change > 0 ? `+${change}` : change.toString();

        // Add source indicator for evolution
        if (source === 'evolution') {
            text += ' ⬆️';  // Up arrow for evolution
        } else if (source === 'evolution_cost') {
            text += ' 💰';  // Money bag for evolution cost
        }

        const changeText = this.add.text(x, y, text, {
            fontSize: '20px',
            fill: color
        });
        
        this.tweens.add({
            targets: changeText,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => changeText.destroy()
        });
    }

    showPressureChange(change, source = 'normal') {
        let x = this.pressureValue.x + this.pressureValue.width + 10;
        let y = this.pressureValue.y;
        let color = change > 0 ? '#ff0000' : '#00ff00';
        let text = change > 0 ? `+${change}` : change.toString();

        // Add source indicator for evolution
        if (source === 'evolution') {
            text += ' ⬆️';  // Up arrow for evolution
        }

        const changeText = this.add.text(x, y, text, {
            fontSize: '20px',
            fill: color
        });
        
        this.tweens.add({
            targets: changeText,
            y: y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => changeText.destroy()
        });
    }

    showEvolutionAnimation(oldCard, evolvedCard, x, y) {
        // Clear previous evolution animations
        this.evolutionContainer.removeAll(true);

        // Create the evolution animation sequence
        const sequence = this.add.container(x, y);
        this.evolutionContainer.add(sequence);

        // Show old card fading out
        const oldCardSprite = this.add.image(0, 0, oldCard.imageAsset)
            .setScale(0.4);
        
        // Show evolved card fading in
        const evolvedCardSprite = this.add.image(0, 0, evolvedCard.imageAsset)
            .setScale(0.4)
            .setAlpha(0);

        sequence.add([oldCardSprite, evolvedCardSprite]);

        // Create the animation sequence
        this.tweens.timeline({
            tweens: [
                {
                    targets: oldCardSprite,
                    alpha: 0,
                    scaleX: 0.2,
                    scaleY: 0.2,
                    duration: 500
                },
                {
                    targets: evolvedCardSprite,
                    alpha: 1,
                    scaleX: 0.4,
                    scaleY: 0.4,
                    duration: 500,
                    offset: 400
                }
            ],
            onComplete: () => {
                // Show stat changes
                this.showStatChanges(evolvedCard.statChanges, x, y);
                // Clean up after animation
                setTimeout(() => sequence.destroy(), 2000);
            }
        });
    }

    showStatChanges(changes, x, y) {
        if (changes.resource !== 0) {
            this.showResourceChange(changes.resource, 'evolution');
        }
        if (changes.pressure !== 0) {
            this.showPressureChange(changes.pressure, 'evolution');
        }
        if (changes.points !== 0) {
            const pointsChange = this.add.text(x, y + 50, 
                `+${changes.points} Points ⭐`, {
                    fontSize: '16px',
                    fill: '#ffff00'
                }
            );
            this.tweens.add({
                targets: pointsChange,
                y: y + 20,
                alpha: 0,
                duration: 1500,
                onComplete: () => pointsChange.destroy()
            });
        }
    }

    // Convenience methods for individual updates
    updateResource(resource, resourceChange, source) {
        if (resource === undefined || !this._hudReady) return;
        this.resourceValue.setText(`${resource}`);
        if (resourceChange) {
            this.showResourceChange(resourceChange, source);
        }
        this.layoutHudRow();
    }

    updatePressure(pressure, pressureChange, source) {
        if (pressure === undefined) return;
        if (!this._hudReady) {
            this.ensureHudInitialized();
            if (!this._hudReady) return;
        }
        this.pressureValue.setText(`${pressure}/5`);
        if (pressure >= 4) {
            this.pressureValue.setFill('#ff0000');
        } else if (pressure >= 3) {
            this.pressureValue.setFill('#ff9900');
        } else {
            this.pressureValue.setFill('#ffffff');
        }
        if (pressureChange) {
            this.showPressureChange(pressureChange, source);
        }
        this.layoutHudRow();
    }

    updatePoints(points, pointsChange) {
        if (points === undefined) return;
        if (!this._hudReady) {
            this.ensureHudInitialized();
            if (!this._hudReady) return;
        }
        this.pointsValue.setText(`${points}`);
        if (pointsChange) {
            const changeText = this.add.text(
                this.pointsValue.x + this.pointsValue.width + 10,
                this.pointsValue.y,
                `+${pointsChange} ⭐`,
                { fontSize: '20px', fill: '#ffff00' }
            );
            this.tweens.add({ targets: changeText, y: changeText.y - 30, alpha: 0, duration: 1000, onComplete: () => changeText.destroy() });
        }
        this.layoutHudRow();
    }

    updateTurn(turn) {
        if (turn === undefined) return;
        if (!this._hudReady) {
            this.ensureHudInitialized();
            if (!this._hudReady) return;
        }
        this.turnValue.setText(`${turn}/12`);
        this.layoutHudRow();
    }
}