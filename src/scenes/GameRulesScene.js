export class GameRulesScene extends Phaser.Scene {
	constructor(gameInstance) {
		super({ key: 'GameRulesScene' });
		this.gameInstance = gameInstance;
	}

	preload() {
		// Load rules background if not already loaded
		if (!this.textures.exists('rules-bg')) {
			this.load.image('rules-bg', 'assets/images/game-rules-scene.png');
		}
	}

	create() {
		const { width, height } = this.cameras.main;

		// Background image scaled to cover
		let bg;
		if (this.textures.exists('rules-bg')) {
			bg = this.add.image(0, 0, 'rules-bg').setOrigin(0, 0);
			const scaleX = width / bg.width;
			const scaleY = height / bg.height;
			const scale = Math.max(scaleX, scaleY);
			bg.setScale(scale);
			// Center if larger than viewport
			if (bg.displayWidth > width) {
				bg.x = (width - bg.displayWidth) / 2;
			}
			if (bg.displayHeight > height) {
				bg.y = (height - bg.displayHeight) / 2;
			}
		}

		// Subtle overlay to improve readability
		this.add.rectangle(0, 0, width, height, 0x000000, 0.4).setOrigin(0, 0);

		// Title
		this.add.text(width / 2, 60, 'Game Rules', {
			fontSize: '40px',
			color: '#ffffff'
		}).setOrigin(0.5);

		// Basic rules text (can be expanded later)
		const bodyText = [
			'Play Cards: Draw cards to gain Resources and Pressure.',
			'Build: Spend Resources to buy new cards from the Market.',
			'Evolve: Upgrade eligible cards you played this turn.',
			'End Turn: Pressure ≥ 5 results in an immediate Game Over.',
			'Complete 12 turns to win.'
		].join('\n\n');

		this.add.text(width * 0.1, 120, bodyText, {
			fontSize: '20px',
			color: '#dddddd',
			wordWrap: { width: width * 0.8 }
		});

		// Back button
		const backBtn = this.add.text(width / 2, height - 80, 'Back', {
			fontSize: '26px',
			color: '#ffffff',
			backgroundColor: '#444444',
			padding: { x: 18, y: 10 }
		})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true })
			.on('pointerover', () => backBtn.setBackgroundColor('#666666'))
			.on('pointerout', () => backBtn.setBackgroundColor('#444444'))
			.on('pointerdown', () => {
				this.scene.start('IntroScene');
			});
	}
}


