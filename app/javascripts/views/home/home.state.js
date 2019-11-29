function state($stateProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      template: '<home></home>'
    });
}

state.$inject = ['$stateProvider'];

export default state;