appInit.$inject = [];
export function appInit(){
  
};

routing.$inject = ['$urlRouterProvider', '$locationProvider'];
export function routing($urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  // Need to check here the url that was found
  $urlRouterProvider.otherwise('/');
}