/*
 * The analyze module handles the view that loads when a user clicks on
 * "Analyze" in the nav bar.
 */
angular.module('adage.analyze', [
  'adage.analyze.search',
  'adage.analyze.detail',
  'adage.analyze.analysis', // includes sample-bin
  'adage.sampleBin.addItem',
  'ui.router',
  'ui.bootstrap',
  'as.sortable',
  'ngAnimate',
  'ngSanitize'
])

.config(function config($stateProvider) {
  $stateProvider.state('analyze', {
    url: '/analyze?mlmodel',
    views: {
      'main': {
        controller: 'AnalyzeCtrl',
        templateUrl: 'analyze/analyze.tpl.html'
      }
    },
    data: {pageTitle: 'Analyze'}
  });
})

.controller('AnalyzeCtrl', ['$scope', '$stateParams', '$log', '$location',
  'Sample', 'SampleBin',
  function AnalyzeCtrl($scope, $stateParams, $log, $location, Sample,
                       SampleBin) {
    $scope.isValidModel = false;
    // Do nothing if mlmodel in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    $scope.modelInUrl = $stateParams.mlmodel;

    $scope.analyze = {
      itemStyle: function(searchItem) {
        // Determine which CSS classes should apply to this searchItem.
        // We want Experiments and Samples to look different. Also, if we are
        // looking at detail on this searchItem, it should be highlighted.
        var classList = searchItem.itemType;
        if ($scope.detail.showing &&
            searchItem.pk === $scope.detail.searchItem.pk) {
          classList += ' active';
        }
        return classList;
      },

      scrollToId: function(id) {
        $location.hash(id);
      }
    };
  }
])
;
