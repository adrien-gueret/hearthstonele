(function() {
    var suggestions = document.getElementById('suggestions');
    var searchInput = document.getElementById('searchInput');
    var submitButton = document.getElementById('submitButton');
    var flavorText = document.getElementById('flavorText');
    var heroPower = document.getElementById('heroPower');
    var tableHistory = document.getElementById('tableHistory');
    var tableHistoryContainer = document.getElementById('tableHistoryContainer');
    var errorModal = document.getElementById('errorModal');
    var allClues = document.getElementById('allClues');
    var scoreAnimation = document.getElementById('scoreAnimation');
    var configForm = document.getElementById('configForm');

    var hasStartedGame = false;

    var currentGame = null;
    var suggestedCards = [];

    function getStatTitle(statType, value, status) {
        switch (status) {
            case 'ok':
                return translate('statTitle_' + statType + '_ok', value);
            break;

            case 'almost':
                return translate('statTitle_' + statType + '_almost', value);
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

    function closeHeroPowerModal(hasUsedAllClues) {
        heroPowerModal.style.display = 'none';
        
        if (!hasUsedAllClues) {
            resetHeroPower();
        }
        
        searchInput.focus();
    }

    function useClue(clue, client) {
        var hasUsedAllClues = true;
        activeConfigNewGameWarning();
        
        try {
            hasUsedAllClues = currentGame.useClue(clue);
        } catch (e) {
            return;
        } finally {
            closeHeroPowerModal(hasUsedAllClues);
        }

        switch (clue) {
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
                image.src = currentGame.cardToGuess.image;
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

            default: return;
        }
    }

    function newGameRound() {
        tableHistoryContainer.style.display = 'none';
        tableHistory.tBodies[0].innerHTML = '';
        searchInput.value = '';
        searchInput.placeholder = '';
        allClues.innerHTML = '';
        suggestions.innerHTML = '';

        currentGame.newRound().then(function (card) {
            resetHeroPower();
            
            flavorText.innerHTML = card.flavorText;
          
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
            image.src = card.image;
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
       
        newGameRound();
    }

    function translateUI() {
        [
            'guessSubtitle', 'rules1', 'rules2', 'rules3', 'statsExplanation',
            'howManyCanYouGuess', 'submitButton',
            'whichFlavorText', 'roundSuccessTitle', 'errorModalButton', 'hasBeenRestored', 'cancelHeroPowerButton',
            'heroPowerDetailsTitle', 'heroPowerDetailsDescription',
            'heroPowerChoice1_Title', 'heroPowerChoice2_Title', 'heroPowerChoice3_Title', 'heroPowerChoice4_Title', 'heroPowerChoice5_Title',
            'heroPowerChoice1_Description', 'heroPowerChoice2_Description', 'heroPowerChoice3_Description', 'heroPowerChoice4_Description', 'heroPowerChoice5_Description',
            'changeCardTitle', 'newCardButtonChange', 'gameEndTitle', 'gameEndButton',
            'configNewGameButton', 'newGameWarning', 'formConfigLanguage', 'formConfigGameMode',
            'formConfigWildMode', 'formConfigStandardMode', 'configBackButton',
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
                image.src = correspondingCard.image;
                nameCell.appendChild(image);
                
                rowFragment.appendChild(nameCell);

                // Cost cell
                var costCell = document.createElement('td');
                var cost = Game.getCardCost(correspondingCard);
                costCell.className = 'tableCardStat cost hearthstoneText ' + cardStatsStatus.cost;
                costCell.appendChild(document.createTextNode(cost));
                costCell.title = getStatTitle('cost', cost, cardStatsStatus.cost);
                rowFragment.appendChild(costCell);

                // Attack cell
                var attackCell = document.createElement('td');
                var attack =  Game.getCardAttack(correspondingCard);

                var attackClassName = 'none';
                
                if ('attack' in correspondingCard) {
                    attackClassName = correspondingCard.cardTypeId === 7 ? 'attack_weapon' : 'attack';
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
                successImage.src = correspondingCard.image;
                successImage.alt = correspondingCard.name;
                
                successImageContainer.appendChild(successImage);

                document.getElementById('hasBeenRestored').style.display = currentGame.hp === Game.MAX_HP ? 'none' : 'block';

                modalContainer.style.display = 'flex';

                currentGame.restoreHealth(3);
            }
        };

        heroPower.onclick = useHeroPower;
        
        document.getElementById('heroPowerRarity').onclick = () => useClue('RARITY', client);
        document.getElementById('heroPowerClass').onclick = () => useClue('CLASS', client);
        document.getElementById('heroPowerExpansion').onclick = () => useClue('EXPANSION', client);
        document.getElementById('heroPowerInitials').onclick = () => useClue('INITIALS', client);
        document.getElementById('heroPowerChange').onclick = () => useClue('CHANGE', client);

        document.getElementById('cancelHeroPowerButton').onclick = () => closeHeroPowerModal();

        document.getElementById('newCardButtonSuccess').onclick = () => {
            roundSuccess.style.display = 'none';

            scoreAnimation.style.display = 'block';

            document.body.style.pointerEvents = 'none';

            newGameRound();

            window.setTimeout(function () {
                document.body.style.removeProperty('pointer-events');
                scoreAnimation.style.display = 'none';
                currentGame.incrementScore();
            }, 1750);
        }

        document.getElementById('newCardButtonChange').onclick = function() {
            document.getElementById('changeCard').style.display = 'none';
            newGameRound();
        };
    }

    function showRules() {
        hideUIElements();
        document.getElementById('rules').style.display = 'block';
    }

    function goToGame() {
        hideUIElements();
        document.getElementById('game').style.display = 'block';
    }

    function showConfig(idToElementToShow, defaultGameMode) {
        hideUIElements();

        configForm.elements.namedItem('language').value = window.currentLocale;
        configForm.elements.namedItem('gameMode').value = defaultGameMode;

        document.getElementById(idToElementToShow).style.display = 'block'
        document.getElementById('configModal').style.display = 'flex';
    }

    function onRender(client) {
        function setLocale(newLocale) {
            client.setLocale(newLocale);
            window.currentLocale = newLocale;
    
            translateUI();
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

        configForm.onsubmit = function(e) {
            e.preventDefault();

            var language = configForm.elements.namedItem('language').value;
            localStorage.setItem('user_language', language);

            var gameMode = configForm.elements.namedItem('gameMode').value;
            localStorage.setItem('user_mode', gameMode);

            setLocale(language);
            
            client.setCardSetGroup(gameMode);
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

    translateUI();

    onRender(new Client(onClientInit, onRequestError));
})();
