'use strict';

app.controller("CheckListActionController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "CHECKLISTACTION";
    
    $scope.startupdata = {

        ChecklistActionStatuses: [],
        search_for_options: [{ value: "ALL", name: 'ALL' },
                        { value: "COMPLETED", name: 'Completed checklists' },
                        { value: "INCOMPLETE", name: 'Open checklists' }
        ],
    };

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };

    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);


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
        checklist_action_xref_status_id: null
    };

    $scope.filters = {
        startdate: null,
        enddate: null,
        modified_usr_ids: "",
        search_for_options:null

    };


    $scope.GridData = {
        data: []
    };

    $scope.GridDataCheckListActionItems = {
        data: []
    };

    
    

    $scope.tmp_data = null;
    $scope.tmp_action_item_data = null;
    $scope.CheckListActionInfo = null;
    $scope.checklist_action_id = null;
    $scope.checklist_action_xref_id = null;

    /****************************************************************************************************/
    //Start-up functions

    function startup() {


        //Populate CheckListTemplate Dropdown
        var filterparameters = {};
        var parameters = {param: filterparameters };
        var promiseGet1 = crudServiceController.search(parameters, 'CHECKLIST', 'ChecklistTemplate'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.startupdata.checklisttemplates = data;
            if (!$scope.$$phase) {$scope.$apply();}
        },
        function (error1) {
            $log.error('failure in search', error1);
        });



    }


    /****************************************************************************************************/
    //ui-grid 

    var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)"><span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)"><span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                    ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowCheckListActions(row.entity.checklist_action_id)">Actions</button> </div>';


       $scope.gridOptionsCheckList = {

        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridData.data',
        columnDefs: [
       { name: 'View', field: 'checklist_action_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "125" },
       {
           name: 'Checklist Name', field: 'checklist_action_nm', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
               if (row.entity.NOTSTARTED == '0' && row.entity.INPROGRESS == '0') {
                   return 'selected';
               }
           }, cellTooltip: function (row, col) { return row.entity.checklist_action_nm }
       },
        { name: 'Type', field: 'sub_type_nm', width: "150", visible: false },
        { name: 'User', field: 'created_usr_id', width: "100" },
        { name: 'Start Dt', field: 'created_dtm', width: "85", type: 'date', cellFilter: 'date:\'dd-MMM-yy\'' },
        { name: 'Not Started', field: 'NOTSTARTED', width: "120" },
        { name: 'In Progress', field: 'INPROGRESS', width: "85" },
        { name: 'Not Appl.', field: 'NOTAPPLICABLE', width: "85" },
        { name: 'Completed', field: 'COMPLETED', width: "120" },
],
        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {

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
            $scope.SetSelectedData($scope.tmp_data);
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
        $scope.GetDetail(row.entity.checklist_action_id);
    }


    /****************************************************************************************************/

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
                var promisePut = crudServiceController.delete(row.entity.checklist_action_id, CONTROLLERNAME).then(function (pl) {
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
        $scope.data.checklist_template_id = ($scope.selecteddata.checklist_template.checklist_template_id == null ? null : $scope.selecteddata.checklist_template.checklist_template_id);

        var promisePut;
        if ($scope.data.checklist_action_id == 0) //Add
        {
            promisePut = crudServiceController.post($scope.data, CONTROLLERNAME);
        }
        else //Update
        {
            promisePut = crudServiceController.put($scope.data.checklist_action_id, $scope.data, CONTROLLERNAME);
        }

        promisePut.then(function (pl) {
            //$scope.Message = "Successfuly completed.";
            ngNotify.set('Successfully saved', { type: 'success' });

            search();
        }, function (err) {
            ngNotify.set('Failed while saving - ' + err, { type: 'error' });
        });
    }

    $scope.SetSelectedData = function (tmp_data) {
        $scope.selecteddata.checklist_template = $filter('filter')($scope.startupdata.checklisttemplates, { checklist_template_id: tmp_data.checklist_template_id })[0];
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
        var bodyText = 'ID : ' + row.entity.checklist_action_id + ' : ' + row.entity.checklist_action_nm + '  Are you sure to delete?';
        $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

    }

    // Function to load all Configurations records


    /****************************************************************************************************/
    //Check List Action Items - Start
    /****************************************************************************************************/

    var myActionCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowCheckListActionOnItem(row.entity.checklist_action_xref_id)">Action</button>&nbsp;' +
                                    ' <button type="button" ng-disabled="row.entity.powershell_script==null" class="btn btn-info btn-xs" ng-click="grid.appScope.ExecutePSCheckListActionOnItem(row.entity.checklist_action_xref_id)">Execute PS</button> </div>';


    $scope.gridOptionsCheckListActionItems = {
        enableSorting: true,
        enableFiltering: true,
        enableSelectAll: true,
        enableRowSelection: true,
        enableGridMenu: true,
        data: 'GridDataCheckListActionItems.data',
        columnDefs: [
       { name: 'View', field: 'checklist_action_xref_id', cellTemplate: myActionCellTemplate, enableFiltering: false, width: "160" },
       {name: 'Action Item', field: 'checklist_nm'},
        { name: 'Status', field: 'status_nm', width: "120" },
        {
            name: 'PS Execution details', field: 'powershell_script_execution_comments',
            cellTooltip: function (row, col) { return row.entity.powershell_script_execution_comments }
        }
       
        ],
        onRegisterApi: function (gridApi) {
            $scope.gridApiCheckListAction = gridApi;

            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.ShowHide.SearchBox = true;

            });
        }
    };
    $scope.ShowCheckListActions = function (checklist_action_id) {
        $scope.GetCheckListActions(checklist_action_id);
        $scope.openCheckListActionItems('lg');        
    }

    $scope.GetCheckListActions = function (checklist_action_id) {
        $scope.checklist_action_id = checklist_action_id;

        var filterparameters = {
            checklist_action_id: checklist_action_id
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'CheckListItemsDetail'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.tmp_mapping_data = data;
            
            $scope.GridDataCheckListActionItems.data = data["CheckListActionItems"];
            $scope.CheckListActionInfo = data["CheckListActionInfo"];

            if (!$scope.$$phase) {
                $scope.$apply();
            }

        },

        function (error1) {
            $log.error('failure in search', error1);
        });

    }


    $scope.openCheckListActionItems = function (size) {

        //$templateCache.remove('myReport.html');

        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myCheckListActionItems.html',
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
            search();
        }, function () {

        });
    };


    $scope.ShowCheckListActionOnItem = function (checklist_action_xref_id) {
        $scope.GetCheckListActionOnItem(checklist_action_xref_id);
    }


    $scope.GetCheckListActionOnItem = function (checklist_action_xref_id) {
        $scope.checklist_action_xref_id = checklist_action_xref_id;

        var filterparameters = {
            checklist_action_xref_id: checklist_action_xref_id
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'CheckListActionDetail'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {
            $scope.tmp_action_item_data = angular.copy(data["CheckListActionOnItem"][0]);
            $scope.selecteddata.checklist_action_xref_status_id = $scope.tmp_action_item_data.status_id;
            $scope.startupdata.ChecklistActionStatuses = data["ChecklistActionStatuses"];
            $scope.openCheckListActionOnItem('lg');
        },

        function (error1) {
            $log.error('failure in search', error1);
        });

    }

    $scope.openCheckListActionOnItem = function (size) {


        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myCheckListActionOnItem.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size,
            resolve: {
                data: function () {
                    return $scope.tmp_action_item_data;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            SaveCheckListActionOnItem();
            $timeout(function () {
                $scope.GetCheckListActions($scope.checklist_action_id);
            }, 2000);

                
        }, function () {

        });
    };

    

    $scope.ExecutePSCheckListActionOnItem = function (checklist_action_xref_id) {
        $scope.checklist_action_xref_id = checklist_action_xref_id;

        var filterparameters = {
            checklist_action_xref_id: checklist_action_xref_id
        };

        var promiseGet1 = crudServiceController.search(filterparameters, CONTROLLERNAME, 'ExecutePSCheckListActionOnItem'); //The Method Call from service to get all data;
        promiseGet1.success(function (data) {

            $timeout(function () {
                $scope.GetCheckListActions($scope.checklist_action_id);
            }, 2000);
        },

        function (error1) {
            $log.error('failure in ExecutePSCheckListActionOnItem', error1);
        });

    }

    function SaveCheckListActionOnItem() {

        //extend: to, from
        
        //$scope.data = angular.extend($scope.data, $scope.tmp_action_item_data);
        $scope.data = angular.copy($scope.tmp_action_item_data);
        $scope.data.status_id = ($scope.selecteddata.checklist_action_xref_status_id == null ? null : $scope.selecteddata.checklist_action_xref_status_id);

        var promisePut;
        promisePut = crudServiceController.put($scope.data.checklist_action_xref_id, $scope.data, CONTROLLERNAME, 'ChecklistActionOnItem');

        promisePut.then(function (pl) {
            ngNotify.set('Successfully saved', { type: 'success' });
            search();
        }, function (err) {
            ngNotify.set('Failed while saving - ' + err, { type: 'error' });
        });
    }


    $scope.SearchModal = function () {

        var uibModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'myCheckListActionSearch.html',
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: 'md',
            resolve: {
                data: function () {
                    return $scope.filters;
                }
            }
        });
        //Save
        uibModalInstance.result.then(function (updateddata) {
            $scope.filters = updateddata;
            search();
        }, function () {

        });


    };

    /****************************************************************************************************/
    //Check List Action Items - End
    /****************************************************************************************************/




    function search() {

        var filterparameters = {
            search_for_options: $scope.filters.search_for_options,
            modified_usr_ids: $scope.filters.modified_usr_ids,
            startdate: $rootScope.dates.startdate,
            enddate: $rootScope.dates.enddate
        };

        var parameters = {
            param: filterparameters
        };
        var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'CheckListItemSummary'); //The Method Call from service to get all data;
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
