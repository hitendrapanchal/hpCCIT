'use strict';

app.controller("ValidationController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "VALIDATION";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);
    $scope.reportdata = null;

    $scope.startupdata = {
        environments: [{ key: 'DEV_INT', value: 'DEV_INT' },
                        { key: 'QA', value: 'QA' },
                        { key: 'Prod', value: 'Prod' }],
        environment_types: [{ key: 'EnvA', value: 'EnvA' },
                        { key: 'EnvB', value: 'EnvB' }],
        app_cvpmt: [{ key: 'VSS-MT', value: 'VSS-MT' },
                        { key: 'VSS-CVP', value: 'VSS-CVP' },
                        { key: 'Both', value: 'Both' }],

        intervals: [{ key: 5, value: '5 Minutes' },
                    { key: 10, value: '10 Minutes' },
                    { key: 15, value: '15 Minutes' },
                    { key: 30, value: '30 Minutes' },
                    { key: 60, value: '1 Hours' },
                    { key: 120, value: '2 Hours' },
                    { key: 180, value: '3 Hours' }
        ],
        reportoutputs: [{ key: 1, value: 'CSV' }, { key: 2, value: 'HTML' }, { key: 3, value: 'PDF' }]
    };


    $scope.filters = {
        source_env: null,
        source_envtype: null,
        target_env: null,
        target_envtype: null,
        app_cvpmt: null,
        startdate: null,
        enddate: null
    };


    $scope.GridData = {
        data: []
    };


    /****************************************************************************************************/
    //Start-up functions

    function startup() {

        $scope.filters.source_envtype = $scope.startupdata.environment_types[0].key;
        $scope.filters.target_envtype = $scope.startupdata.environment_types[1].key;

        $scope.filters.source_env = $scope.startupdata.environments[1].key;
        $scope.filters.target_env = $scope.startupdata.environments[2].key;

        $scope.filters.app_cvpmt = $scope.startupdata.app_cvpmt[2].key;

    }


    /****************************************************************************************************/
    //ui-grid 

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                    ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowReportScheduler(row.entity.report_id)">Scheduler</button> </div>';


    $scope.gridOptions1 = {

        enableFullRowSelection: true,
        enableRowSelection: true,
        multiSelect: false,
        enableRowHeaderSelection: false,

        data: 'GridData.data',
        enableFiltering: true,
        columnDefs: [
       { name: 'View', field: 'report_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "250" },
       { name: 'Report Name', field: 'report_nm' },
       //{ name: 'Description', field: 'report_descr', width: "450" }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ReportDetails(row.entity.report_id);

            });


        }


    };



    $scope.ExecuteReport = function () {

        var filterparameters = {
            source_env: $scope.filters.source_env,
            source_envtype: $scope.filters.source_envtype,
            target_env: $scope.filters.target_env,
            target_envtype: $scope.filters.target_envtype,
            app_cvpmt: $scope.filters.app_cvpmt
        }

        var parameters = {
            param: filterparameters
        };


        console.log('In ExecuteReport');
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'ExecuteReport'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.GridData.data = data;
        },

        function (error1) {
            $log.error('failure in search', error1);
        });
    }


    startup();
}]);


