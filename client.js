(function(window) {
    function getHearthstoneMetadaFromLocalStorage(locale) {
        try {
            return JSON.parse(localStorage.getItem('hsMetadata.' + locale));
        } catch (e) {
            return null;
        };
    }

    function Client(onReadyCallback, onRequetError) {
        this.locale = window.currentLocale;

        this.cardSetGroup = localStorage.getItem('user_mode') || 'standard';

        this.accessToken = localStorage.getItem('accessToken') || null;
        this.accessTokenExpires = localStorage.getItem('accessTokenExpires') || 0;
        
        this.hearthstoneMetadata = {
            fr_FR:  getHearthstoneMetadaFromLocalStorage('fr_FR'),
            en_US:  getHearthstoneMetadaFromLocalStorage('en_US'),
        };

        this.hearthstoneMetadataExpires = {
            fr_FR: localStorage.getItem('hsMetadataExpires.fr_FR') || 0,
            en_US: localStorage.getItem('hsMetadataExpires.en_US') || 0,
        };

        this.searchCache = {};
        this.onReadyCallbacks = [];
        this.onRequetError = onRequetError || function() {};
 
        this.onReady(onReadyCallback);

        this.init();
    }

    Client.prototype.isReady = function() {
        return this.accessToken && this.accessTokenExpires && this.hearthstoneMetadata[this.locale] && this.hearthstoneMetadataExpires[this.locale];
    };

    Client.prototype.init = function() {
        var that = this;

        if (that.isReady()) {
            return;
        }

        that.fetchMetadata().then(function() {
            that.onReadyCallbacks.forEach(function(callback) {
                callback(that);
            });

            that.onReadyCallbacks = [];
        });
    };

    Client.prototype.onReady = function(callback) {
        if (this.isReady()) {
            callback(this);
        } else {
            this.onReadyCallbacks.push(callback);
        }
    };
    
    Client.prototype.setLocale = function(locale) {
        this.locale = locale;
        this.init();
    };

    Client.prototype.setCardSetGroup = function(cardSetGroup) {
        this.cardSetGroup = cardSetGroup;
    };

    Client.prototype.checkAccessTokenExpiration = function() {
        var that = this;

        if (that.accessTokenExpires <= Date.now()) {
            return that.fetchToken();
        }

        return Promise.resolve();
    };

    Client.prototype.catchRequestError = function (request) {
        return request.then(function (response) {
            if (!response.ok) {
                throw new Error(response);
            }
            return response.json();
        }).catch(this.onRequetError);
    }

    Client.prototype.getMetadata = function () {
        if (!this.hearthstoneMetadata[this.locale] || this.hearthstoneMetadataExpires[this.locale] <= Date.now()) {
            return this.fetchMetadata();
        }

        return Promise.resolve(this.hearthstoneMetadata[this.locale]);
    };
    
    Client.prototype.fetchMetadata = function() {
        var that = this;

        return that.checkAccessTokenExpiration().then(function() {
            var url = 'https://eu.api.blizzard.com/hearthstone/metadata?locale=' + that.locale;

            var requestHeaders = new Headers({
                Authorization: 'Bearer ' + that.accessToken,
            });

            var requestOptions = {
                method: 'GET',
                headers: requestHeaders,
            };

            return that.catchRequestError(fetch(url, requestOptions)).then(function (metadata) {
                    var ONE_HOUR = 60 * 60 * 1000;

                    that.hearthstoneMetadata[that.locale] = metadata;
                    that.hearthstoneMetadataExpires[that.locale] = Date.now() + ONE_HOUR;

                    localStorage.setItem('hsMetadata.' + that.locale, JSON.stringify(metadata));
                    localStorage.setItem('hsMetadataExpires.' + that.locale, that.hearthstoneMetadataExpires[that.locale]);

                    return metadata;
                });
        });
    };

    Client.prototype.executeGetCardsRequest = function (queryParams) {
        var that = this;

        return that.checkAccessTokenExpiration().then(function() {
            var finalQueryParams = {
                locale: that.locale,
                gameMode: 'constructed',
                collectible: 1,
                set: that.cardSetGroup,
                ...(queryParams || {}),
            };
    
            var url = 'https://eu.api.blizzard.com/hearthstone/cards?';
    
            url += Object.keys(finalQueryParams).map(function(paramName) {
                var paramValue = finalQueryParams[paramName];
                return paramName + '=' + paramValue;
            }).join('&');
    
            var requestHeaders = new Headers({
                Authorization: 'Bearer ' + that.accessToken,
            });
    
            var requestOptions = {
                method: 'GET',
                headers: requestHeaders,
            };
    
            return that.catchRequestError(fetch(url, requestOptions));
        });
    };

    Client.prototype.fetchToken = function() {
        var that = this;
    
        var tokenApiUrl  = 'https://eu.battle.net/oauth/token';
    
        var oauthFormData = new FormData();
        oauthFormData.append('grant_type', 'client_credentials');
    
    
        var oauthHeaders = new Headers({
            Authorization: 'Basic ZDQ1OGJiNjAxZTQ2NDczNjlkNzUwYTU4MDhhZmMwZjA6THc4WUprdGhyUlV3Z3Nob09tREhjN3lvMFNaeVgxc20=',
        });
    
        return that.catchRequestError(fetch(tokenApiUrl, {
            method: 'POST',
            body: oauthFormData,
            headers: oauthHeaders
        }))
            .then(function (response) {
                var TEN_MINUTES_IN_MS = 1000 * 60 * 10;
                that.accessToken = response.access_token;
                that.accessTokenExpires = Date.now() + (response.expires_in * 1000) - TEN_MINUTES_IN_MS;

                localStorage.setItem('accessToken', that.accessToken);
                localStorage.setItem('accessTokenExpires', that.accessTokenExpires);
    
                return that;
            })
            .catch(that.onRequetError);
    };
    
    Client.prototype.fetchRandomCard = function() {
        var that = this;

        return that.getTotalCardsOfCardSetGroup(that.cardSetGroup).then(function (totalOfCards) {     
            var page = Math.floor(
                Math.random() * (totalOfCards - 1) + 1
            );
    
            return that.executeGetCardsRequest({
                pageSize: 1,
                page: page,
            }).then(function(response) {
                return response.cards[0];
            });
        });
    };
    
    Client.prototype.searchByCardName = function(nameToSearch) {
        var that = this;
    
        var cleanedNameToSearch = (
            nameToSearch
                .toLowerCase()
        );

        var cacheKey = cleanedNameToSearch + that.cardSetGroup;
    
        if (that.searchCache[cacheKey]) {
            return Promise.resolve(that.searchCache[cacheKey]);
        }

        return this.executeGetCardsRequest({ textFilter: cleanedNameToSearch }).then((response) => {
            var cards = response.cards
                .filter(function (cardToFilder, indexToFilter, allCards) {
                    return allCards.findIndex(function (card) {
                        return card.name === cardToFilder.name;
                    }) === indexToFilter;
                });

            that.searchCache[cacheKey] = cards;
            
            return cards;
        });
    };

    Client.prototype.getTotalCardsOfCardSetGroup = function(cardSetGroupSlug) {
        return this.getMetadata().then(function (metadata) {
            function cardSetGroupCorrespondingToSlug(setGroup) {
                return setGroup.slug === cardSetGroupSlug;
            }
    
            function getCardSetCorrespongingToSlug(cardSetSlug) {
                return function(cardSet) {
                    return cardSet.slug === cardSetSlug;
                };
            }
    
            function getTotalOfCollectibleCardsFromCardSetSlug(cardSetSlug) {
                return metadata.sets.find(getCardSetCorrespongingToSlug(cardSetSlug)).collectibleCount;
            }
    
            function sum(total, num) {
                return total + num;
            };
    
            return metadata.setGroups
                .find(cardSetGroupCorrespondingToSlug).cardSets
                .map(getTotalOfCollectibleCardsFromCardSetSlug)
                .reduce(sum, 0);
        });
    };

    Client.prototype.getRarityName = function(rarityId) {
        return this.getMetadata().then(function(metadata) {
            var correspondingRarity = metadata.rarities.find(function (rarity) {
                return rarity.id === rarityId;
            });

            return correspondingRarity ? correspondingRarity.name : 'Unknwon';
        });
    };

    Client.prototype.getClass = function(classId) {
        return this.getMetadata().then(function(metadata) {
            return metadata.classes.find(function(classToCheck) {
                return classToCheck.id === classId;
            });
        });
    };

    Client.prototype.getCardSet = function(setId) {
        return this.getMetadata().then(function(metadata) {
            var correspondingSet = metadata.sets.find(function (cardSet) {
                var aliasSetIds =  cardSet.aliasSetIds || [];

                return cardSet.id === setId || aliasSetIds.indexOf(setId) !== -1;
            });

            return correspondingSet || {};
        });
    };

    window.Client = Client;
})(window);