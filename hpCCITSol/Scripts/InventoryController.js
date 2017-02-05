'use strict';

app.controller("InventoryController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', 'CommonServices', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', 'ngNotify', 'uiGridGroupingConstants', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, CommonServices, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams, ngNotify, uiGridGroupingConstants) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "INVENTORY";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);
    $scope.reportdata = null;

    $scope.startupdata = {
        server_type_ref: [],
        deployment_environment_ref: [],
        deployment_mse_environment_ref: [],
        application_ref: [],
        server_ref:[]
    };

    $scope.dynamicCSS = {
        has_success_error: ""
    };


    $scope.validation = {
        isvalid: false,
        error_msg: ""
    };


    $scope.GridData = {
        data: []
    };

    $scope.GridSummaryData = {
        data: []
    };


    $scope.tmp_data = null;


    /****************************************************************************************************/
    //Start-up functions

    function startup() {

        var promiseGet = crudService.masterdata();
        promiseGet.success(function (data) {
            $scope.startupdata.server_type_ref = data["servertypes"];
            $scope.startupdata.deployment_environment_ref = data["deploymentenvironments"];
            $scope.startupdata.deployment_mse_environment_ref = data["deployment_mse_environments"];
            $scope.startupdata.deployment_type_ref = data["deploymenttypes"];
            $scope.startupdata.application_ref = data["applications"];
            $scope.startupdata.server_ref = data["servers"];
            
        },
        function (error1) {
            $log.error('failure startup masterdata', error1);
        });



        var promiseGet;
        promiseGet = crudServiceController.getAllActionData("COMMON", 'APITypes');
        promiseGet.success(function (data) {
            $scope.startupdata.api_type_ref = data;

        },
        function (error1) {
            $log.error('failure startup APITypes', error1);
        });

        promiseGet = crudServiceController.getAllActionData("COMMON", 'Clients');
        promiseGet.success(function (data) {
            $scope.startupdata.client_ref = data;

        },
        function (error1) {
            $log.error('failure startup Clients', error1);
        });

        promiseGet = crudServiceController.getAllActionData("COMMON", 'Application');
        promiseGet.success(function (data) {
            $scope.startupdata.application_ref = data;

        },
        function (error1) {
            $log.error('failure startup Application', error1);
        });


    }


    /****************************************************************************************************/
    //ui-grid 

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)"><span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)"><span class="glyphicon glyphicon-remove"></span></button>' +
                                    ' </div>';


    $scope.gridOptions1 = {
        enableSorting: true,
        enableFiltering: true,
        enableHorizontalScrollbar: 2, /* WHEN_NEEDED */
        enableVerticalScrollbar: 2,/* WHEN_NEEDED */
        enableGridMenu: true,
        exporterCsvFilename: 'Inventory_' + new Date().toLocaleDateString() + '.csv',
        data: 'GridData.data',
        columnDefs: [
      { name: 'View', field: 'inventory_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "75" },
       { name: 'Environment', field: 'deployment_environment_nm', width: '125' },
       { name: 'MSE', field: 'deployment_mse_environment_nm', width: '150' },
       { name: 'Server Type', field: 'server_type_nm', width: '125' },
       { name: 'Application', field: 'application_nm', width: '125' },
       { name: 'Name', field: 'inventory_nm', width: '125' },
       { name: 'Port', field: 'port_number', width: '50' },
       { name: 'Website', field: 'website_nm', width: '100' },
       { name: 'VD', field: 'virtual_directory', cellTooltip: function (row, col) { return row.entity.virtual_directory } },
       { name: 'Physical Path', field: 'physical_path', width: '100', cellTooltip: function (row, col) { return row.entity.physical_path } ,visible: false},
       { name: 'HTTPS', field: 'is_https', width: '50' },
        { name: 'Metadata', field: 'metadata', visible: false, cellTooltip: function (row, col) { return row.entity.metadata } },
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
        }


    };



    $scope.gridOptionsSummary = {
        enableSorting: true,
        enableFiltering: true,
        treeRowHeaderAlwaysVisible: false,
        enableHorizontalScrollbar: 2, /* WHEN_NEEDED */
        enableVerticalScrollbar: 2,/* WHEN_NEEDED */
        enableGridMenu: true,
        exporterCsvFilename: 'InventorySummary_' + new Date().toLocaleDateString() + '.csv',
        data: 'GridSummaryData.data',
        columnDefs: [
       { name: 'Environment', field: 'deployment_environment_nm', grouping: { groupPriority: 0 }, width: '125' },
       { name: 'MSE', field: 'deployment_mse_environment_nm', grouping: { groupPriority: 1 }, width: '150' },
       { name: 'Server Type', field: 'server_type_nm', grouping: { groupPriority: 2 }, width: '125' },
       { name: 'Application', field: 'application_nm', grouping: { groupPriority: 3 }, width: '125' },
       { name: 'Name', field: 'inventory_nm', visible: false },
       { name: 'Server', field: 'server_nm',  width: '125' },
       { name: 'URL', field: 'auto_validation_url', cellTooltip: function (row, col) { return row.entity.auto_validation_url }, cellTemplate: '<div style="vertical-align: middle"><a target="_blank" ng-href="{{COL_FIELD}}">{{COL_FIELD}}</a></div>' },
       { name: 'Port', field: 'port_number', width: '50', visible: false },
       { name: 'Website', field: 'website_nm', width: '100', visible: false },
       { name: 'VD', field: 'virtual_directory', width: '100', visible: false },
       { name: 'Physical Path', field: 'physical_path', width: '100', cellTooltip: function (row, col) { return row.entity.physical_path }, visible: false },
       { name: 'HTTPS', field: 'is_https', width: '50', visible: false },
        { name: 'Metadata', field: 'metadata', visible: false }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi1 = gridApi;
        }
    };



    /****************************************************************************************************/
    //Get single record : Detail based on id
    //tmp_xxx variables are for client side editing/updating

    var defer = $q.defer();
    $scope.GetDetail = function (id) {

        crudServiceController.get(id, CONTROLLERNAME).then(function (response) {
            defer.resolve(response.data);
            $scope.data = response.data;
            $scope.tmp_data = angular.copy($scope.data);
            $scope.open('lg');
            return defer.promise;
        });
    }


    $scope.ShowDetails = function (row) {
        $scope.IsEdit = true;
        $scope.GetDetail(row.entity.inventory_id);
    }


    $scope.ShowSummary = function () {

        var filterparameters = {
            startdate: $rootScope.dates.startdate,
            enddate: $rootScope.dates.enddate
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'InventorySummary'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.GridSummaryData.data = data;
            if (!$scope.$$phase) {
                $scope.$apply();
            }


            var uibModalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'myModalContentInventoryGroups.html',
                controller: 'ModalConfirmInstanceCtrl',
                scope: $scope,
                size: 'lg',
                resolve: {
                    data: function () {
                        return $scope.tmp_data;
                    }
                }
            });
            //Save
            uibModalInstance.result.then(function (updateddata) {
            }, function () {
            });



        },

        function (error1) {
            $log.error('failure in search', error1);
        });


    };

    /****************************************************************************************************/
    //Dialog - Configuration Detail for Add / Edit

    $scope.open = function (size) {
        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myModalContent.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_data;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_data = updateddata;
            Save();
        }, function () {

        });
    };


    $scope.openDialogConfirm = function (row, headerText, bodyText, closeButtonText, actionButtonText) {

        $scope.modalOptionsheaderText = headerText;
        $scope.modalOptionsbodyText = bodyText;
        $scope.modalOptionscloseButtonText = closeButtonText;
        $scope.modalOptionsactionButtonText = actionButtonText;
        $scope.data = false;
        var uibModalInstance = $uibModal.open({
            animation: true,
            //templateUrl: 'myModalDailogContent.html',
            templateUrl: '/Content/others/myModalDailogContent.html',
            controller: 'ModalConfirmInstanceCtrl',
            scope: $scope,
            size: 'sm',
            resolve: {
                data: function () {
                    return $scope.data;
                }
            }
        });


        //Delete
        uibModalInstance.result.then(function (updateddata) {
            $scope.data = updateddata;
            if (updateddata) {
                var promisePut = crudServiceController.delete(row.entity.inventory_id, CONTROLLERNAME).then(function (pl) {
                    ngNotify.set('Successfully deleted', { type: 'warn' });
                    $scope.deleteflag = true;///// start here
                    search();
                }, function (err) {
                    console.log("Err" + err);
                });
            }
        }, function () {

        });
    };






    /****************************************************************************************************/
    //Validate before Save

    $scope.ValidateData = function () {

    }


    /****************************************************************************************************/
    //The Save scope method use to define the Configuration object.
    //In this method if IsNewRecord is not zero then Update Configuration else 
    //Create the Configuration information to the server

    function Save() {

        //extend: to, from
        $scope.data = angular.extend($scope.data, $scope.tmp_data);
        var promisePut;
        if ($scope.data.inventory_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME);
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.inventory_id, $scope.data, CONTROLLERNAME);
        }

        promisePut.then(function (pl) {
            ngNotify.set('Successfully saved', { type: 'success' });
            search();
        }, function (err) {
            ngNotify.set('Failed while saving - ' + err, { type: 'error' });
            console.log("Err" + err);
        });
    }


    /****************************************************************************************************/
    //Add New - Clear all input fields

    $scope.AddNew = function () {
        $scope.GetDetail(0);
    };
    /****************************************************************************************************/


    /****************************************************************************************************/
    //Delete record upon confirmation



    $scope.Delete = function (row) {
        var bodyText = 'ID : ' + row.entity.inventory_id + ' : ' + row.entity.inventory_nm + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

    }

    // Function to load all Configurations records





    function search() {

        var filterparameters = {
            startdate: $rootScope.dates.startdate,
            enddate: $rootScope.dates.enddate
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'Inventory'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.GridData.data = data;
            if (!$scope.$$phase) {
                $scope.$apply();
            }

        },

        function (error1) {
            $log.error('failure in search', error1);
        });
    }


    startup();
    search();
}]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('myModule').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
    $scope.ok = function (isvalid) {
        if (isvalid) $uibModalInstance.close(data);
    };



    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };


});

angular.module('myModule').controller('ModalConfirmInstanceCtrl', function ($scope, $uibModalInstance, data) {


    $scope.ok = function (btnresponse) {
        $uibModalInstance.close(btnresponse);   //true
    };



    $scope.close = function (btnresponse) {
        $uibModalInstance.close(btnresponse);       //false
    };


});

angular.module('myModule').controller('DatepickerCtrl', function ($scope, $rootScope) {

    $scope.is_open_dates = {
        startdate: false,
        enddate: false
    };


    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    };

    //$scope.toggleMin = function () {
    //    $scope.minDate = $scope.minDate ? null : new Date();
    //};

    //$scope.toggleMin();
    $scope.maxDate = new Date(2020, 5, 22);

    //$scope.open1 = function () {
    //    $scope.popup1.opened = true;
    //};

    //$scope.open2 = function () {
    //    $scope.popup2.opened = true;
    //};

    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];


    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events =
      [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
      ];

    $scope.toggleOpenDatePicker = function ($event, datePicker) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.is_open_dates[datePicker] = !$scope.is_open_dates[datePicker];
    };


    $scope.getDayClass = function (date, mode) {
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    };

});