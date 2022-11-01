(function(window) {
    var storedLanguage = localStorage.getItem('user_language');
    var languageToCheck = storedLanguage ? storedLanguage : (navigator.language ? navigator.language : 'en');

    var userLanguage =  languageToCheck.substring(0, 2);

    window.currentLocale = userLanguage.toLowerCase() === 'fr' ? 'fr_FR' : 'en_US';

    var locales = {
        fr_FR: {
            submitButton: 'Envoyer',
            guessSubtitle: 'Devinez un maximum de cartes Hearthstone&nbsp;!',
            rules1: 'Vous avez 30 points de vie. Utilisez-les pour trouver des cartes Hearthstone à partir de leur texte d\'ambiance ou leur illustration pixelisée.<br />Chaque erreur vous inflige 1 point de dégât, mais chaque bonne réponse vous soigne de 2.',
            rules2: 'Pour chaque erreur, vous récupérez des indications sur les statistiques de la carte à rechercher :',
            rules3: 'Vous pouvez aussi payer des points de vie pour récupérer des indices supplémentaires sur la classe, la rareté etc.',
            howManyCanYouGuess: 'Combien de cartes Hearthstone pouvez-vous deviner avant de perdre tous vos points de vie&nbsp;?',
            rulesButton: 'Jouer !',
            gameBy: 'Un jeu par ',
            statsExplanation: 'Ici, nous apprenons que la carte à rechercher a un coût en mana de 6, qu\'il n\'y a pas de 9 dans ses stats et que le 4 est présent mais mal placé. On peut donc déduire que la vie (si c\'est un serviteur), l\'armure (si c\'est un héro) ou la durabiltié (si c\'est une arme) de la carte à trouver est de 4. Peut-être <a href="https://playhearthstone.com/fr-fr/cards/59555-forest-warden-omu" target="_blank">Gardienne de la forêt Omu</a>&nbsp;?',
            guessCard: function (mode) {
				return 'Devinez la carte <b>' + mode + '</b> à trouver&nbsp;!';
			},
            guessCardLastExpansion: 'Devinez la carte <b>de la dernière extension</b> !',
			tableHistoryName: 'Nom',
            statTitle_cost_ok: function (value, isBattlegrounds) {
                return isBattlegrounds
                    ? 'Le niveau de taverne de la carte recherchée est bien de ' + value + '.'
                    : 'Le coût en mana de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_attack_ok: function (value) {
                return 'L\'attaque de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_health_ok: function (value) {
                return 'La vie, la durabilité OU l\'armure de la carte recherchée est bien de ' + value + '.';
            },
            statTitle_cost_almost: function (value, isBattlegrounds) {
                return isBattlegrounds
                    ? 'Il y a bien un ' + value + ' dans les stats de la carte recherchée, mais ce n\'est pas son niveau de taverne.'
                    : 'Il y a bien un ' + value + ' dans les stats de la carte recherchée, mais ce n\'est pas son coût en mana.';
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
            hasBeenRestored: 'Vous avez été soigné de 2 points de vie.',
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
            heroPowerDetailsDescription: '<b>Pouvoir héroïque</b><br /><b>Découvre</b> un indice<br />sur la carte à<br />trouver.',
            heroPowerChoice1_Title: 'Estimer la valeur',
            heroPowerChoice2_Title: 'Étudier le spécimen',
            heroPowerChoice3_Title: 'Trianguler la zone',
            heroPowerChoice4_Title: 'À la bibliothèque !',
            heroPowerChoice5_Title: 'Plan de secours',
            heroPowerChoice6_Title: 'Écouter en douce',
            heroPowerChoice7_Title: 'Capter les couleurs',
			heroPowerChoice8_Title: 'Faire le point',
			heroPowerChoice9_Title: 'Viser juste',
            heroPowerChoice10_Title: 'Étudier le spécimen',
            heroPowerChoice11_Title: 'Déchiffrer les textes',
            heroPowerChoice1_Description: '<br />Dévoile la rareté de la carte recherchée.<br /><br />',
            heroPowerChoice2_Description: '<br />Dévoile la classe de la carte recherchée.<br /><br />',
            heroPowerChoice3_Description: '<br />Dévoile l\'extension de la carte recherchée.<br />',
            heroPowerChoice4_Description: '<br />Dévoile les initiales du nom de la carte recherchée.<br />',
            heroPowerChoice5_Description: '<br /><b>C\'est fichu !</b><br />Change la carte à rechercher.<br />',
            heroPowerChoice6_Description: '<br />Dévoile le texte d\'ambiance de la carte recherchée.<br />',
            heroPowerChoice7_Description: 'Affiche une version pixelisée de l\'illustration de la carte recherchée.<br />',
            heroPowerChoice8_Description: 'Affiche une meilleure version de l\'illustration de la carte recherchée.<br />',
            heroPowerChoice9_Description: 'Affiche une encore meilleure version de l\'illustration de la carte recherchée.<br />',
            heroPowerChoice10_Description: '<br />Dévoile le type de serviteur de la carte recherchée.<br />',
            heroPowerChoice11_Description: 'Affiche une version cryptique du texte de la carte recherchée.<br />',
            heroPower_AriaLabel: 'Chercher un indice',
            typeless: 'Pas de type',
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
            formConfigLastExpansionMode: 'Juste la dernière (ou future) extension',
            formConfigClassicMode: 'Classique',
            formConfigArenaMode: 'Arène',
            formConfigBattlegroundsMode: 'Champ de bataille',
			formConfigFirstClue: 'Indice révélé dès le départ',
			formConfigFlavorText: 'Texte d\'ambiance',
			formConfigIllustration: 'Illustration pixelisée',
			formConfigNone: 'Aucun !',
        },
        en_US: {
            submitButton: 'Submit',
            guessSubtitle: 'Guess as many Hearthstone cards as possible!',
            rules1: 'You have 30 health points. Use them to find Hearthstone cards from their flavor text or their pixelated art.<br />Each error deals 1 damage to you, but each good guess restores 2 health.',
            rules2: 'For each error, you get some indics about the card stats:',
            rules3: 'You can also take damage to earn some clues about card class, rarity etc.',
            howManyCanYouGuess: 'How many Hearthstone cards can you guess before loosing all your HPs?',
            rulesButton: 'Play!',
            gameBy: 'A game by ',
            statsExplanation: 'Here, we learn that the card to find has its mana cost equals to 6. There are no 9 in its stats, and there is a 4 but this one is in the wrong spot. We can deduce that the health (if it\'s a minion), the armor (if it\'s an hero) or the durability (if it\'s a weapon) is 4. Maybe <a href="https://playhearthstone.com/en-us/cards/59555-forest-warden-omu" target="_blank">Forest Warden Omu</a>?',
            guessCard: function (mode) {
				return 'Guess the <b>' + mode + '</b> card!';
			},
            guessCardLastExpansion: 'Guess the card <b>from last expansion</b>!',
			tableHistoryName: 'Name',
            statTitle_cost_ok: function (value, isBattlegrounds) {
                return isBattlegrounds
                    ? 'The tavern tier of the card to find is indeed ' + value + '.'
                    : 'The mana cost of the card to find is indeed ' + value + '.';
            },
            statTitle_attack_ok: function (value) {
                return 'The attack of the card to find is indeed ' + value + '.';
            },
            statTitle_health_ok: function (value) {
                return 'The health, durability OR armor of the card to find is indeed  ' + value + '.';
            },
            statTitle_cost_almost: function (value, isBattlegrounds) {
                return isBattlegrounds
                    ? 'There is indeed a ' + value + ' in the stats of the card to find, but it is not its tavern tier.'
                    : 'There is indeed a ' + value + ' in the stats of the card to find, but it is not its mana cost.';
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
            hasBeenRestored: "You've restored 2 health.",
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
			heroPowerChoice6_Title: 'Listen quietly',
			heroPowerChoice7_Title: 'Capture colors',
			heroPowerChoice8_Title: 'Set up focus',
			heroPowerChoice9_Title: 'Aim straight',
            heroPowerChoice10_Title: 'Study the specimen',
            heroPowerChoice11_Title: 'Decipher the texts',
            heroPowerChoice1_Description: '<br />Reveal the rarity of the card to find.<br /><br />',
            heroPowerChoice2_Description: '<br />Reveal the class of the card to find.<br /><br />',
            heroPowerChoice3_Description: '<br />Reveal the expansion of the card to find.<br />',
            heroPowerChoice4_Description: '<br />Reveal the initials of the name of the card to find.<br />',
            heroPowerChoice5_Description: '<br /><b>We messed up!</b><br />Let\'s switch the card to find...<br />',
			heroPowerChoice6_Description: '<br />Reveal the flavor text of the card to find.<br />',
			heroPowerChoice7_Description: 'Reveal a pixelated version of the illustration of the card to find.<br />',
			heroPowerChoice8_Description: 'Reveal a better version of the illustration of the card to find.<br />',
			heroPowerChoice9_Description: 'Reveal an even better version of the illustration of the card to find.<br />',
            heroPowerChoice10_Description: '<br />Reveal the minion type of the card to find.<br />',
            heroPowerChoice11_Description: '<br />Reveal a cryptic version of the text card.<br />',
            heroPower_AriaLabel: 'Looking for a clue',
            typeless: 'Typeless',
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
            formConfigLastExpansionMode: 'Only the last (or next) expansion',
            formConfigClassicMode: 'Classic',
            formConfigArenaMode: 'Arena',
            formConfigBattlegroundsMode: 'Battlegrounds',
			formConfigFirstClue: 'Clue revealed from the start',
			formConfigFlavorText: 'Flavor text',
			formConfigIllustration: 'Pixelated illustration',
			formConfigNone: 'None!',
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