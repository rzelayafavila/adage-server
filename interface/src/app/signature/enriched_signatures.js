/**
 * "adage.enrichedSignatures" module.
 */

angular.module('adage.enrichedSignatures', [
  'ui.router',
  'adage.signature.resources',
  'adage.participation.resources',
  'adage.gene.resource',
  'greenelab.stats'
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

    // Do nothing if no genes are specified in URL.
    if (!$stateParams.genes || !$stateParams.genes.split(',').length) {
      self.statusMessage = 'No genes are specified.';
      self.enrichedSignatures = [];
      return;
    }

    var userSelectedGenes = $stateParams.genes.split(',')

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

    self.pValueCutoff = 0.05;
    var pValueSigDigits = 3;

    // This is an object, of signatures per participation type
    var signtrsPerPT = {};

    self.enrichedSignatures = {};

    // This is the main function that calculates the signature enrichments.
    // It calculates the enrichment for each signature that has participatory
    // genes which were in the url genes (the genes searched).
    var calculateEnrichments = function(totalGeneNum, signature, cutoff) {
      // For the moment, this is the total number of Entrez IDs for
      // Pseudomonas in the database.
      var N = totalGeneNum;

      // This will be the number of genes in the url (which are the genes the
      // user selected in the previous page)
      var m = userSelectedGenes.length;

      var pValueArray = [];

      var signatureIds = Object.keys(signatures);

      for (var i = 0; i < signatureIds.length; i++) {
        var signatureId = signatureIds[i];
        var genes = signatures[signatureId];
        var n = genes.length;
        var k = 0;

        for (i = 0; i < userSelectedGenes.length; i++) {
          var selectedGene = userSelectedGenes[i];
          if (genes.indexOf(selectedGene) > -1) {
            k++;
          }
        }

        var pValue = 1 - MathFuncts.hyperGeometricTest(k, m, n, N);
        pValueArray.push(pValue);
      }

      var significantSignatureArray = [];

      var correctedPValues = MathFuncts.multTest.fdr(pValueArray);

      for (i = 0; i < correctedPValues.length; i++) {
        var correctedPValue = correctedPValues[i].toPrecision(
          pValueSigDigits);

        if (correctedPValue < self.pValueCutoff) {
          var signatureId = signatureIds[i];
          var genes = signatures[signatureId];

          significantSignatureArray.push({
            'signatureId': signatureId, 'genes': genes,
            'pValue': correctedPValue
          });
        }
      }

      significantSignatureArray.sort(function(a, b) {
        return a.pValue - b.pValue;
      });

      return significantSignatureArray;
    };


    Participation.get(
      {'mlmodel': self.modelInUrl, 'gene__in': $stateParams.genes, 'limit': 0},
      function success(response) {
        var allParticipations = response.objects;

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

          self.enrichedSignatures[participationTypes[i]] = calculateEnrichments(
            totalGeneNum, signatures, self.pValueCutoff
          );
        }

        self.statusMessage = '';
      },
      function error(err) {
        var message = errGen('Failed to get gene participations: ', err);
        $log.error(message);
        self.statusMessage = message + '. Please try again later.';
      }

    );

  }
])

;
