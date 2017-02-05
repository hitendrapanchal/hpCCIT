'use strict';

app.controller("ModelController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "MODEL";

   
    $scope.startupdata = {
        applications: [],
        sprints: [],
        scopes: [],
        statuses: []
    };




    $scope.selecteddata = {
        application: [],
        sprint: [],
        scope : [],
        status: []
    };

    $scope.filters = {
        sprint_nm: "",
        application_nm: "",
        work_item_nm: "",
        scope : null,
        scope_id: 0,
        sprint_id: null,
        application_id: null,
        modified_usr_id: "",
        release_nm:"",
        startdate :null,
        enddate:null
    } ;

   

    /****************************************************************************************************/
    //Start-up functions

    $scope.startup = function () {

  

    }


    
            
            /****************************************************************************************************/
            $scope.SearchClear = function () {

                    $scope.filters.sprint_nm= "";
                    $scope.filters.application_nm="";
                    $scope.filters.work_item_nm="";
                    $scope.filters.scope=null;
                    $scope.filters.sprint = null;
                    $scope.filters.scope_id = 0;
                    $scope.filters.sprint_id=null;
                    $scope.filters.application_id=null;
                    $scope.filters.modified_usr_id="";
                    $scope.filters.startdate;
                    $scope.filters.enddate;

                    $rootScope.dates.startdate=null;
                    $rootScope.dates.enddate=null;

            };



        }]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('myModule').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {

 
    $scope.ok = function () {
        $uibModalInstance.close(data);
    };



    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


});


