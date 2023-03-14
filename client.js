var HEARTHSTONE_CARD_TYPE_IDS = {
  HERO: 3,
  MINION: 4,
  SPELL: 5,
  WEAPON: 7,
  LOCATION: 39,
};

(function (window) {
  let lastExpansioName = null;

  function getHearthstoneMetadaFromLocalStorage(locale) {
    try {
      return JSON.parse(localStorage.getItem("hsMetadata." + locale));
    } catch (e) {
      return null;
    }
  }

  function Client(onReadyCallback, onRequetError) {
    this.locale = window.currentLocale;

    this.cardSetGroup = localStorage.getItem("user_mode") || "standard";

    this.accessToken = localStorage.getItem("accessToken") || null;
    this.accessTokenExpires = localStorage.getItem("accessTokenExpires") || 0;

    this.hearthstoneMetadata = {
      fr_FR: getHearthstoneMetadaFromLocalStorage("fr_FR"),
      en_US: getHearthstoneMetadaFromLocalStorage("en_US"),
      totalBattlegroundsCard:
        getHearthstoneMetadaFromLocalStorage("totalBattlegroundsCard") || 0,
    };

    this.hearthstoneMetadataExpires = {
      fr_FR: localStorage.getItem("hsMetadataExpires.fr_FR") || 0,
      en_US: localStorage.getItem("hsMetadataExpires.en_US") || 0,
      totalBattlegroundsCard:
        localStorage.getItem("hsMetadataExpires.totalBattlegroundsCard") || 0,
    };

    this.searchCache = {};
    this.onReadyCallbacks = [];
    this.onRequetError = onRequetError || function () {};

    this.onReady(onReadyCallback);

    this.init();
  }

  Client.prototype.saveMetadataInStorage = function (storageKey, value) {
    var ONE_HOUR = 60 * 60 * 1000;

    this.hearthstoneMetadata[storageKey] = value;
    this.hearthstoneMetadataExpires[storageKey] = Date.now() + ONE_HOUR;

    localStorage.setItem("hsMetadata." + storageKey, JSON.stringify(value));
    localStorage.setItem(
      "hsMetadataExpires." + storageKey,
      this.hearthstoneMetadataExpires[storageKey]
    );
  };

  Client.prototype.isReady = function () {
    return (
      this.accessToken &&
      this.accessTokenExpires &&
      this.hearthstoneMetadata[this.locale] &&
      this.hearthstoneMetadataExpires[this.locale]
    );
  };

  Client.prototype.init = function () {
    var that = this;

    if (that.isReady()) {
      return;
    }

    that.fetchMetadata().then(function () {
      that.onReadyCallbacks.forEach(function (callback) {
        callback(that);
      });

      that.onReadyCallbacks = [];
    });
  };

  Client.prototype.onReady = function (callback) {
    if (this.isReady()) {
      callback(this);
    } else {
      this.onReadyCallbacks.push(callback);
    }
  };

  Client.prototype.setLocale = function (locale) {
    this.locale = locale;
    this.init();
  };

  Client.prototype.setCardSetGroup = function (cardSetGroup) {
    this.cardSetGroup = cardSetGroup;
  };

  Client.prototype.checkAccessTokenExpiration = function () {
    var that = this;

    if (that.accessTokenExpires <= Date.now()) {
      return that.fetchToken();
    }

    return Promise.resolve();
  };

  Client.prototype.catchRequestError = function (request) {
    return request
      .then(function (response) {
        if (!response.ok) {
          throw new Error(response);
        }
        return response.json();
      })
      .catch(this.onRequetError);
  };

  Client.prototype.getMetadata = function () {
    if (
      !this.hearthstoneMetadata[this.locale] ||
      this.hearthstoneMetadataExpires[this.locale] <= Date.now()
    ) {
      return this.fetchMetadata();
    }

    return Promise.resolve(this.hearthstoneMetadata[this.locale]);
  };

  Client.prototype.fetchMetadata = function () {
    var that = this;

    return that.checkAccessTokenExpiration().then(function () {
      var url =
        "https://eu.api.blizzard.com/hearthstone/metadata?locale=" +
        that.locale;

      var requestHeaders = new Headers({
        Authorization: "Bearer " + that.accessToken,
      });

      var requestOptions = {
        method: "GET",
        headers: requestHeaders,
      };

      return that
        .catchRequestError(fetch(url, requestOptions))
        .then(function (metadata) {
          that.saveMetadataInStorage(that.locale, metadata);
          return metadata;
        });
    });
  };

  Client.prototype.fetchTotalBattlegroundsCards = function () {
    var that = this;

    return that.executeGetCardsRequest().then(function (response) {
      that.saveMetadataInStorage("totalBattlegroundsCards", response.cardCount);
      return response.cardCount;
    });
  };

  Client.prototype.fetchTotalArenaCards = function () {
    var that = this;

    return that.executeGetCardsRequest().then(function (response) {
      that.saveMetadataInStorage("totalArenaCards", response.cardCount);
      return response.cardCount;
    });
  };

  Client.prototype.isBattlegrounds = function () {
    return this.cardSetGroup === "battlegrounds";
  };

  Client.prototype.isArena = function () {
    return this.cardSetGroup === "arena";
  };

  Client.prototype.isClassic = function () {
    return this.cardSetGroup === "classic";
  };

  Client.prototype.isLastExpansion = function () {
    return this.cardSetGroup === "lastExpansion";
  };

  Client.prototype.executeGetCardsRequest = function (queryParams) {
    var that = this;

    function executeRequest(finalQueryParams) {
      var url = "https://eu.api.blizzard.com/hearthstone/cards?";

      url += Object.keys(finalQueryParams)
        .map(function (paramName) {
          var paramValue = finalQueryParams[paramName];
          return paramName + "=" + paramValue;
        })
        .join("&");

      var requestHeaders = new Headers({
        Authorization: "Bearer " + that.accessToken,
      });

      var requestOptions = {
        method: "GET",
        headers: requestHeaders,
      };

      return that.catchRequestError(fetch(url, requestOptions));
    }

    return that.checkAccessTokenExpiration().then(function () {
      if (that.isLastExpansion()) {
        return that.getLastExpansionData().then(function (lastExpansionData) {
          var finalQueryParams = {
            locale: that.locale,
            set: lastExpansionData.slug,
            ...(queryParams || {}),
          };

          return executeRequest(finalQueryParams);
        });
      }

      var finalQueryParams = {
        locale: that.locale,
        gameMode: "constructed",
        collectible: 1,
        set: that.cardSetGroup,
        ...(queryParams || {}),
      };

      if (that.isBattlegrounds()) {
        finalQueryParams.gameMode = "battlegrounds";
        finalQueryParams.type = "minion";
        delete finalQueryParams["set"];
        delete finalQueryParams["collectible"];
      } else if (that.isArena()) {
        finalQueryParams.gameMode = "arena";
        delete finalQueryParams["set"];
        delete finalQueryParams["collectible"];
      } else if (that.isClassic()) {
        finalQueryParams.set = "classic-cards";
      }

      return executeRequest(finalQueryParams);
    });
  };

  Client.prototype.fetchToken = function () {
    var that = this;

    var tokenApiUrl = "https://eu.battle.net/oauth/token";

    var oauthFormData = new FormData();
    oauthFormData.append("grant_type", "client_credentials");

    var oauthHeaders = new Headers({
      Authorization:
        "Basic ZDQ1OGJiNjAxZTQ2NDczNjlkNzUwYTU4MDhhZmMwZjA6THc4WUprdGhyUlV3Z3Nob09tREhjN3lvMFNaeVgxc20=",
    });

    return that
      .catchRequestError(
        fetch(tokenApiUrl, {
          method: "POST",
          body: oauthFormData,
          headers: oauthHeaders,
        })
      )
      .then(function (response) {
        var TEN_MINUTES_IN_MS = 1000 * 60 * 10;
        that.accessToken = response.access_token;
        that.accessTokenExpires =
          Date.now() + response.expires_in * 1000 - TEN_MINUTES_IN_MS;

        localStorage.setItem("accessToken", that.accessToken);
        localStorage.setItem("accessTokenExpires", that.accessTokenExpires);

        return that;
      })
      .catch(that.onRequetError);
  };

  Client.prototype.fetchRandomCard = function () {
    var that = this;
    var getTotalOfCards = null;

    switch (true) {
      case that.isBattlegrounds():
        getTotalOfCards = that.getTotalBattlegroundsCards();
        break;

      case that.isArena():
        getTotalOfCards = that.getTotalArenasCards();
        break;

      case that.isLastExpansion():
        getTotalOfCards = that.getLastExpansionCardCount();
        break;

      default:
        getTotalOfCards = that.getTotalCardsOfCardSetGroup(that.cardSetGroup);
        break;
    }

    return getTotalOfCards.then(function (totalOfCards) {
      var page = Math.floor(Math.random() * (totalOfCards - 1) + 1);

      return that
        .executeGetCardsRequest({
          pageSize: 1,
          page: page,
        })
        .then(function (response) {
          return response.cards[0];
        });
    });
  };

  Client.prototype.searchByCardName = function (nameToSearch) {
    var that = this;

    var cleanedNameToSearch = nameToSearch.toLowerCase();

    var cacheKey = cleanedNameToSearch + that.cardSetGroup;

    if (that.searchCache[cacheKey]) {
      return Promise.resolve(that.searchCache[cacheKey]);
    }

    return this.executeGetCardsRequest({
      textFilter: cleanedNameToSearch,
    }).then((response) => {
      var cards = response.cards.filter(function (
        cardToFilder,
        indexToFilter,
        allCards
      ) {
        return (
          allCards.findIndex(function (card) {
            return card.name === cardToFilder.name;
          }) === indexToFilter
        );
      });

      that.searchCache[cacheKey] = cards;

      return cards;
    });
  };

  Client.prototype.getTotalCardsOfCardSetGroup = function (cardSetGroupSlug) {
    return this.getMetadata().then(function (metadata) {
      function cardSetGroupCorrespondingToSlug(setGroup) {
        return setGroup.slug === cardSetGroupSlug;
      }

      function getCardSetCorrespongingToSlug(cardSetSlug) {
        return function (cardSet) {
          return cardSet.slug === cardSetSlug;
        };
      }

      function getTotalOfCollectibleCardsFromCardSetSlug(cardSetSlug) {
        return metadata.sets.find(
          getCardSetCorrespongingToSlug(cardSetSlug)
        ).collectibleRevealedCount;
      }

      function sum(total, num) {
        return total + num;
      }

      return metadata.setGroups
        .find(cardSetGroupCorrespondingToSlug)
        .cardSets.map(getTotalOfCollectibleCardsFromCardSetSlug)
        .reduce(sum, 0);
    });
  };

  Client.prototype.getTotalBattlegroundsCards = function () {
    if (
      !this.hearthstoneMetadata.totalBattlegroundsCards ||
      this.hearthstoneMetadataExpires.totalBattlegroundsCards <= Date.now()
    ) {
      return this.fetchTotalBattlegroundsCards();
    }

    return Promise.resolve(this.hearthstoneMetadata.totalBattlegroundsCards);
  };

  Client.prototype.getTotalArenasCards = function () {
    if (
      !this.hearthstoneMetadata.totalArenaCards ||
      this.hearthstoneMetadataExpires.totalArenaCards <= Date.now()
    ) {
      return this.fetchTotalArenaCards();
    }

    return Promise.resolve(this.hearthstoneMetadata.totalArenaCards);
  };

  Client.prototype.getRarityName = function (rarityId) {
    return this.getMetadata().then(function (metadata) {
      var correspondingRarity = metadata.rarities.find(function (rarity) {
        return rarity.id === rarityId;
      });

      return correspondingRarity ? correspondingRarity.name : "Unknwon";
    });
  };

  Client.prototype.getMinionTypes = function (card) {
    var minionTypeIds = [card.minionTypeId];

    if (card.multiTypeIds && card.multiTypeIds.length) {
      card.multiTypeIds.forEach(function (typeId) {
        minionTypeIds.push(typeId);
      });
    }

    return this.getMetadata().then(function (metadata) {
      var correspondingTypes = metadata.minionTypes.filter(function (
        minionType
      ) {
        return minionTypeIds.indexOf(minionType.id) > -1;
      });

      return correspondingTypes;
    });
  };

  Client.prototype.getClass = function (classId) {
    return this.getMetadata().then(function (metadata) {
      return metadata.classes.find(function (classToCheck) {
        return classToCheck.id === classId;
      });
    });
  };

  Client.prototype.getCardSet = function (setId) {
    return this.getMetadata().then(function (metadata) {
      var correspondingSet = metadata.sets.find(function (cardSet) {
        var aliasSetIds = cardSet.aliasSetIds || [];

        return cardSet.id === setId || aliasSetIds.indexOf(setId) !== -1;
      });

      return correspondingSet || {};
    });
  };

  Client.prototype.getLastExpansionData = function () {
    return this.getMetadata().then(function (metadata) {
      return metadata.sets.find(function (setToCheck) {
        return (
          setToCheck.type === "expansion" ||
          setToCheck.type === "adventure" ||
          setToCheck.id === 1809 // Hotfix because "Festival of Legends" does not have any type yet...
        );
      });
    });
  };

  Client.prototype.getLastExpansionCardCount = function () {
    return this.getLastExpansionData().then(function (expansionData) {
      return expansionData.collectibleRevealedCount;
    });
  };

  window.Client = Client;
})(window);
