# Implementation Tasks: Singapore City Builder Game

## Relevant Files

- `src/index.html` - Main entry point for the Phaser game
- `src/game.js` - Main game configuration and scene management
- `src/scenes/BackgroundScene.js` - Static background layer
- `src/scenes/HUDScene.js` - Displays game state (Resource, Pressure, Points)
- `src/scenes/MessagesScene.js` - Phase messages and action buttons
- `src/scenes/DeckScene.js` - Player's deck management
- `src/scenes/PlayedCardsScene.js` - Current turn's played cards
- `src/scenes/MarketScene.js` - Available cards for purchase
- `src/scenes/DiscardPileScene.js` - Discard pile management
- `src/data/CardProperties.js` - Card data management system
- `src/managers/GameStateManager.js` - Game state and phase management
- `src/utils/AssetLoader.js` - Asset preloading and error handling

### Notes

- All scene files should extend Phaser.Scene
- Use ES6 modules for better code organization
- Follow Phaser 3's scene management patterns
- Implement proper error handling for asset loading

## Tasks

- [x] 1.0 Project Setup and Infrastructure
  - [x] 1.1 Initialize new Phaser 3 project with necessary dependencies
  - [x] 1.2 Set up build system (webpack/vite) with development server
  - [x] 1.3 Create asset directory structure (/assets/images/cards/, /assets/icons/)
  - [x] 1.4 Implement AssetLoader utility with error handling and retry mechanism
  - [x] 1.5 Create basic game configuration in game.js
  - [x] 1.6 Set up scene management system

- [x] 2.0 Scene Implementation
  - [x] 2.1 Create BackgroundScene with static background
  - [x] 2.2 Implement HUDScene with:
    - Resource counter (initialized at 0, simple number update)
    - Pressure display (0/5, simple number update)
    - Building points tracker
    - Turn counter (1/12)
  - [x] 2.3 Create MessagesScene with:
    - Phase display area with exact messages:
      - Play Cards: "Click the top of deck to play the next card. Click the End Phase button to move to the next phase"
      - Build: "Buy cards from the MARKET with available resources. Click the End Phase button to move to the next phase"
      - Evolve: "Evolve cards from the Played Cards area, Click the End Phase button to end this turn"
      - "End of Turn"
      - Game end success: "Game Ends! You have helped Singapore survive through 12 years of development without its pressure exceeding the maximum!"
    - End Phase button
    - Build/Evolve buttons (initially disabled)
  - [x] 2.4 Implement DeckScene with:
    - Card back display
    - Click handling for card drawing
  - [x] 2.5 Create PlayedCardsScene for displaying active cards
  - [x] 2.6 Implement MarketScene with:
    - 6 fixed card slots
    - Card count tracking (4 per type)
    - Click handling for purchases
  - [x] 2.7 Create DiscardPileScene for evolved and discarded cards

- [x] 3.0 Card System Implementation
  - [x] 3.1 Create CardProperties data structure in CardProperties.js
  - [x] 3.2 Implement Starting Cards:
    - Kampung (2x)
    - Swamp (1x)
    - Evolution paths
  - [x] 3.3 Implement Market Cards:
    - All 6 base card types
    - Evolution paths
    - Supply management (4 per type)
  - [x] 3.4 Create Pressure card type
  - [x] 3.5 Implement card interaction system:
    - Card selection
    - Resource cost validation
    - Evolution validation

- [ ] 4.0 Game Phase Logic
  - [x] 4.1 Implement Play Cards Phase:
    - Card drawing mechanics
    - Resource/Pressure calculation
    - Bust condition check (pressure >= 5)
  - [x] 4.2 Create Build Phase:
    - Market card purchase system
    - Resource cost validation
    - Market slot replenishment
  - [x] 4.3 Implement Evolve Phase:
    - Card selection system
    - Evolution cost validation
    - Card transformation and evolution paths
  - [x] 4.4 Create End Turn Phase:
    - Pressure card addition
    - Deck shuffling
    - State reset

- [ ] 5.0 State Management
  - [x] 5.1 Implement GameStateManager:
    - [x] Turn tracking and validation
    - [x] Phase transition rules and validation
    - [x] Resource/Pressure management and limits
    - [x] State persistence between phases
  - [x] 5.2 Create game end conditions:
    - [x] Turn 12 completion
    - [x] Pressure bust condition
  - [x] 5.3 Implement scoring system:
    - [x] Building points calculation
    - [x] Final score display
  - [ ] 5.4 Create game reset functionality:
    - Play Again button
    - State reset
    - Card redistribution
  - [ ] 5.5 Implement button state management:
    - Phase-based enabling/disabling
    - Resource-based graying out

- [ ] 5.6 Asset loading and restart lifecycle hardening
  - [ ] Centralize `card-back` texture loading to a single scene (prefer `BackgroundScene`) and remove all other loaders
  - [ ] Ensure dependent scenes render placeholders without enqueueing duplicate loads (post-create texture swap)
  - [ ] Remove all duplicate-key warnings in console on first boot and after restart
  - [ ] Start scenes only after `BackgroundScene` finishes preload/create; add fallback timer to guarantee startup
  - [ ] After restart, re-sync HUD/Messages to Turn 1 with zero counts and re-enable `DeckScene` interactivity automatically

- [ ] 6.0 UI/UX Review and Enhancement
  - [ ] 6.1 Review and improve market card affordability indicators:
    - Current implementation uses basic color coding (green/red)
    - Consider alternatives to color-based feedback
    - Improve accessibility for color-blind users
    - Design more subtle visual treatment
  - [ ] 6.2 Review card interaction feedback:
    - Evaluate current hover/click effects
    - Consider alternative interaction patterns
    - Improve visual hierarchy
  - [ ] 6.3 Animation and transition review:
    - Assess current resource/pressure change animations
    - Review card movement animations
    - Consider adding phase transition effects