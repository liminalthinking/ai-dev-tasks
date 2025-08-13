export class IntroScene extends Phaser.Scene {
	constructor(gameInstance) {
		super({ key: 'IntroScene' });
		this.gameInstance = gameInstance;
	}

	preload() {
		// Load intro background if not already loaded
		if (!this.textures.exists('intro-bg')) {
			this.load.image('intro-bg', 'assets/images/intro-scene.png');
		}
	}

	create() {
		const { width, height } = this.cameras.main;

		// Background image scaled to cover
		let bg;
		if (this.textures.exists('intro-bg')) {
			bg = this.add.image(0, 0, 'intro-bg').setOrigin(0, 0);
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

		// Semi-transparent overlay to improve text readability
		this.add.rectangle(0, 0, width, height, 0x000000, 0.35).setOrigin(0, 0);

		// Title
		/*
		this.add.text(width / 2, height * 0.25, 'SG60', {
			fontSize: '72px',
			fontStyle: 'bold',
			color: '#ff3333'
		}).setOrigin(0.5);
		this.add.text(width / 2, height * 0.25 + 70, 'Building the City', {
			fontSize: '40px',
			color: '#dddddd'
		}).setOrigin(0.5).setAlpha(0.9);
		*/

		// Buttons
		const createButton = (label, y, onClick) => {
			const btn = this.add.text(width / 2, y, label, {
				fontSize: '28px',
				color: '#ffffff',
				backgroundColor: '#444444',
				padding: { x: 18, y: 10 }
			})
				.setOrigin(0.5)
				.setInteractive({ useHandCursor: true })
				.on('pointerover', () => btn.setBackgroundColor('#666666'))
				.on('pointerout', () => btn.setBackgroundColor('#444444'))
				.on('pointerdown', () => onClick());
			return btn;
		};

		createButton('Start Game', height * 0.62, () => {
			// Immediately stop this scene to avoid re-triggers/flicker
			try { this.scene.stop('IntroScene'); } catch (_) {}
			if (this.game && typeof this.game.startCoreScenes === 'function') {
				this.game.startCoreScenes();
			}
		});

		createButton('Game Rules', height * 0.72, () => {
			this.scene.start('GameRulesScene');
		});
	}
}


