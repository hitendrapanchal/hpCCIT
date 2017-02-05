'use strict';

app.controller("APIMgmtController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', 'CommonServices', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, CommonServices, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "APIMGMT";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);
    $scope.reportdata = null;

    $scope.startupdata = {
        application_ref: [],
        api_type_ref: [],
        client_ref: []
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


    $scope.tmp_data = null;


    /****************************************************************************************************/
    //Start-up functions

    function startup() {

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

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>' +
                                    ' </div>';


    $scope.gridOptions1 = {

       // enableFullRowSelection: true,
       // enableRowSelection: true,
        //multiSelect: false,
        enableGridMenu: true,
        exporterCsvFilename: 'APIDetails_' + new Date().toLocaleDateString() + '.csv',
        data: 'GridData.data',
        enableFiltering: true,
        columnDefs: [
       { name: 'View', field: 'api_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "150" },
       { name: 'Client', field: 'client_nm' },
       { name: 'API Type', field: 'api_type_nm' },
       { name: 'Application', field: 'application_nm' },
       { name: 'API Name', field: 'api_name' },
       { name: 'Dev Int v', field: 'api_dev_int_version' },
       { name: 'DEV_INT Metadata', field: 'api_dev_int_metadata', visible: false },
       { name: 'QA v', field: 'api_qa_version' },
       { name: 'QA Metadata', field: 'api_qa_metadata', visible: false },
       { name: 'Prod v', field: 'api_prod_version' },
       { name: 'Prod Metadata', field: 'api_prod_metadata', visible: false },
       { name: 'Prod Queue/Url', field: 'api_prod_url', cellTooltip: function (row, col) { return row.entity.api_prod_url } },
        { name: 'API Metadata', field: 'api_metadata', visible: false },
        { name: 'Comments', field: 'api_comments', visible: false }
],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ReportDetails(row.entity.api_id);

            });


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
        $scope.GetDetail(row.entity.api_id);
    }


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
                var promisePut = crudServiceController.delete(row.entity.api_id, CONTROLLERNAME).then(function (pl) {
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
        if ($scope.data.api_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME);
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.api_id, $scope.data, CONTROLLERNAME);
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
        var bodyText = 'ID : ' + row.entity.api_id + ' : ' + row.entity.api_name + '  Are you sure to delete?';
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
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'APIMgmt'); //The Method Call from service to get all data;
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