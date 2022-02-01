(function(window) {
    var storedLanguage = localStorage.getItem('user_language');
    var languageToCheck = storedLanguage ? storedLanguage : (navigator.language ? navigator.language : 'en');

    var userLanguage =  languageToCheck.substring(0, 2);

    window.currentLocale = userLanguage.toLowerCase() === 'fr' ? 'fr_FR' : 'en_US';

    var locales = {
        fr_FR: {
            submitButton: 'Soumettre',
            guessSubtitle: 'Devinez un maximum de cartes HearthStone !',
            rules1: 'Vous avez 30 points de vie. Utilisez-les pour trouver des cartes HearthStone à partir de leur texte d\'ambiance.<br />Chaque erreur vous inflige 1 point de dégât, mais chaque bonne réponse vous soigne de 3.',
            rules2: 'Pour chaque erreur, vous récupérez des indications sur les statistiques de la carte à rechercher :',
            rules3: 'Vous pouvez aussi payer des points de vie pour récupérer des indices supplémentaires sur la classe, la rareté etc.',
            howManyCanYouGuess: 'Combien de cartes HearthStone pouvez-vous deviner avant de perdre tous vos points de vie&nbsp;?',
            rulesButton: 'Jouer !',
            statsExplanation: 'Ici, nous apprenons que la carte à rechercher a un coût en mana de 6, qu\'il n\'y a pas de 9 dans ses stats et que le 4 est présent mais mal placé. On peut donc déduire que la vie (si c\'est un serviteur), l\'armure (si c\'est un héro) ou la durabiltié (si c\'est une arme) de la carte à trouver est de 4. Peut-être <a href="https://playhearthstone.com/fr-fr/cards/59555-forest-warden-omu" target="_blank">Gardienne de la forêt Omu</a>&nbsp;?',
            whichFlavorText: 'Quelle carte a le texte d\'ambiance suivant&nbsp;?',
            tableHistoryName: 'Nom',
            statTitle_cost_ok: function (value) {
                return 'Le coût en mana de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_attack_ok: function (value) {
                return 'L\'attaque de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_health_ok: function (value) {
                return 'La vie, la durabilité OU l\'armure de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_cost_almost: function (value) {
                return 'Il y a bien un ' + value + ' dans les stats de la carte recherchée, mais ce n\'est pas son coût en mana.';
            },
            statTitle_attack_almost: function (value) {
                return 'Il y a bien un ' + value + ' dans les stats de la carte recherchée, mais ce n\'est pas son attaque.';
            },
            statTitle_health_almost: function (value) {
                return 'Il y a bien un ' + value + ' dans les stats de la carte recherchée, mais ce n\'est pas sa vie, sa durabilité ou son armure.';
            },
            statTitle_ko: function (value) {
                return 'Il \'y a pas de ' + value + ' dans les stats de la carte recherchée.';
            },
            roundSuccessTitle: 'Bien joué !',
            hasBeenRestored: 'Vous avez été soigné de 3 points de vie.',
            newCardButton: 'Nouvelle carte',
            changeCardTitle: 'La carte recherchée était :',
            newCardButtonChange: 'Nouvelle carte',
            errorModalButton: 'Fermer',
            cardNoFoundTitle: 'Carte non trouvée !',
            cardNoFoundContent: 'Assurez-vous de bien utiliser la liste des suggestions.',
            errorRequestTitle: 'Erreur réseau !',
            errorRequestContent: 'Une erreur est survenue lors de la récupération des données des cartes depuis les serveurs de Blizzard.<br />Désolé, mais vous allez devoir jouer plus tard...',
            cancelHeroPowerButton: 'Annuler',
            heroPowerDetailsTitle: 'Chercher un indice',
            heroPowerDetailsDescription: '<b>Pouvoir héroïque</b><br /><b>Découvre</b> un indice<br />sur la carte à trouver.',
            heroPowerChoice1_Title: 'Estimer la valeur',
            heroPowerChoice2_Title: 'Étudier le spécimen',
            heroPowerChoice3_Title: 'Trianguler la zone',
            heroPowerChoice4_Title: 'À la bibliothèque !',
            heroPowerChoice5_Title: 'Plan de secours',
            heroPowerChoice1_Description: '<br />Dévoile la rareté de la carte recherchée.<br /><br />',
            heroPowerChoice2_Description: '<br />Dévoile la classe de la carte recherchée.<br /><br />',
            heroPowerChoice3_Description: '<br />Dévoile l\'extension de la carte recherchée.<br />',
            heroPowerChoice4_Description: '<br />Dévoile les initiales du nom de la carte recherchée.<br />',
            heroPowerChoice5_Description: '<br />C\'est fichu ! Change la carte à rechercher.<br />',
            heroPower_AriaLabel: 'Chercher un indice',
            score_AriaLabel: 'Score',
            goToRulesButton_AriaLabel: 'Règles',
            goToConfigButton_AriaLabel: 'Options',
            gameEndTitle: 'Parite terminée !',
            gameEndScore: function (value) {
                switch (value) {
                    case 0: return 'Euh... Vous n\'avez trouvé aucune carte... Vous êtes sûr que vous allez bien ?';
                    case 1: return 'Vous n\'avez trouvé qu\'une seule carte, vous pouvez sans doute faire mieux !';
                    default: return 'Vous avez trouvé les <strong>' + value + '</strong> cartes ci-dessous, bien joué !';
                }
            },
            gameEndButton: 'Nouvelle partie',
            back: 'Retour',
            configNewGameButton: 'Nouvelle partie',
            configBackButton: 'Annuler',
            newGameWarning: 'Votre partie actuelle sera perdue !',
            formConfigLanguage: 'Langue',
            formConfigGameMode: 'Mode de jeu',
            formConfigWildMode: 'Libre',
            formConfigStandardMode: 'Standard',
        },
        en_US: {
            submitButton: 'Submit',
            guessSubtitle: 'Guess as many HearthStone cards as possible!',
            rules1: 'You have 30 health points. Use them to find HearthStone cards from their flavor text.<br />Each error deals 1 damage to you, but each good guess restores 3 health.',
            rules2: 'For each error, you get some indics about the card stats:',
            rules3: 'You can also take damage to earn some clues about card class, rarity etc.',
            howManyCanYouGuess: 'How many HearthStone cards can you guess before loosing all your HPs?',
            rulesButton: 'Play!',
            statsExplanation: 'Here, we learn that the card to find has its mana cost equals to 6. There are no 9 in its stats, and there is a 4 but this one is in the wrong spot. We can deduce that the health (if it\'s a minion), the armor (if it\'s an hero) or the durability (if it\'s a weapon) is 4. Maybe <a href="https://playhearthstone.com/en-us/cards/59555-forest-warden-omu" target="_blank">Forest Warden Omu</a>?',
            whichFlavorText: 'Which card has the following flavor text?',
            tableHistoryName: 'Name',
            statTitle_cost_ok: function (value) {
                return 'The mana cost of the card to find is indeed ' + value + '.';
            },
            statTitle_attack_ok: function (value) {
                return 'The attack of the card to find is indeed ' + value + '.';
            },
            statTitle_health_ok: function (value) {
                return 'The health, durability OR armor of the card to find is indeed  ' + value + '.';
            },
            statTitle_cost_almost: function (value) {
                return 'There is indeed a ' + value + ' in the stats of the card to find, but it is not its mana cost.';
            },
            statTitle_attack_almost: function (value) {
                return 'There is indeed a ' + value + ' in the stats of the card to find, but it is not its attack.';
            },
            statTitle_health_almost: function (value) {
                return 'There is indeed a ' + value + ' in the stats of the card to find, but it is not its health, durability nor armor.';
            },
            statTitle_ko: function (value) {
                return 'There is no ' + value + ' in the stats of the card to find.';
            },
            roundSuccessTitle: 'Well play!',
            hasBeenRestored: "You've restored 3 health.",
            newCardButton: 'New card',
            changeCardTitle: 'The card to find was:',
            newCardButtonChange: 'New card',
            errorModalButton: 'Close',
            cardNoFoundTitle: 'Card not found!',
            cardNoFoundContent: 'Please be sure to use the list of suggestions.',
            errorRequestTitle: 'Network error!',
            errorRequestContent: 'An error occured while trying to get cards data from Blizzard servers.<br />Sorry, but you\'ll have to play later...',
            cancelHeroPowerButton: 'Cancel',
            heroPowerDetailsTitle: 'Looking for a clue',
            heroPowerDetailsDescription: '<b>Hero Power</b><br /><b>Discover</b> a clue<br />on the card<br />to find.',
            heroPowerChoice1_Title: 'Estimate the value',
            heroPowerChoice2_Title: 'Study the specimen',
            heroPowerChoice3_Title: 'Triangulate the area',
            heroPowerChoice4_Title: 'To the library!',
            heroPowerChoice5_Title: 'Back-up Plan',
            heroPowerChoice1_Description: '<br />Reveal the rarity of the card to find.<br /><br />',
            heroPowerChoice2_Description: '<br />Reveal the class of the card to find.<br /><br />',
            heroPowerChoice3_Description: '<br />Reveal the expansion of the card to find.<br />',
            heroPowerChoice4_Description: '<br />Reveal the initials of the name of the card to find.<br />',
            heroPowerChoice5_Description: '<br />We messed up! Let\'s switch the card to find...<br />',
            heroPower_AriaLabel: 'Looking for a clue',
            score_AriaLabel: 'Score',
            goToRulesButton_AriaLabel: 'Rules',
            goToConfigButton_AriaLabel: 'Options',
            gameEndTitle: 'Game Over!',
            gameEndScore: function (value) {
                switch (value) {
                    case 0: return 'Hum... You haven\'t found any cards... Are you sure you\'re okay?';
                    case 1: return 'You\'ve found only one card, you can probably do better!';
                    default: return 'You have found the below <strong>' + value + '</strong> cards, well done!';
                }
            },
            gameEndButton: 'New game',
            back: 'Back',
            configNewGameButton: 'New game',
            configBackButton: 'Cancel',
            newGameWarning: 'Your current game will be lost!',
            formConfigLanguage: 'Language',
            formConfigGameMode: 'Game mode',
            formConfigWildMode: 'Wild',
            formConfigStandardMode: 'Standard',
        }
    };

    window.translate = function (key, ...variables) {
        var localeToUse = window.currentLocale;
        
        if  (!locales[localeToUse]) {
            localeToUse = 'en_US';
        }

        if  (!locales[localeToUse]) {
            return key;
        }

        var translation = locales[localeToUse][key];

        if (!translation) {
            return key;
        }

        if (translation instanceof Function) {
            return locales[localeToUse][key](...variables);
        }

        return locales[localeToUse][key];
    };
})(window);