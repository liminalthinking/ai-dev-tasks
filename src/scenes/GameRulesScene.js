export class GameRulesScene extends Phaser.Scene {
	constructor(gameInstance) {
		super({ key: 'GameRulesScene' });
		this.gameInstance = gameInstance;
		this.currentPage = 1;
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
        this.titleText = this.add.text(width / 2, 60, 'Game Rules', {
            fontSize: '40px',
            color: '#000000',
            fontFamily: 'Alegreya, serif'
        }).setOrigin(0.5);

		// Page content containers
		this.page1Content = this.add.container(0, 0);
		this.page2Content = this.add.container(0, 0);
		this.page2Content.setVisible(false);

		// Page 1 content (ends after step 1)
		const page1Text = [
			'Welcome to the Lion City...before it was the Lion City.',
			'SG60: Building the Lion City is a single player push your luck style deck building card game set in 1965 when Singapore first gained independence.',
			'Architect the transformation of swamps and kampungs into a gleaming metropolis. From humble hawker stalls to gleaming skyscrapers, your choices shape the skyline. But beware—the pressure of progress is real, and only the wisest builders endure.',
			'Objective: Survive 12 turns of city building while maximize Building POINTS while not busting from PRESSURE. The game ends immediately when PRESSURE reaches 5 or more.',
			'The game is played out over 12 turns in the following sequence',
			
		].join('\n\n');

		this.page1Text = this.add.text(width * 0.2, 140, page1Text, {
			fontSize: '24px',
			color: '#000000',
			wordWrap: { width: width * 0.6 },
			fontFamily: 'Alegreya, serif'
		});
		this.page1Content.add(this.page1Text);

		// Page 2 content (remaining steps)
		const page2Text = [
			'🎴 1. Play Cards: Draw cards from your deck to Gain Resources',
			//'Step into the planning office. Each card drawn represents a new opportunity that may also come with the mounting PRESSURE of city building.'
			'🏗️ 2. Build: Spend RESOURCE gained from the cards you played to build new cards from the Market Area to add to your city (deck). New buildings go into your discard pile to be reshuffled into your deck at the end of turn.',
			//'Remember: Every build is a step toward a thriving metropolis—but do not forget your roots.',
			'🔧 3. Evolve: Evolve eligible building cards using the RESOURCE you gained from playing cards this turn',
			//'Evolve kampongs into HDB Blocks. Upgrade street food stalls into iconic hawker centres. Evolve your city with pride, manage growth with care, new establishments can come with new tension (PRESSURE)...',
			'⏳ At the end of each turn, all cards in your deck, play area and discard pile are shuffled back into your deck',
			'🏁 If you survive 12 turns, your city becomes a beacon of harmony and progress. Celebrate with fireworks over the Esplanade and cheers from the void decks!'
		].join('\n\n');

		this.page2Text = this.add.text(width * 0.2, 140, page2Text, {
			fontSize: '24px',
			color: '#000000',
			wordWrap: { width: width * 0.6 },
			fontFamily: 'Alegreya, serif'
		});
		this.page2Content.add(this.page2Text);

		// Navigation buttons
		this.createNavigationButtons(width, height);
	}

	createNavigationButtons(width, height) {
		// Next button (page 1 only)
		this.nextButton = this.add.text(width / 2 + 100, height - 80, 'Next →', {
			fontSize: '20px',
			color: '#ffffff',
			backgroundColor: '#444444',
			padding: { x: 18, y: 10 },
			fontFamily: 'Alegreya, serif'
		})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true })
			.on('pointerover', () => this.nextButton.setBackgroundColor('#666666'))
			.on('pointerout', () => this.nextButton.setBackgroundColor('#444444'))
			.on('pointerdown', () => {
				this.showPage(2);
			});

		// Previous button (page 2 only) - positioned at same location as Next button
		this.prevButton = this.add.text(width / 2 + 100, height - 80, '← Previous', {
			fontSize: '20px',
			color: '#ffffff',
			backgroundColor: '#444444',
			padding: { x: 18, y: 10 },
			fontFamily: 'Alegreya, serif'
		})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true })
			.on('pointerover', () => this.prevButton.setBackgroundColor('#666666'))
			.on('pointerout', () => this.prevButton.setBackgroundColor('#444444'))
			.on('pointerdown', () => {
				this.showPage(1);
			})
			.setVisible(false);

		// Back button (page 2 only) - positioned on the left
		this.backButton = this.add.text(width / 2 - 130, height - 80, 'Back to Menu', {
			fontSize: '20px',
			color: '#ffffff',
			backgroundColor: '#444444',
			padding: { x: 18, y: 10 },
			fontFamily: 'Alegreya, serif'
		})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true })
			.on('pointerover', () => this.backButton.setBackgroundColor('#666666'))
			.on('pointerout', () => this.backButton.setBackgroundColor('#444444'))
			.on('pointerdown', () => {
				this.scene.start('IntroScene');
			})
			.setVisible(false);
	}

	showPage(pageNumber) {
		this.currentPage = pageNumber;
		
		if (pageNumber === 1) {
			this.page1Content.setVisible(true);
			this.page2Content.setVisible(false);
			this.nextButton.setVisible(true);
			this.prevButton.setVisible(false);
			this.backButton.setVisible(false);
		} else {
			this.page1Content.setVisible(false);
			this.page2Content.setVisible(true);
			this.nextButton.setVisible(false);
			this.prevButton.setVisible(true);
			this.backButton.setVisible(true);
		}
	}
}


