'use strict';

app.controller("CheckListController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "CHECKLIST";

    $scope.startupdata = {
        sub_type_ref: []

    };


    $scope.ShowHide = {
        SearchBox: false
    };


    $scope.dynamicCSS = {
        has_success_error: ""
    };


    $scope.validation = {
        isvalid: false,
        error_msg: ""
    };
    $scope.selecteddata = {
       
    };

    $scope.filters = {
    };


    $scope.GridData = {
        data: []
    };


    $scope.tmp_data = null;


    /****************************************************************************************************/
    //Start-up functions

    function startup() {

        var type_ref_id = 1;
        var promiseGet;
        promiseGet = crudServiceController.get(type_ref_id, "COMMON", 'SubTypesForType');
        promiseGet.success(function (data) {
            $scope.startupdata.sub_type_ref = data;

        },
            function (error1) {
                $log.error('failure startup SubTypesForType', error1);
            });


    }


    /****************************************************************************************************/
    //ui-grid 

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button> </div>';

    $scope.gridOptionsCheckList = {

        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridData.data',
        columnDefs: [
       { name: 'View', field: 'checklist_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "150" },
       { name: 'Checklist Name', field: 'checklist_nm' },
       { name: 'Type', field: 'sub_type_nm', width: "200" }

        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ChecklistDetails(row.entity.checklist_id);

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
            console.log(response.data);
            $scope.tmp_data = angular.copy($scope.data);
            if ($scope.IsEdit) {
                $scope.validation.isvalid = true;
                $scope.dynamicCSS.has_success_error = "";
            }
            $scope.open('lg');
            return defer.promise;
        });
    }




    $scope.ShowDetails = function (row) {
        $scope.IsEdit = true;
        $scope.GetDetail(row.entity.checklist_id);
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
                var promisePut = crudServiceController.delete(row.entity.checklist_id, CONTROLLERNAME).then(function (pl) {
                    $scope.Message = "Successfuly completed.";
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
        if ($scope.data.checklist_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME);
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.checklist_id, $scope.data, CONTROLLERNAME);
        }

        promisePut.then(function (pl) {
            $scope.Message = "Successfuly completed.";
            search();
        }, function (err) {
            console.log("Err" + err);
        });
    }


    /****************************************************************************************************/
    //Add New - Clear all input fields

    $scope.AddNew = function () {
        $scope.IsEdit = false;
        $scope.dynamicCSS.has_success_error = "";
        $scope.GetDetail(0);
    };
    /****************************************************************************************************/


    /****************************************************************************************************/
    //Delete record upon confirmation



    $scope.Delete = function (row) {
        var bodyText = 'ID : ' + row.entity.checklist_id + ' : ' + row.entity.checklist_nm + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

    }

    // Function to load all Configurations records






    function search() {

        var filterparameters = {
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'Checklist'); //The Method Call from service to get all data;
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
