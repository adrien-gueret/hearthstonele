(function(window) {
    var CLUES_TO_ELEMENT = {
        RARITY: document.getElementById('heroPowerRarity'),
        CLASS: document.getElementById('heroPowerClass'),
        EXPANSION: document.getElementById('heroPowerExpansion'),
        INITIALS: document.getElementById('heroPowerInitials'),
        CHANGE: document.getElementById('heroPowerChange'),
        FLAVOR_TEXT: document.getElementById('heroPowerFlavorText'),
        IMAGE_1: document.getElementById('heroPowerImage1'),
        IMAGE_2: document.getElementById('heroPowerImage2'),
		IMAGE_3: document.getElementById('heroPowerImage3'),
    };

    var CLUES_TO_COST = {
        RARITY: 1,
        CLASS: 1,
        EXPANSION: 2,
        INITIALS: 3,
        CHANGE: 3,
		FLAVOR_TEXT: 1,
		IMAGE_1: 1,
		IMAGE_2: 2,
		IMAGE_3: 3,		
    };

    function Game(client, onDie) {
        this.client = client;
        this.hp = Game.MAX_HP;
        this.cardToGuess = null;
        this.usedClues = [];
        this.foundCards = [];
        this.onDie = onDie;
		this._nextImageClue = 'IMAGE_1';

        this.updateHealthUI();
    }
    
    Game.prototype.newRound = function() {
        var that = this;
        that.resetClues();

        return this.client.fetchRandomCard().then(function(newCardToGuess) {
            var lastCardToGuess = that.foundCards[that.foundCards.length - 1];

            if (lastCardToGuess && lastCardToGuess.name === newCardToGuess.name) {
                return that.newRound();
            }

            that.cardToGuess = newCardToGuess;
            return newCardToGuess;
        });
    };

    Game.prototype.resetClues = function() {
        this.usedClues = [];
        
        var clueButtons = document.querySelectorAll('.heroPowerChoice');

        for(var i = 0, l = clueButtons.length; i < l; i++) {
            clueButtons[i].style.display = 'none';
        }
		
		this._nextImageClue = 'IMAGE_1';
    };

	Game.prototype.updateCluesUI = function() {
		var that = this;
		var totalButtons = document.querySelectorAll('.heroPowerChoice').length;
		
		var cluesToReveal = ['FLAVOR_TEXT', that._nextImageClue, 'RARITY', 'CLASS', 'EXPANSION']
			.sort(() => Math.random() - 0.5)
			.concat('INITIALS', 'CHANGE');
		
		cluesToReveal.forEach(function (heroPower) {
			var totalHiddenButtons = document.querySelectorAll('.heroPowerChoice[style="display: none;"]').length;
			var totalShownButtons = totalButtons - totalHiddenButtons;
		
			if (totalShownButtons < 3) {
				if (that.usedClues.indexOf(heroPower) === -1) {
					CLUES_TO_ELEMENT[heroPower].style.removeProperty('display');
				}
			}
		});
	};

    Game.prototype.useClue = function(clue, preventDamages) {
		var that = this;
		
        if (that.usedClues.indexOf(clue) !== -1) {
            return false;
        }

        that.usedClues.push(clue);
        
        CLUES_TO_ELEMENT[clue].style.display = 'none';
        
        var isDied = preventDamages ? false : that.takeDamages(CLUES_TO_COST[clue]);

        if (isDied) {
            throw new Error('died');
        }
		
		if (clue === 'IMAGE_1') {
			this._nextImageClue = 'IMAGE_2';
		} else if (clue === 'IMAGE_2') {
			this._nextImageClue = 'IMAGE_3';
		}
		
		this.updateCluesUI();
		
        return that.usedClues.length === Object.keys(CLUES_TO_COST).length;
    };

    Game.prototype.checkGuess = function (nameToCheck) {
        return nameToCheck === this.cardToGuess.name;
    };

    Game.getCardCost = function (card) {
        return 'manaCost' in card ? card.manaCost : 0;
    };

    Game.getCardAttack = function (card) {
        return 'attack' in card ? card.attack : 0;
    };

    Game.getCardHealthType = function (card) {
        return 'armor' in card ? 'armor' : (
            'durability' in card ? 'durability' : (
                'health' in card ? 'health' : 'none'
            )
        );
    };

    Game.getCardHealth = function (card) {
        return card[Game.getCardHealthType(card)] || 0;
    };

    Game.prototype.checkCardStats = function (cardToCheck) {
        var cardToCheckCost = Game.getCardCost(cardToCheck);
        var cardToGuessCost = Game.getCardCost(this.cardToGuess);

        var cardToCheckAttack = Game.getCardAttack(cardToCheck);
        var cardToGuessAttack = Game.getCardAttack(this.cardToGuess);

        var cardToCheckHealth = Game.getCardHealth(cardToCheck);
        var cardToGuessHealth = Game.getCardHealth(this.cardToGuess);

        var costStatus = cardToCheckCost === cardToGuessCost ? 'ok' : (
            cardToCheckCost === cardToGuessAttack || cardToCheckCost === cardToGuessHealth
                ? 'almost'
                : 'ko'
        );

        var attackStatus = cardToCheckAttack === cardToGuessAttack ? 'ok' : (
            cardToCheckAttack === cardToGuessCost || cardToCheckAttack === cardToGuessHealth
                ? 'almost'
                : 'ko'
        );

        var healthStatus = cardToCheckHealth === cardToGuessHealth ? 'ok' : (
            cardToCheckHealth === cardToGuessCost || cardToCheckHealth === cardToGuessAttack
                ? 'almost'
                : 'ko'
        );

        return {
            cost: costStatus,
            attack: attackStatus,
            health: healthStatus,
        };
    };

    Game.prototype.takeDamages = function(damage) {
        var damageContainer = document.getElementById('damage');
        var damageValueContainer = document.getElementById('damageValue');


        this.hp -= damage;
        this.updateHealthUI();
        
        damageContainer.style.display = 'none';

        window.setTimeout(function() {
            damageValueContainer.innerHTML = damage;
            damageContainer.style.display = 'block';
        });

        if (this.hp <= 0) {
            this.onDie();
            return true;
        }

        return false;
    };

    Game.prototype.restoreHealth = function(health) {
        this.hp = Math.min(Game.MAX_HP, this.hp + health);
        this.updateHealthUI();
    };

    Game.prototype.updateHealthUI = function() {
        var healthContainer = document.getElementById('playerHealth');
        healthContainer.innerHTML = this.hp;
        
        if (this.hp < Game.MAX_HP) {
            healthContainer.classList.add('hurt');
        } else {
            healthContainer.classList.remove('hurt');
        }
    };

    Game.prototype.incrementScore = function() {
        this.foundCards.push(this.cardToGuess);
        var scoreNode = document.getElementById('score');
        
        scoreNode.innerHTML = this.foundCards.length;
        scoreNode.style.display = 'block';
    };

    Game.MAX_HP = 30;

    window.Game = Game;
})(window);