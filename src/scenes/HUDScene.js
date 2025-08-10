import { BaseScene } from './BaseScene';
import { SCENE_STYLES } from '../config/SceneConfig';

export class HUDScene extends BaseScene {
    constructor(phaseManager) {
        super('HUDScene');
        this.phaseManager = phaseManager;
    }

    createScene() {
        this.ensureHudInitialized();
    }

    ensureHudInitialized() {
        if (this.resourceText) return; // already initialized

        // Create HUD elements with initial values
        const padding = 20;
        const topMargin = 20;

        // Resource counter (left side)
        this.resourceText = this.add.text(padding, topMargin, 'Resource: 0', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        // Pressure counter (center-left)
        const pressureX = this.resourceText.x + this.resourceText.width + 50;
        this.pressureLabel = this.add.text(pressureX, topMargin, 'Pressure: ', {
            fontSize: '16px',
            fill: '#ffffff'
        });
        
        this.pressureValue = this.add.text(
            this.pressureLabel.x + this.pressureLabel.width, 
            topMargin, 
            '0', 
            {
                fontSize: '20px',
                fill: '#ffffff'
            }
        );

        this.pressureMax = this.add.text(
            this.pressureValue.x + this.pressureValue.width,
            topMargin,
            '/5',
            {
                fontSize: '20px',
                fill: '#ffffff'
            }
        );

        // Building Points (center-right)
        const pointsX = this.pressureMax.x + 50;
        this.pointsText = this.add.text(pointsX, topMargin, 'Building Points: 0', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        // Turn counter (right side)
        const turnX = this.pointsText.x + 300;
        this.turnText = this.add.text(turnX, topMargin, 'Turn: 1/12', {
            fontSize: '16px',
            fill: '#ffffff'
        });

        // Container for evolution animations
        this.evolutionContainer = this.add.container(0, 0);
    }

    updateDisplay(resource, pressure, points, turn, resourceChange, pressureChange) {
        // If scene hasn't created its HUD elements yet, defer gracefully
        if (!this.resourceText) {
            this.ensureHudInitialized();
            if (!this.resourceText) return; // still not ready, bail
        }
        // Update resource display with animation if there's a change
        if (resource !== undefined) {
            this.resourceText.setText(`Resource: ${resource}`);
            if (resourceChange) {
                this.showResourceChange(resourceChange);
            }
        }

        // Update pressure display with animation if there's a change
        if (pressure !== undefined) {
            this.pressureValue.setText(pressure.toString());
            
            // Visual feedback for high pressure - only color the number
            if (pressure >= 4) {
                this.pressureValue.setFill('#ff0000');
            } else if (pressure >= 3) {
                this.pressureValue.setFill('#ff9900');
            } else {
                this.pressureValue.setFill('#ffffff');
            }

            // Ensure label and max stay white
            this.pressureLabel.setFill('#ffffff');
            this.pressureMax.setFill('#ffffff');

            // Update position of /5 to follow the number
            this.pressureMax.x = this.pressureValue.x + this.pressureValue.width;

            if (pressureChange) {
                this.showPressureChange(pressureChange);
            }
        }

        // Update points display
        if (points !== undefined) {
            this.pointsText.setText(`Building Points: ${points}`);
        }

        // Update turn display
        if (turn !== undefined) {
            this.turnText.setText(`Turn: ${turn}/12`);
        }
    }

    showResourceChange(change, source = 'normal') {
        let x = this.resourceText.x + this.resourceText.width + 10;
        let y = this.resourceText.y;
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
        let x = this.pressureMax.x + this.pressureMax.width + 10;
        let y = this.pressureMax.y;
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
        if (resource !== undefined) {
            this.resourceText.setText(`Resource: ${resource}`);
            if (resourceChange) {
                this.showResourceChange(resourceChange, source);
            }
        }
    }

    updatePressure(pressure, pressureChange, source) {
        if (pressure !== undefined) {
            this.pressureValue.setText(pressure.toString());
            
            // Visual feedback for high pressure - only color the number
            if (pressure >= 4) {
                this.pressureValue.setFill('#ff0000');
            } else if (pressure >= 3) {
                this.pressureValue.setFill('#ff9900');
            } else {
                this.pressureValue.setFill('#ffffff');
            }

            // Ensure label and max stay white
            this.pressureLabel.setFill('#ffffff');
            this.pressureMax.setFill('#ffffff');

            // Update position of /5 to follow the number
            this.pressureMax.x = this.pressureValue.x + this.pressureValue.width;

            if (pressureChange) {
                this.showPressureChange(pressureChange, source);
            }
        }
    }

    updatePoints(points, pointsChange) {
        if (points !== undefined) {
            this.pointsText.setText(`Building Points: ${points}`);
            if (pointsChange) {
                const changeText = this.add.text(
                    this.pointsText.x + this.pointsText.width + 10,
                    this.pointsText.y,
                    `+${pointsChange} ⭐`,
                    {
                        fontSize: '20px',
                        fill: '#ffff00'
                    }
                );
                
                this.tweens.add({
                    targets: changeText,
                    y: changeText.y - 30,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => changeText.destroy()
                });
            }
        }
    }

    updateTurn(turn) {
        if (turn !== undefined) {
            this.turnText.setText(`Turn: ${turn}/12`);
        }
    }
}