'use strict';

app.controller("CheckListTemplateController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "CHECKLIST";

    $scope.startupdata = {
        sub_type_ref:[]
 
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


    $scope.GridDataCheckListTempalte = {
        data: []
    };
    $scope.GridDataCheckListAction = {
        data: []
    };
    $scope.TemaplateInfo=null;

    $scope.tmp_data = null;
    $scope.tmp_mapping_data = null;


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
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>' +
                                    ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowCheckListTemplateMapping(row.entity.checklist_template_id)">Items<span class="glyphicon glyphicon-add"></span></button> </div>';

    $scope.gridOptions = {

        enableSorting: true,
        enableGridMenu: true,
        enableRowSelection: false,
        enableSelectAll: true,
        enableFiltering: true,
        data: 'GridData.data',
        columnDefs: [
       { name: 'View', field: 'checklist_template_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "210" },
       { name: 'Template Name', field: 'checklist_template_nm' },
        { name: 'Type', field: 'sub_type_nm', width: "200" }
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
        crudServiceController.get(id, CONTROLLERNAME, 'ChecklistTemplate').then(function (response) {
            defer.resolve(response.data);
            $scope.data = response.data;
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
        $scope.GetDetail(row.entity.checklist_template_id);
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
                var promisePut = crudServiceController.delete(row.entity.checklist_template_id, CONTROLLERNAME, 'ChecklistTemplate').then(function (pl) {
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
        if ($scope.data.checklist_template_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME, 'ChecklistTemplate');
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.checklist_template_id, $scope.data, CONTROLLERNAME, 'ChecklistTemplate');
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
        var bodyText = 'ID : ' + row.entity.checklist_template_id + ' : ' + row.entity.checklist_template_nm + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

    }


    //**********************************************************************************************************************
    // Template Mapping - Start
    //**********************************************************************************************************************

    $scope.gridOptionsCheckListAction = {
        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridDataCheckListAction.data',
        columnDefs: [
       { name: 'Check List Items', field: 'checklist_nm', cellTooltip: function (row, col) { return row.entity.checklist_nm } },
        { name: 'Type', field: 'sub_type_nm', width: "175" }
],
        onRegisterApi: function (gridApi) {
            $scope.gridApiCheckListAction = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ShowHide.SearchBox = true;

            });
        }
    };


    var myDetailsCheckListTempalte = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowCheckListTemplateItem(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.DeleteCheckListTemplateItem(row)">Delete <span class="glyphicon glyphicon-remove"></span></button> </div>';


    $scope.gridOptionsCheckListTempalte = {
        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridDataCheckListTempalte.data',
        columnDefs: [
        { name: 'View', field: 'checklist_template_xref_id', cellTemplate: myDetailsCheckListTempalte, enableFiltering: false, width: "140" },
        { name: 'Selected Items', field: 'checklist_nm', cellTooltip: function (row, col) { return row.entity.checklist_nm } },
        { name: 'Type', field: 'sub_type_nm', width: "175" },
        { name: 'Priority', field: 'priority_order', width:75 }

        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApiCheckListTempalate = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ShowHide.SearchBox = true;

            });
        }
    };


    $scope.ShowCheckListTemplateItem = function (row) {
        $scope.IsEdit = true;
        $scope.checklist_nm=row.entity.checklist_nm;
        $scope.GetCheckListTemplateItem(row.entity.checklist_template_xref_id);
    }


    var defer = $q.defer();
    $scope.GetCheckListTemplateItem = function (id) {
        crudServiceController.get(id, CONTROLLERNAME, 'CheckListTemplateItem').then(function (response) {
            defer.resolve(response.data);
            $scope.data = response.data;
            $scope.tmp_data_chklist_xref = angular.copy($scope.data);
            $scope.openCheckListTemplateItem('lg');
            return defer.promise;
        });
    }

    $scope.openCheckListTemplateItem = function (size) {
        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'Model_template_xref_id_Edit.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_data_chklist_xref;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_data_chklist_xref = updateddata;
            SaveCheckListTemplateItem();
        }, function () {

        });
    };

    function SaveCheckListTemplateItem() {

        //extend: to, from
        $scope.data = angular.extend($scope.data, $scope.tmp_data_chklist_xref);


        var promisePut;
        promisePut = crudServiceController.put($scope.data.checklist_template_xref_id, $scope.data, CONTROLLERNAME, 'CheckListTemplateItem');

        promisePut.then(function (pl) {
            $scope.Message = "Successfuly completed.";
            $scope.GetCheckListTemplateItems($scope.checklist_template_id);
            //search();
        }, function (err) {
            console.log("Err" + err);
        });
    }

    $scope.DeleteCheckListTemplateItem = function (row) {
        var bodyText = 'ID : ' + row.entity.checklist_template_xref_id + ' : ' + row.entity.checklist_nm + '  Are you sure to delete?';
        $scope.openDeleteCheckListTemplateItem(row, 'Delete', bodyText, 'Cancel', 'Delete');

    }

    $scope.openDeleteCheckListTemplateItem = function (row, headerText, bodyText, closeButtonText, actionButtonText) {

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
                    return $scope.tmp_data_chklist_xref;
                }
            }
        });


        //Delete
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_data_chklist_xref = updateddata;
            if (updateddata) {
                var promisePut = crudServiceController.delete(row.entity.checklist_template_xref_id, CONTROLLERNAME,'CheckListTemplateItem').then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.deleteflag = true;///// start here
                    $scope.GetCheckListTemplateMapping($scope.checklist_template_id);
                }, function (err) {
                    console.log("Err" + err);
                });
            }
        }, function () {

        });
    };




    $scope.GetCheckListTemplateMapping= function (checklist_template_id) {
        $scope.checklist_template_id=checklist_template_id;

        var filterparameters = {
            checklist_template_id: checklist_template_id
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'CheckListTemplateMapping'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.tmp_mapping_data = data;

            $scope.GridDataCheckListTempalte.data = data["CheckListTemplateItems"];
            $scope.GridDataCheckListAction.data = data["CheckListItems"];
            $scope.TemaplateInfo = data["TemaplateInfo"];
        },

        function (error1) {
            $log.error('failure in search', error1);
        });
   
    }

    $scope.GetCheckListTemplateItems = function (checklist_template_id) {
        $scope.checklist_template_id=checklist_template_id;

        var promiseGet1 = crudServiceController.get($scope.checklist_template_id, CONTROLLERNAME, 'CheckListTemplateItems'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.GridDataCheckListTempalte.data = data;
        },

        function (error1) {
            $log.error('failure in GetCheckListTemplateItems', error1);
        });
   
    }

    $scope.ShowCheckListTemplateMapping= function (checklist_template_id) {
        $scope.GetCheckListTemplateMapping(checklist_template_id);
        $scope.openCheckListTemplateMapping('lg');
    }





    /****************************************************************************************************/
    //Template Mapping- Dialog

    $scope.openCheckListTemplateMapping = function (size) {

        //$templateCache.remove('myReport.html');

        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myTemplateMapping.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_mapping_data;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.tmp_mapping_data = updateddata;
            //$scope.SaveMapping();
        }, function () {

        });
    };


    $scope.SaveMapping= function () {

        var SelectedItemsToBeSaved = $scope.gridApiCheckListAction.selection.getSelectedRows();
        var SelectedItemsToBeDeleted = $scope.gridApiCheckListTempalate.selection.getSelectedRows();
        //extend: to, from

        var parameters = {
            checklist_template_id : $scope.checklist_template_id,
            datatoadd: [],
            datatodelete : []
        };
        parameters.datatoadd = SelectedItemsToBeSaved;
        parameters.datatodelete = SelectedItemsToBeDeleted;

        var promisePut;
        //Update
        promisePut = crudServiceController.post(parameters, CONTROLLERNAME, 'SaveCheckListTemplateMapping');

        promisePut.then(function (pl) {
            $scope.Message = "Successfuly completed.";
            $scope.GetCheckListTemplateMapping($scope.checklist_template_id);

        }, function (err) {
            console.log("Err" + err);
        });
    }


    //**********************************************************************************************************************
    // Template Mapping - End
    //**********************************************************************************************************************




    function search() {

        var filterparameters = {
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'ChecklistTemplate'); //The Method Call from service to get all data;
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
