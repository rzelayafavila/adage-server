angular.module('adage', [
  'templates-app',
  'templates-common',
  'adage.home',
  'adage.about',
  'adage.analyze',
  'adage.analyze.analysis',
  'adage.analyze.sampleBin',
  'adage.download',
  'adage.tribe_client',
  'adage.gene.searchFew',
  'adage.gene.searchMany',
  'adage.gene.network',
  'adage.node',
  'adage.help',
  'adage.sampleAnnotation',
  'adage.volcano-plot.view',
  'ui.router',
  'ngResource'
])

.config(function myAppConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/home');
})

// This configuration is required for all REST calls to the back end.
.config(['$resourceProvider', function($resourceProvider) {
  // Don't strip trailing slashes from calculated URLs.
  $resourceProvider.defaults.stripTrailingSlashes = false;
}])

.controller('AppCtrl', ['$scope', '$state', 'UserFactory',
  function AppCtrl($scope, $state, UserFactory) {
    // Function that indicates whether the current state is 'gene_search'
    // or 'gene_network'. It will be used in index.html to highlight the
    // 'GeneNetwork' tab on web UI in either state.
    $scope.inGeneStates = function() {
      var currState = $state.current.name;
      return currState === 'gene_search' || currState === 'gene_network';
    };

    $scope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams) {
        if (angular.isDefined(toState.data.pageTitle)) {
          $scope.pageTitle = toState.data.pageTitle + ' | adage';
        }
      });

    UserFactory.getPromise().then(function() {
      $scope.userObj = UserFactory.getUser();
    });
  }
])
;
