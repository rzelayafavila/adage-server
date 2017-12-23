/**
 * "adage.enriched_signatures" module.
 */

angular.module('adage.enrichedSignatures', [
  'ui.router',
  'adage.tribe_client.resource',
  'adage.gene.resource'
])

.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('enriched_signatures', {
    url: '/signature/enriched_signatures?mlmodel&genes',
    views: {
      main: {
        templateUrl: 'signature/enriched_signatures.tpl.html',
        controller: 'EnrichedSignaturesCtrl as ctrl'
      }
    },
    data: {pageTitle: 'Enriched Signatures'}
  });
}])

.controller('EnrichedSignaturesCtrl', ['$stateParams', 'Signature', '$log',
  'errGen', 'Participation', 'MathFuncts', 'Gene',
  function EnrichedSignatureController($stateParams, Signature, $log, errGen,
                                       Participation, MathFuncts, Gene) {
    var self = this;
    self.isValidModel = false;
    // Do nothing if the model ID in URL is falsey. The error will be taken
    // care of by "<ml-model-validator>" component.
    if (!$stateParams.mlmodel) {
      return;
    }

    self.statusMessage = 'Connecting to the server ...';

    // For the moment, the total number of genes in our universe
    // to perform this enrichment analysis, is the total number of
    // Entrez IDs in our database for Pseudomonas aeruginosa.
    Gene.get(
      {},
      function success(response) {
        self.geneNum = response.meta.total_count;
      },
      function error(err) {
        var message = errGen('Failed to get total gene number: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }
    );


    // Do nothing if no genes are specified in URL.
    if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
      self.statusMessage = 'No genes are specified.';
      self.enrichedSignatures = [];
      return;
    }

    self.pValueCutoff = 0.05;
    var pValueSigDigits = 3;

    // This is an object, of signatures per participation type
    var signtrsPerPT = {};

    var relevantSignatureArray = [];

    // This is the main function that calculates the signature enrichments.
    // It calculates the enrichment for each signature that has participatory
    // genes which were in the url genes (the genes searched).
    var calculateEnrichments = function(geneGenesets, allGenesetInfo,
                                        totalGeneNum, cutoff) {
      var N = totalGeneNum;

      // This will be the number of genes from the high weight gene list
      // that are also present in any of the genesets that were returned
      var m = 0;

      // Fill out the genesetGenes object
      for (var i = 0; i < $scope.genes.length; i++) {
        var genesetList = null;
        var geneEntrezID = $scope.genes[i].entrezID;

        if (geneGenesets.hasOwnProperty(geneEntrezID)) {
          genesetList = geneGenesets[geneEntrezID];

          if (genesetList && genesetList.length > 0) {
            m += 1;
          }

          for (var j = 0; j < genesetList.length; j++) {
            var genesetID = genesetList[j];
            if (!genesetGenes[genesetID]) {
              genesetGenes[genesetID] = [];
            }
            genesetGenes[genesetID].push($scope.genes[i]);
          }
        } else {
          $log.warn('Entrez ID: ' + geneEntrezID + ' not found in ' +
                    'genesets.');
        }
      }

      var pValueArray = [];

      var enrichedGenesetIDs = Object.keys(genesetGenes);

      for (i = 0; i < enrichedGenesetIDs.length; i++) {
        var k = genesetGenes[enrichedGenesetIDs[i]].length;
        var n = allGenesetInfo[enrichedGenesetIDs[i]].size;

        var pValue = 1 - MathFuncts.hyperGeometricTest(k, m, n, N);
        pValueArray.push(pValue);
      }

      var correctedPValues = MathFuncts.multTest.fdr(pValueArray);

      for (i = 0; i < enrichedGenesetIDs.length; i++) {
        var correctedPValue = correctedPValues[i].toPrecision(
          pValueSigDigits);

        if (correctedPValue < self.pValueCutoff) {
          var gsID = enrichedGenesetIDs[i];
          var genesetInfoObj = allGenesetInfo[gsID];

          relevantSignatureArray.push({
            'name': genesetInfoObj.name, 'dbase': genesetInfoObj.dbase,
            'url': genesetInfoObj.url, 'pValue': correctedPValue,
            'genes': genesetGenes[gsID].map(function(gene) {
              return gene.stdName;
            }).join(' ')
          });
        }
      }

      relevantSignatureArray.sort(function(a, b) {
        return a.pValue - b.pValue;
      });

      return relevantSignatureArray;
    };


    Participation.get(
      {'mlmodel': self.modelInUrl, 'gene__in': $stateParams.genes, 'limit': 0},
      function success(response) {
        var allParticipations = response.objects;
        console.log(allParticipations);

        for (var i = 0; i < allParticipations.length; i++) {
          var participType = allParticipations[i].participation_type.name;

          if (!signtrsPerPT[participType]) {
            signtrsPerPT[participType] = {};
          }

          var signatureId = allParticipations[i].signature;

          if (!signtrsPerPT[participType][signatureId]) {
            signtrsPerPT[participType][signatureId] = [];
          }

          var geneId = allParticipations[i].gene.id;

          // Check if gene id is already in this signature's array. If not,
          // push it to this array
          if (signtrsPerPT[participType][signatureId].indexOf(geneId) === -1) {
            signtrsPerPT[participType][signatureId].push(geneId);
          }
        }

        var participationTypes = Object.keys(signtrsPerPT);

        for (var i = 0; i < participationTypes.length; i++) {
          var signatures = signtrsPerPT[participationTypes[i]];
          var signatureIds = Object.keys(signatures);

          for (var i = 0; i < signatureIds.length; i++) {
            var signatureId = signatureIds[i];
            var genes = signatures[signatureId];

          }
        }

        console.log(signtrsPerPT);

        self.statusMessage = '';

        // self.enrichedGenesets = calculateEnrichments(
        //   genesetsPerGene, gsInfoArray,
        //   totGeneNum, self.pValueCutoff
        // );
      },
      function error(err) {
        var message = errGen('Failed to get gene participations: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }

    );





    Signature.get(
      {mlmodel: self.modelInUrl, limit: 0},
      function success(response) {
        self.signatures = response.objects;
        self.statusMessage = '';
      },
      function error(err) {
        var message = errGen('Failed to get signatures: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }
    );
  }
])

;
