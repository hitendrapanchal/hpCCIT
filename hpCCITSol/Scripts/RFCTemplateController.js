'use strict';

app.controller("RFCTemplateController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "RELEASE";

    $scope.startupdata = {
        server_type_ref:[],
        deployment_environment_ref:[],
        deployment_mse_environment_ref:[],
        deployment_type_ref :[],
        statuses: [],
        applications: [],
        reportparts: [],
        rfctemplatefiles:[]
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
       applications:[]
    };

    $scope.filters = {
    };


    $scope.GridData = {
        data: []
    };

    $scope.GridDataRFCTemplateDetails= {
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
            $scope.startupdata.statuses = data["statuses"];
            $scope.startupdata.applications = data["applications"];
            $scope.startupdata.reportparts = data["reportparts"];
        },
        function (error1) {
            $log.error('failure startup masterdata', error1);
        });



        //Get RFC Templates file list on start up
        promiseGet = crudServiceController.getAllActionData("COMMON", 'RFCTemplateFiles');
        promiseGet.success(function (data) {
            $scope.startupdata.rfctemplatefiles = data;
        },
        function (error1) {
            $log.error('failure startup RFCTemplateFiles', error1);
        });


    }




    /****************************************************************************************************/
    //ui-grid 

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>' +
                                   ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowRFCTemplateDetails(row.entity.rfc_template_id)">Details</button> </div>';

    $scope.gridOptions = {

        enableSorting: true,
        enableGridMenu: true,
        enableRowSelection: false,
        enableSelectAll: true,
        enableFiltering: true,
        data: 'GridData.data',
        columnDefs: [
        { name: 'View', field: 'rfc_template_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "200" },
        { name: 'RFC Template Name', field: 'rfc_template_nm', width: "400" },
        { name: 'Environment', field: 'deployment_environment_nm'},
        { name: 'MSE Env', field: 'deployment_mse_environment_nm' },
        { name: 'Deployment Type', field: 'deployment_type_nm' }
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ShowHide.SearchBox = true;

            });


        }


    };



    /****************************************************************************************************/
    //Get single record : Detail based on id
    //tmp_xxx variables are for client side editing/updating

    var defer = $q.defer();
    $scope.GetDetail = function (id) {
        crudServiceController.get(id, CONTROLLERNAME, 'RFCTemplate').then(function (response) {
            defer.resolve(response.data);
            $scope.data = response.data["rfctemplate"];
            $scope.tmp_data = angular.copy($scope.data);
            $scope.selecteddata.applications = response.data["applications"];

            $scope.SetSelectedData($scope.tmp_data);

            if ($scope.IsEdit) {
                $scope.validation.isvalid = true;
                $scope.dynamicCSS.has_success_error = "";
            }
            $scope.open('lg');
            return defer.promise;
        });
    }

    $scope.SetSelectedData = function (tmp_data) {
        $rootScope.SetSelectedTickedValue($scope.startupdata.applications, $scope.selecteddata.applications, "application_id")
    }


    /*************************************************************************************************************************
    RFC Template Details - Start
    *************************************************************************************************************************/
    var myRFCDetailCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowRFCTemplateDetailEntry(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.DeleteRFCTemplateDetail(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>' +
                                   ' </div>';


    $scope.gridOptionsRFCTemplateDetails = {
        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridDataRFCTemplateDetails.data',
        columnDefs: [
       { name: 'View', field: 'rfc_template_detail_id', cellTemplate: myRFCDetailCellTemplate, enableFiltering: false, width: "150" },
       { name: 'Report Part', field: 'report_part_nm', width: "150" },
        {name: 'Details', field: 'rfc_template_detail_nm'}

        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApiRFCTemplateDetails = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ShowHide.SearchBox = true;

            });
        }
    };

    $scope.ShowRFCTemplateDetails = function (rfc_template_detail_id) {
        $scope.GetRFCTemplateDetails(rfc_template_detail_id);
        $scope.openRFCTemplateDetails('lg');
    }


    $scope.GetRFCTemplateDetails = function (rfc_template_id) {
        $scope.rfc_template_id = rfc_template_id;

        var filterparameters = {
            rfc_template_id: rfc_template_id
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(filterparameters, CONTROLLERNAME, 'RFCTemplateDetails'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.tmp_data_details = data;

            $scope.GridDataRFCTemplateDetails.data = data["rfctemplatedetails"];

            if (!$scope.$$phase) {
                $scope.$apply();
            }

        },

        function (error1) {
            $log.error('failure in search', error1);
        });

    }


    $scope.openRFCTemplateDetails = function (size) {

        //$templateCache.remove('myReport.html');

        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myRFCTemplateDetail.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_data_detail;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_data_detail = updateddata;
            //search();
        }, function () {

        });
    };

    /**********************RFC Template Details - END**************************************************/


    /**********************************************************************************************************
    RFC Template Detail - Entry - START
    ***********************************************************************************************************/

    $scope.AddNewRFCTemplateDetail = function () {
        $scope.IsEdit = false;
        $scope.dynamicCSS.has_success_error = "";
        $scope.GetRFCTemplateDetail(0);
    };

    $scope.ShowRFCTemplateDetailEntry = function (row) {
        $scope.IsEdit = true;
        $scope.GetRFCTemplateDetail(row.entity.rfc_template_detail_id);
    }

    $scope.openRFCTemplateDetailEntry = function (size) {
        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'RFCTemplateDetailEntry.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_data_rfc_detail;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_data_rfc_detail = updateddata;
            SaveRFCTemplateDetailEntry();
        }, function () {

        });
    };

    $scope.GetRFCTemplateDetail = function (id) {
        crudServiceController.get(id, CONTROLLERNAME, 'RFCTemplateDetail').then(function (response) {
            defer.resolve(response.data);
            $scope.data = response.data;
            $scope.tmp_data_rfc_detail = angular.copy($scope.data);
            $scope.tmp_data_rfc_detail.rfc_template_id = $scope.rfc_template_id;

            $scope.openRFCTemplateDetailEntry('lg');
            return defer.promise;
        });
    }

    $scope.DeleteRFCTemplateDetail = function (row) {
        var bodyText = 'ID : ' + row.entity.rfc_template_detail_id + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete', true);

    }

    function SaveRFCTemplateDetailEntry() {

        //extend: to, from
        $scope.data = angular.extend($scope.data, $scope.tmp_data_rfc_detail);
        
        var promisePut;
        if ($scope.data.rfc_template_detail_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME, 'RFCTemplateDetail');
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.rfc_template_detail_id, $scope.data, CONTROLLERNAME, 'RFCTemplateDetail');
        }

        promisePut.then(function (pl) {
            $scope.Message = "Successfuly completed.";
            $scope.GetRFCTemplateDetails($scope.rfc_template_id);
            
        }, function (err) {
            console.log("Err" + err);
        });
    }

    /**********************RFC Template Detail - Entry - END**************************************************/




    $scope.ShowDetails = function (row) {
        $scope.IsEdit = true;
        $scope.GetDetail(row.entity.rfc_template_id);
    }


    /****************************************************************************************************/
    //Dialog - Add / Edit

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


    $scope.openDialogConfirm = function (row, headerText, bodyText, closeButtonText, actionButtonText, isRFCDetail) {

        $scope.modalOptionsheaderText = headerText;
        $scope.modalOptionsbodyText = bodyText;
        $scope.modalOptionscloseButtonText = closeButtonText;
        $scope.modalOptionsactionButtonText = actionButtonText;
        $scope.modalisRFCDetail = isRFCDetail;
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
                var actionname = 'RFCTemplate';
                var id = 0;
                if ($scope.modalisRFCDetail) {
                    actionname = 'RFCTemplateDetail';
                    id = row.entity.rfc_template_detail_id;
                }
                else {
                    id = row.entity.rfc_template_id;
                }

                var promisePut = crudServiceController.delete(id, CONTROLLERNAME, actionname).then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.deleteflag = true;///// start here

                    if ($scope.modalisRFCDetail) {
                        $scope.GetRFCTemplateDetails($scope.rfc_template_id);
                    }
                    else {
                        search();
                    }

                }, function (err) {
                    console.log("Err" + err);
                });
            }
        }, function () {

        });
    };


    function AddTickedForMultiSelect() {
        $rootScope.AddTicked($scope.startupdata.applications, false);
    }


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

        var DataToSave = {
            data: [],
            applications: []
        };

        DataToSave.data = $scope.data;
        DataToSave.applications = angular.extend(DataToSave.applications, $scope.selecteddata.applications);

        $rootScope.RemoveTicked(DataToSave.applications);


        var promisePut;
        if ($scope.data.rfc_template_id == 0) //Add
        {
            promisePut = crudServiceController.post(DataToSave, CONTROLLERNAME, 'RFCTemplate');
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.rfc_template_id, DataToSave, CONTROLLERNAME, 'RFCTemplate');
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
        var bodyText = 'ID : ' + row.entity.rfc_template_id + ' : ' + row.entity.rfc_template_nm + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete', false);

    }




    function search() {

        var filterparameters = {
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'RFCTemplate'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.GridData.data = data["rfctemplates"];

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
