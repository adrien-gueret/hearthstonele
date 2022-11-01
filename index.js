(function() {
    var suggestions = document.getElementById('suggestions');
    var searchInput = document.getElementById('searchInput');
    var submitButton = document.getElementById('submitButton');
    var flavorText = document.getElementById('flavorText');
    var pixelatedIllustration = document.getElementById('pixelatedIllustration');
    var heroPower = document.getElementById('heroPower');
    var tableHistory = document.getElementById('tableHistory');
    var tableHistoryContainer = document.getElementById('tableHistoryContainer');
    var errorModal = document.getElementById('errorModal');
    var allClues = document.getElementById('allClues');
    var scoreAnimation = document.getElementById('scoreAnimation');
    var configForm = document.getElementById('configForm');
    var firstClueFlavorTextContainer = document.getElementById('firstClueFlavorTextContainer');
	
    var hasStartedGame = false;

    var currentGame = null;
    var suggestedCards = [];
	
	function getDefaultClue() {
		var storedDefaultClue = localStorage.getItem('first_clue');
		return ['IMAGE_1', 'FLAVOR_TEXT', 'NONE'].indexOf(storedDefaultClue) === -1 ? 'FLAVOR_TEXT' : storedDefaultClue;
	}

    function getStatTitle(statType, value, status, isBattlegrounds) {
        switch (status) {
            case 'ok':
                return translate('statTitle_' + statType + '_ok', value, isBattlegrounds);
            break;

            case 'almost':
                return translate('statTitle_' + statType + '_almost', value, isBattlegrounds);
            break;

            case 'ko':
                return translate('statTitle_ko', value);
            break;

            default: 
                return '';
            break;
        }
    }

    function useHeroPower() {
        heroPower.className = 'used';
        heroPower.blur();
        heroPowerModal.style.display = 'flex';   
    }

    function resetHeroPower() {
        heroPower.className = '';
    }

    function closeHeroPowerModal(hasUsedAllClues, usedClue) {
        heroPowerModal.style.display = 'none';
        
        if (!hasUsedAllClues) {
            resetHeroPower();
        }
        
        if (usedClue !== 'CHANGE' && window.innerWidth > 800 && window.innerHeight > 600) {
            searchInput.focus();
        }
		
		window.scrollTo(0, 0);
    }

    function useClue(clue, client, preventClueDamages) {
        var hasUsedAllClues = true;
        activeConfigNewGameWarning();
		
        try {
            hasUsedAllClues = currentGame.useClue(clue, preventClueDamages, client.cardSetGroup);
        } catch (e) {
            return;
        } finally {
            closeHeroPowerModal(hasUsedAllClues, clue);
        }

        switch (clue) {
			case 'FLAVOR_TEXT':
				flavorText.innerHTML = currentGame.cardToGuess.flavorText;
				flavorText.style.display = 'block';
			break;

            case 'TEXT':
                var tempSpan = document.createElement('span');
                tempSpan.innerHTML = currentGame.cardToGuess.text;
                
                var cleanText = tempSpan.textContent
                    .toLocaleLowerCase()
                    .replace(/\((\S+?),(\S+?)\)/g, '$1')
                    .replace(/\((.+?)\)/g, '$1')
                    .replace(/\./g, '');

                var shuffle = () => Math.random() - 0.5;

                var words = cleanText.split(' ');
                var reorderedWords = words.sort(shuffle);
                var shuffledWords = reorderedWords.map((word) => word.split('').sort(shuffle).join(''));

                var finalText = shuffledWords.join(' ');

				flavorText.innerHTML = finalText[0].toUpperCase() + finalText.substring(1) + '.';
				flavorText.style.display = 'block';
			break;
			
            case 'INITIALS':
                var censuredName = currentGame.cardToGuess
                    .name.split(' ')
                    .map(function(nameSegment) {
                        return nameSegment[0] + '_'.repeat(nameSegment.length - 1);
                    })
                    .join(' ');
                
                searchInput.value = '';
                searchInput.placeholder = censuredName;
            break;

            case 'CHANGE':
                var modalContainer  = document.getElementById('changeCard');
                var changeCardImageContainer = document.getElementById('changeCardImage');
                changeCardImageContainer.innerHTML = '';

                var image = new Image();
                image.src = Game.getCardImageSrc(currentGame.cardToGuess);
                image.alt = currentGame.cardToGuess.name;
                
                changeCardImageContainer.appendChild(image);

                modalContainer.style.display = 'flex';
            break;

            case 'RARITY':
                client.getRarityName(currentGame.cardToGuess.rarityId).then(function(rarityName) {
                    var clue = document.createElement('span');
                    clue.className = 'clue';

                    var icon = document.createElement('span');
                    icon.className = 'clueIcon rarity';
                    icon.style.backgroundPosition = ((currentGame.cardToGuess.rarityId - 1) * -27) + 'px 0';
                    clue.appendChild(icon);

                    var rarity = document.createElement('b');
                    rarity.appendChild(document.createTextNode(rarityName));
                    clue.appendChild(rarity);

                    allClues.appendChild(clue);
                });
            break;

            case 'CLASS':
                var allCardClassIds = currentGame.cardToGuess.multiClassIds
                                        .concat(currentGame.cardToGuess.classId)
                                        .filter(function (classId, index, allClasses) {
                                            return allClasses.indexOf(classId) === index;
                                        });

                var allClassesPromises = allCardClassIds.map(function (classId) {
                    return client.getClass(classId);
                });

                Promise.all(allClassesPromises).then(function (classes) {
                    var clue = document.createElement('span');
                    clue.className = 'clue';

                    var classesToRender = classes;

                    if (classes.length > 1) {
                        classesToRender = classes.filter(function(cardClass) {
                            return cardClass.slug !== 'neutral';
                        });
                    }

                    classesToRender.forEach(function (classData) {
                        var icon = document.createElement('span');
                        icon.className = 'clueIcon class ' + classData.slug;
                        clue.appendChild(icon);
    
                        var className = document.createElement('b');
                        className.appendChild(document.createTextNode(classData.name));
                        clue.appendChild(className);
                    });

                    allClues.appendChild(clue);
                });
            break;

            case 'EXPANSION':
                client.getCardSet(currentGame.cardToGuess.cardSetId).then(function(cardSet) {
                    var clue = document.createElement('span');
                    clue.className = 'clue';

                    var icon = document.createElement('span');
                    icon.className = 'clueIcon expansion';
                    icon.style.backgroundImage = 'url(./images/sets/' + cardSet.slug + '.svg)';
                    clue.appendChild(icon);

                    var setNode = document.createElement('b');
                    setNode.appendChild(document.createTextNode(cardSet.name));
                    clue.appendChild(setNode);

                    allClues.appendChild(clue);
                });
            break;
			
			case 'IMAGE_1':
				Canvas.extractCardIllustration(currentGame.cardToGuess).then(function (canvasIllustration) {
					var blurryCanvas = Canvas.blurCanvas(canvasIllustration, 30);
					pixelatedIllustration.appendChild(blurryCanvas);
					pixelatedIllustration.style.display = 'block';
				});
			break;
			
			case 'IMAGE_2':
				Canvas.extractCardIllustration(currentGame.cardToGuess).then(function (canvasIllustration) {
					var blurryCanvas = Canvas.blurCanvas(canvasIllustration, 20);
					pixelatedIllustration.appendChild(blurryCanvas);
				});
			break;
			
			case 'IMAGE_3':
				Canvas.extractCardIllustration(currentGame.cardToGuess).then(function (canvasIllustration) {
					var blurryCanvas = Canvas.blurCanvas(canvasIllustration, 10);
					pixelatedIllustration.appendChild(blurryCanvas);
				});
			break;

            case 'TYPE':
                client.getMinionType(currentGame.cardToGuess.minionTypeId).then(function(minionType) {
                    var minionTypeName = translate('typeless');
                    var minionTypeSlug = 'typeless';

                    if (minionType) {
                        minionTypeName = minionType.name;
                        minionTypeSlug = minionType.slug;
                    }

                    var clue = document.createElement('span');
                    clue.className = 'clue';

                    var icon = document.createElement('span');
                    icon.className = 'clueIcon type ' + minionTypeSlug;
                    clue.appendChild(icon);

                    var minionType = document.createElement('b');
                    minionType.appendChild(document.createTextNode(minionTypeName));
                    clue.appendChild(minionType);

                    allClues.appendChild(clue);
                });
            break;

            default: return;
        }
    }

    function newGameRound(client) {
        pixelatedIllustration.style.display = 'none';
		pixelatedIllustration.innerHTML = '';
        flavorText.style.display = 'none';
		tableHistoryContainer.style.display = 'none';
        tableHistory.tBodies[0].innerHTML = '';
        searchInput.value = '';
        searchInput.placeholder = '';
        allClues.innerHTML = '';
        suggestions.innerHTML = '';
		
		document.body.className = client.cardSetGroup;

        currentGame.newRound().then(function () {
            resetHeroPower();
			
			var preventClueDamages = true;
			var defaultClue = getDefaultClue();
			
			if (defaultClue && defaultClue !== 'NONE') {
				useClue(defaultClue, client, preventClueDamages);
			} else {
				currentGame.updateCluesUI(client.cardSetGroup);
			}
			
            searchInput.disabled = false;
            submitButton.disabled = false;
        });
    }

    function onGameEnd() {
        var modalContainer = document.getElementById('gameEnd');
        var imageContainer = document.getElementById('gameEndCards');
        imageContainer.innerHTML = '';

        currentGame.foundCards.forEach(function (card) {
            var image = new Image();
            image.alt = card.name;
            image.src = Game.getCardImageSrc(card);
            imageContainer.appendChild(image);
        });

        document.getElementById('gameEndScore').innerHTML = translate('gameEndScore', currentGame.foundCards.length);
        
        modalContainer.style.display = 'flex';
    }

    function hideUIElements() {
        hideErrorModal();
        document.getElementById('game').style.display = 'none';
        document.getElementById('rules').style.display = 'none';
        document.getElementById('damage').style.display = 'none';
        document.getElementById('score').style.display = 'none';
        document.getElementById('gameEnd').style.display = 'none';
        document.getElementById('configModal').style.display = 'none';
    }

    function startNewGame(client) {
        hasStartedGame = true;
        document.getElementById('rulesButton').innerHTML = translate('back');
        disableConfigNewGameWarning();
        
        currentGame = new Game(client, onGameEnd);
        
        goToGame();
       
        newGameRound(client);
    }

    function translateUI(client) {
        [
            'guessSubtitle', 'rules1', 'rules2', 'rules3', 'statsExplanation',
            'howManyCanYouGuess', 'submitButton',
            'roundSuccessTitle', 'errorModalButton', 'hasBeenRestored', 'cancelHeroPowerButton',
            'heroPowerDetailsTitle', 'heroPowerDetailsDescription',
            'heroPowerChoice1_Title', 'heroPowerChoice2_Title', 'heroPowerChoice3_Title', 'heroPowerChoice4_Title', 'heroPowerChoice5_Title', 'heroPowerChoice6_Title', 'heroPowerChoice7_Title', 'heroPowerChoice8_Title', 'heroPowerChoice9_Title', 'heroPowerChoice10_Title', 'heroPowerChoice11_Title',
            'heroPowerChoice1_Description', 'heroPowerChoice2_Description', 'heroPowerChoice3_Description', 'heroPowerChoice4_Description', 'heroPowerChoice5_Description', 'heroPowerChoice6_Description', 'heroPowerChoice7_Description', 'heroPowerChoice8_Description', 'heroPowerChoice9_Description', 'heroPowerChoice10_Description', 'heroPowerChoice11_Description',
            'changeCardTitle', 'newCardButtonChange', 'gameEndTitle', 'gameEndButton',
            'configNewGameButton', 'newGameWarning', 'formConfigLanguage', 'formConfigGameMode',
            'formConfigWildMode', 'formConfigStandardMode', 'formConfigLastExpansionMode', 'formConfigClassicMode', 'formConfigArenaMode', 'formConfigBattlegroundsMode', 'formConfigFirstClue', 'formConfigFlavorText', 'formConfigIllustration', 'formConfigNone',
			'configBackButton', 'gameBy',
        ].forEach(function (elementId) {
            var element = document.getElementById(elementId);
            element.innerHTML = translate(elementId);
        });

        ['heroPower', 'score', 'goToConfigButton', 'goToRulesButton'].forEach(function (elementId) {
            var element = document.getElementById(elementId);
            var label = translate(elementId + '_AriaLabel');
            element.setAttribute('title', label);
            element.setAttribute('aria-label', label);
        });

        document.getElementById('rulesButton').innerHTML = translate(hasStartedGame ? 'back' : 'rulesButton');

        document.getElementById('sampleStatsCost').title = translate('statTitle_cost_ok', 6);
        document.getElementById('sampleStatsAttack').title = translate('statTitle_attack_almost', 4);
        document.getElementById('sampleStatsHealth').title = translate('statTitle_ko', 9);
		
        let cardMode = '';

        switch (client.cardSetGroup) {
            case 'battlegrounds': { cardMode = translate('formConfigBattlegroundsMode'); } break;
            case 'wild': { cardMode = translate('formConfigWildMode'); } break;
            case 'classic': { cardMode = translate('formConfigClassicMode'); } break;
            case 'arena': { cardMode = translate('formConfigArenaMode'); } break;
            case 'lastExpansion': {
                document.getElementById('guessCard').innerHTML = translate('guessCardLastExpansion');
                return;
            } 
            default: { cardMode = translate('formConfigStandardMode'); } break;
        }

        document.getElementById('guessCard').innerHTML = translate('guessCard', cardMode);
    }

    function showErrorModal(title, content) {
        document.getElementById('errorModalTitle').innerHTML = title;
        document.getElementById('errorModalContainer').innerHTML = content;
        errorModal.style.display = 'flex';
    }

    function activeConfigNewGameWarning() {
        document.getElementById('configBackButton').style.display = 'inline';
        document.getElementById('newGameWarningContainer').style.display = 'block';
    }

    function disableConfigNewGameWarning() {
        document.getElementById('configBackButton').style.display = 'none';
        document.getElementById('newGameWarningContainer').style.display = 'none';
    }

    function hideErrorModal() {
        errorModal.style.display = 'none';
    }

    function onClientInit(client) {
        var searchClock = null;

        searchInput.oninput = function(e) {
            e.target.value = e.target.value.replace(/'/g, '’');

            if (searchClock) {
                window.clearTimeout(searchClock);
            }
    
            var nameToSeach = e.target.value;
    
            if (nameToSeach.length < 3) {
                return;
            }
    
            searchClock = window.setTimeout(function() {
                lastSearchTime = Date.now();

                client.searchByCardName(nameToSeach)
                    .then(function (cards) {
                        suggestions.innerHTML = '';
                        suggestedCards = cards;
    
                        var optionsFragment = document.createDocumentFragment();
    
                        cards.forEach(function (card) {
                            var option = document.createElement('option');
                            option.appendChild(document.createTextNode(card.name));
    
                            optionsFragment.appendChild(option);
                        });
    
                        suggestions.appendChild(optionsFragment);
                    });

            }, 300);
        };

        searchInput.onchange = function () {
            submitButton.focus();
        };

        document.getElementById('guessForm').onsubmit = function(e) {
            e.preventDefault();
            submitButton.blur();

            var userGuess = searchInput.value;
            searchInput.value = '';

            var correspondingCard = suggestedCards.find(function (card) {
                return card.name === userGuess;
            });

            if (!correspondingCard) {
                showErrorModal(translate('cardNoFoundTitle'), translate('cardNoFoundContent'));
                return;
            }

            activeConfigNewGameWarning();

            var isOK = currentGame.checkGuess(userGuess);

            if (!isOK) {
                var isDied = currentGame.takeDamages(1);

                if (isDied) {
                    return;
                }

                searchInput.focus();

                var historyRow = document.createElement('tr');
                var rowFragment = document.createDocumentFragment();

                var cardStatsStatus = currentGame.checkCardStats(correspondingCard);

                // Name cell
                var nameCell = document.createElement('td');
                nameCell.className = 'tableCardName';
                nameCell.style.backgroundImage = 'url(' + correspondingCard.cropImage + ')';

                var nameContainer = document.createElement('div');
                nameContainer.className = 'nameContainer hearthstoneText';
                nameContainer.appendChild(document.createTextNode(correspondingCard.name));

                nameCell.appendChild(nameContainer);
                
                var image = new Image();
                image.src = Game.getCardImageSrc(correspondingCard);
                nameCell.appendChild(image);
                
                rowFragment.appendChild(nameCell);

                // Cost cell
                var costCell = document.createElement('td');
                var cost = Game.getCardCost(correspondingCard);
                costCell.className = 'tableCardStat cost hearthstoneText ' + cardStatsStatus.cost + ' value-' + cost;
                costCell.appendChild(document.createTextNode(cost));
                costCell.title = getStatTitle('cost', cost, cardStatsStatus.cost, client.isBattlegrounds());
                rowFragment.appendChild(costCell);

                // Attack cell
                var attackCell = document.createElement('td');
                var attack =  Game.getCardAttack(correspondingCard);

                var attackClassName = 'none';
                
                if ('attack' in correspondingCard) {
                    attackClassName = correspondingCard.cardTypeId === HEARTHSTONE_CARD_TYPE_IDS.WEAPON ? 'attack_weapon' : 'attack';
                }

                attackCell.className = 'tableCardStat ' + attackClassName + ' hearthstoneText ' + cardStatsStatus.attack;
                attackCell.appendChild(document.createTextNode(attack));
                attackCell.title = getStatTitle('attack', attack, cardStatsStatus.attack);
                rowFragment.appendChild(attackCell);

                // Health cell
                var healthCell = document.createElement('td');
                var healthType = Game.getCardHealthType(correspondingCard);
                var health = Game.getCardHealth(correspondingCard);

                healthCell.className = 'tableCardStat ' + healthType + ' hearthstoneText ' + cardStatsStatus.health;
                healthCell.appendChild(document.createTextNode(health));
                healthCell.title = getStatTitle('health', health, cardStatsStatus.health);
                rowFragment.appendChild(healthCell);

                historyRow.appendChild(rowFragment);
                tableHistory.tBodies[0].appendChild(historyRow);

                tableHistoryContainer.style.display = 'block';

                window.scrollTo(0, document.body.scrollHeight);
            } else {
                var modalContainer  = document.getElementById('roundSuccess');
                var successImageContainer = document.getElementById('roundSuccessImage');
                successImageContainer.innerHTML = '';

                var successImage = new Image();
                successImage.src = Game.getCardImageSrc(correspondingCard);
                successImage.alt = correspondingCard.name;
                
                successImageContainer.appendChild(successImage);

                document.getElementById('hasBeenRestored').style.display = currentGame.hp === Game.MAX_HP ? 'none' : 'block';

                modalContainer.style.display = 'flex';

                currentGame.restoreHealth(2);
            }
        };

        heroPower.onclick = useHeroPower;
        
        document.getElementById('heroPowerRarity').onclick = () => useClue('RARITY', client);
        document.getElementById('heroPowerClass').onclick = () => useClue('CLASS', client);
        document.getElementById('heroPowerExpansion').onclick = () => useClue('EXPANSION', client);
        document.getElementById('heroPowerInitials').onclick = () => useClue('INITIALS', client);
        document.getElementById('heroPowerChange').onclick = () => useClue('CHANGE', client);
        document.getElementById('heroPowerFlavorText').onclick = () => useClue('FLAVOR_TEXT', client);
        document.getElementById('heroPowerImage1').onclick = () => useClue('IMAGE_1', client);
        document.getElementById('heroPowerImage2').onclick = () => useClue('IMAGE_2', client);
        document.getElementById('heroPowerImage3').onclick = () => useClue('IMAGE_3', client);
        document.getElementById('heroPowerType').onclick = () => useClue('TYPE', client);
        document.getElementById('heroPowerText').onclick = () => useClue('TEXT', client);

        document.getElementById('cancelHeroPowerButton').onclick = () => closeHeroPowerModal();

        document.getElementById('newCardButtonSuccess').onclick = () => {
            roundSuccess.style.display = 'none';
		
            scoreAnimation.style.display = 'block';

            document.body.style.pointerEvents = 'none';

			currentGame.validateCurrentCard();
            newGameRound(client);

            window.setTimeout(function () {
                document.body.style.removeProperty('pointer-events');
                scoreAnimation.style.display = 'none';
                currentGame.incrementScore();
            }, 1750);
        }

        document.getElementById('newCardButtonChange').onclick = function() {
            document.getElementById('changeCard').style.display = 'none';
            newGameRound(client);
        };
    }

    function showRules() {
        hideUIElements();
        document.getElementById('rules').style.display = 'block';
        window.scrollTo(0, 0);
    }

    function goToGame() {
        hideUIElements();
        document.getElementById('game').style.display = 'block';
        window.scrollTo(0, 0);
    }

    function updateConfigForm() {
        firstClueFlavorTextContainer.style.removeProperty('display');

        if (configForm.elements.namedItem('gameMode').value === 'battlegrounds') {
            firstClueFlavorTextContainer.style.display = 'none';

            if (configForm.elements.namedItem('firstClue').value === 'FLAVOR_TEXT') {
                configForm.elements.namedItem('firstClue').value = 'IMAGE_1';
            }
        }
    }

    function showConfig(idToElementToShow, defaultGameMode) {
        hideUIElements();

        configForm.elements.namedItem('language').value = window.currentLocale;
        configForm.elements.namedItem('gameMode').value = defaultGameMode;
        configForm.elements.namedItem('firstClue').value = getDefaultClue();

        updateConfigForm();

        document.getElementById(idToElementToShow).style.display = 'block'
        document.getElementById('configModal').style.display = 'flex';
    }

    function onRender(client) {
        function setLocale(newLocale) {
            client.setLocale(newLocale);
            window.currentLocale = newLocale;
    
            translateUI(client);
        }

        disableConfigNewGameWarning();

        document.getElementById('goToRulesButton').onclick = showRules;
        document.getElementById('goToConfigButton').onclick = function() {
            showConfig('game', client.cardSetGroup);
        };
        document.getElementById('configBackButton').onclick = goToGame;

        document.getElementById('errorModalButton').onclick = hideErrorModal;

        if (localStorage.getItem('has_already_played')) {
            client.onReady(startNewGame);
        } else {
            localStorage.setItem('has_already_played', 1);
            showRules();
        }

        configForm.onchange = function(e) {
            if (e.target.name === 'gameMode') {
                updateConfigForm();
            }
        };

        configForm.onsubmit = function(e) {
            e.preventDefault();

            var language = configForm.elements.namedItem('language').value;
            localStorage.setItem('user_language', language);

            var gameMode = configForm.elements.namedItem('gameMode').value;
            localStorage.setItem('user_mode', gameMode);
			
			var firstClue = configForm.elements.namedItem('firstClue').value;
            localStorage.setItem('first_clue', firstClue);

			client.setCardSetGroup(gameMode);

            setLocale(language);
            
            client.onReady(startNewGame);
        };

        document.getElementById('rulesButton').onclick = function() {
            if (hasStartedGame) {
                goToGame();
            } else {
                showConfig('rules', client.cardSetGroup);
            }
        };

        document.getElementById('gameEndButton').onclick = function() {
            startNewGame(client);
        };
    }

    function onRequestError() {
        showErrorModal(translate('errorRequestTitle'), translate('errorRequestContent'));
    }

	var clientApi = new Client(onClientInit, onRequestError);

    translateUI(clientApi);

    onRender(clientApi);
})();
