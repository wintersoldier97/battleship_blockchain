function state($stateProvider) {

  $stateProvider
    .state('game', {
      url: '/game/:id',
      template: '<game></game>'
    });
}

state.$inject = ['$stateProvider'];

export default state;