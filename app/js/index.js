(function( $ ){
  'use strict';

  // TODO: change all 'let' and 'const' to 'var' as not all browsers support ES6
  // TODO: consider moving these constants and features out to a separate store
  // NOTE: Moving image implementation out to the css was a good move

  var CONSTANTS = {
    ERRORS: {
      FAILED_TO_INITIALISE: 'Sorry, but the application was not able to start.'
    },
    DEFAULTS: {
      DATA_URL: '/data/player-stats.json',
      PLAYER: 0,
      POSITION_NAMES: {
        'M': 'Midfielder',
        'D': 'Defender',
        'F': 'Forward',
        'G': 'Goalkeeper'
      }
    }
  };
  var FEATURES = {
    PLAYER_SELECT_TAG:    '#player-selector',
    PLAYER_IMGAGE_TAG:    '#player-image',
    PLAYER_BADGE_TAG:     '#team-badge',
    PLAYER_NAME_TAG:      '#player-name',
    PLAYER_POSITION_TAG:  '#player-position',
    STAT_PREFIX:          '#stat-'
  };

  var appData = {
    players: { }
  };

  function renderSelectOptions( options ){
    // clear player select and append new options
    var select = $(FEATURES.PLAYER_SELECT_TAG);
    select.children().remove();

    var length = options.length;
    for(var i=0;i<length;i++){
      select.append( options[i] );
    }
  }

  function populateSelectWithOptions( players ){
    var sortedPlayers = sortPlayersByNameThenSurname( players );
    var options = [ ];

    // build up options for the select tag
    for( var idx in sortedPlayers ){
      var player = sortedPlayers[idx];
      options.push( newOption( player.player ) );
    }

    renderSelectOptions( options );
  }

  function newOption( player ){
    return $('<option value="'+player.id+'">'+playerName(player.name)+'</option>');
  }

  function sortPlayersByNameThenSurname( items ){
    return items.sort( function( a, b ){
      if ( a.player.name.first === b.player.name.first ){
        return a.player.name.last > b.player.name.last;
      }
      return a.player.name.first > b.player.name.first;
    });
  }

  function playerName( playerName ){
    return playerName.first +' '+ playerName.last;
  }

  function renderPlayer( playerId ){
    appData.nextPlayer = appData.playerMapById[ playerId ];
    if ( !appData.currentPlayer ){
      appData.currentPlayer = appData.nextPlayer;
    }

    // set pictures // by doing this we remove the complexity of choosing images into the css
    $( FEATURES.PLAYER_IMGAGE_TAG ).removeClass( 'player-p'+appData.currentPlayer.player.id             ).addClass( 'player-p'+appData.nextPlayer.player.id );
    $( FEATURES.PLAYER_BADGE_TAG  ).removeClass( 'badge-' +appData.currentPlayer.player.currentTeam.id ).addClass( 'badge-' +appData.nextPlayer.player.currentTeam.id );

    // set stats
    var statKeys = Object.keys( appData.nextPlayer.stats );
    for( var stat in statKeys ){
      var selector = FEATURES.STAT_PREFIX + appData.nextPlayer.stats[stat].name; // stat elements must have the id set to the stat.name
      $(selector).text( appData.nextPlayer.stats[stat].value );
    }

    // update name
    $( FEATURES.PLAYER_NAME_TAG ).text( playerName( appData.nextPlayer.player.name ) );

    // update position
    $( FEATURES.PLAYER_POSITION_TAG ).text( positionToText( appData.nextPlayer.player ) );

    // swap out currentPlayer and swap in nextPlayer
    appData.currentPlayer = appData.nextPlayer;
    appData.nextPlayer = undefined;
  }

  function positionToText( player ){
    return CONSTANTS.DEFAULTS.POSITION_NAMES[ player.info.position ];
  }

  function retrievePlayerData( ){
    return pegasus( CONSTANTS.DEFAULTS.DATA_URL );
  }

  function updatePlayerCards( data ){
    appData.players = data.players;
    appData.playerMapById = {};

    // build map for renderPlayer and select.option.value
    var idx = appData.players.length;
    for( var i=0; i<idx;i++){
      var aPlayer = appData.players[i];
      appData.playerMapById[ aPlayer.player.id ] = aPlayer;
    }

    // render default player
    var defaultPlayer = appData.players[0].player.id;
    renderPlayer( defaultPlayer );

    return appData.players;
  }

  function receiveDataAndBootstrapApp( data ){
    var players = updatePlayerCards( data );

    populateSelectWithOptions( players );

    $( FEATURES.PLAYER_SELECT_TAG ).on( 'change', function( data ){
      var playerId = data.target.value;
      renderPlayer( playerId );
    });
    $( FEATURES.PLAYER_SELECT_TAG ).trigger('change');
  }

  function renderConnectionError( ){
    renderMessage( CONSTANTS.ERRORS.FAILED_TO_INITIALISE );
  }

  function renderMessage( msg ){
    alert( msg );
  }

  function initialise( ){
    var promise = retrievePlayerData( );
    promise.then( receiveDataAndBootstrapApp, renderConnectionError );
  }

  initialise();

})( $ );

