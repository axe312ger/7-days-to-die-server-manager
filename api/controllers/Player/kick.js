var sevenDays = require('machinepack-7daystodiewebapi');

module.exports = {

  friendlyName: 'Kick player',

  description: 'Kick a player from the server',

  inputs: {
    playerId: {
      description: 'The ID of the player',
      type: 'number',
      required: true
    },
    reason: {
      description: 'Reason the player gets kicked',
      type: 'string'
    }
  },

  exits: {
    success: {},
    notFound: {
      description: 'No player with the specified ID was found in the database.',
      responseType: 'notFound'
    }
  },

  /**
   * @memberof Player
   * @description Kick a player
   * @method kick
   * @param {string} steamId  Steam ID of the player
   * @param {string} serverId  ID of the server
   */

  fn: async function (inputs, exits) {

    try {

      let player = await Player.findOne(inputs.playerId).populate('server');
      let server = await SdtdServer.findOne(player.server.id);
      return sevenDays.kickPlayer({
        ip: server.ip,
        port: server.webPort,
        authName: server.authName,
        authToken: server.authToken,
        playerId: player.steamId,
        reason: inputs.reason
      }).exec({
        error: function (error) {
          return exits.error(error);
        },
        unknownPlayer: function () {
          return exits.notFound('Cannot kick player, invalid ID given!');
        },
        success: function (response) {
          sails.log.info(`API - Player:kick - Kicking player from server ${inputs.serverId}`, {player});
          return exits.success(response);
        }
      });

    } catch (error) {
      sails.log.error(`API - Player:kick - ${error}`, {playerId: inputs.playerId});
      return exits.error(error);
    }




  }
};
