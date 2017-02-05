'use strict';

app.controller("SettingsController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "SETTINGS";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);


    $scope.startupdata = {
        applications: [],
        sprints: [],
        scopes: [],
        statuses: []
    };


    $scope.ShowHide = {
        SaveWorkItem: false
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

    $scope.GridDataExtermalWorkItems = {
        data: []
    };


    $scope.GridDataWorkItems = {
        data: []
    };

    $scope.GridDataReleaseConfigs = {
        data: []
    };

    

    $scope.SelectedItemsToBeSaved =
        {
            workitems:[]
        }

    /****************************************************************************************************/
    //Start-up functions

    $scope.startup = function () {

  

    }


        /****************************************************************************************************/
        //Main ui-grid 

            var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                            ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                            ' <button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowAllDetails(row)"><span class="glyphicon glyphicon-edit"></span></button> </div>'



            $scope.gridOptionsExtermalWorkItems = {
                enableSorting: true,
                enableFiltering: true,
                enableSelectAll: true,
                enableRowSelection: true,
                data: 'GridDataExtermalWorkItems.data',
                exporterCsvFilename: 'myFile.csv',
                columnDefs: [
               { name: 'Actions', field: 'release_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false },
               { name: 'Sprint', field: 'sprint_nm' },
             //  { name: 'WorkItem', field: 'work_item_ext_id' },
               {name: 'Work Item ID', field: 'work_item_ext_id', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                   if (row.entity.work_item_id_is_new == true) {
                       return 'newitem';
                   }
               }},
               { name: 'Title', field: 'work_item_title' }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApiExtermalWorkItems = gridApi;
                }
            };



            var GridDataWorkItemEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">View<span class="glyphicon glyphicon-view"></span></button>' +
                                                                    '</div>';
   
            // Release Work Item ui-grid
            $scope.gridOptionsWorkItem = {
                enableSorting: true,
                enableFiltering: true,
                enableSelectAll: true,
                enableRowSelection: true,
                data: 'GridDataWorkItems.data',
                columnDefs: [
               { name: 'Actions', field: 'release_id', cellTemplate: GridDataWorkItemEditAndDeleteCellTemplate, enableFiltering: false, width: 70 },
               { name: 'Sprint', field: 'sprint_nm', width: "*"},
               { name: 'Scope',   field: 'scope_nm' },
               {
                   name: 'Work Item ID', field: 'work_item_ext_id', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                       if (row.entity.work_item_id_is_new == true) {
                           return 'selected';
                       }
                   }
               },
               { name: 'Work Item Title', field: 'work_item_title', width: 450 }

                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptionsWorkItemgridApi = gridApi;

                }
            };



       
            
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


            //$scope.Search = function () {
            //    search();
            //};

            $scope.SearchModal = function () {

                    var uibModalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'myModalSearch.html',
                        controller: 'ModalInstanceCtrl',
                        scope: $scope,
                        size: 'lg',
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


            function search() {
                var scopelst = "";
                angular.forEach($scope.filters.scope, function (value, key) {
                    scopelst = scopelst + value.scope_nm + ";";
                });


                var filterparameters = {
                    sprint_nm: $scope.filters.sprint_nm,
                    application_nm: $scope.filters.application_nm,
                    work_item_nm: $scope.filters.work_item_nm,
                    scope_nm: ($scope.filters.scope == null ? "" : scopelst),
                    modified_usr_id: $scope.filters.modified_usr_id,
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate
                };


                var parameters = {
                    param: filterparameters
                };

                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'WorkItemsFromExternalSource'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    $scope.GridDataExtermalWorkItems.data = data;
                    console.log(data);
            
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                },

                function (error1) {
                    $log.error('failure in search', error1);
                });


                promiseGet1 = crudServiceController.search(parameters, "COMMON", 'WorkItems'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    console.log(data);
                    $scope.GridDataWorkItems.data = data;

            
                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                },

                function (error1) {
                    $log.error('failure in search', error1);
                });

            }



        /****************************************************************************************************/
        //Get single record :  Detail based on id
        //tmp_xxx variables are for client side editing/updating

        var defer = $q.defer();
        $scope.GetData = function (id) {
            crudServiceController.get(id, CONTROLLERNAME).then(function (response) {
                defer.resolve(response.data);

                $scope.release = response.data["release"];
                $scope.selecteddata.sprint = response.data["sprints"];

                $scope.tmp_data = angular.copy($scope.release);
                $scope.SetSelectedData($scope.tmp_data);
                $scope.open('lg');
                return defer.promise;
            });
        }



        $scope.ShowDetails = function (row) {
            $scope.IsEdit = true;
            $scope.GetData(row.entity.release_id);
        }


        /****************************************************************************************************/
        //Dialog - Detail for Add / Edit



        $scope.openDialogConfirm = function (row, headerText, bodyText, closeButtonText, actionButtonText) {

            $scope.modalOptionsheaderText = headerText;
            $scope.modalOptionsbodyText = bodyText;
            $scope.modalOptionscloseButtonText = closeButtonText;
            $scope.modalOptionsactionButtonText = actionButtonText;
            $scope.data = false;
            var uibModalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'Content/others/myModalDailogContent.html',
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
                    var promisePut = crudServiceController.delete(row.entity.release_id, CONTROLLERNAME).then(function (pl) {
                        $scope.Message = "Successfuly completed.";
                        $scope.deleteflag = true;///// start here
                        $scope.loadAllData();
                    }, function (err) {
                        console.log("Err" + err);
                    });
                }
            }, function () {

            });
        };

  
    /****************************************************************************************************/
    //The Save - Release workitems : Always delete and add

            $scope.SaveReleaseWorkItems = function () {

                var SelectedWorkItemsToBeSaved = $scope.gridApiExtermalWorkItems.selection.getSelectedRows();


                //extend: to, from

                var DataToSave = {
                    workitems: []
                };
                DataToSave.workitems = SelectedWorkItemsToBeSaved;

                var promisePut;
                //Update
                promisePut = crudServiceController.post(DataToSave, CONTROLLERNAME, 'SaveWorkItems');

                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    //$scope.release = null;
                    //$scope.loadAllData();
                }, function (err) {
                    console.log("Err" + err);
                });
            }

            /****************************************************************************************************/
            //Add New - Clear all input fields

            $scope.AddNew = function () {
                $scope.IsEdit = false;
                $scope.GetData(0);
            };
            /****************************************************************************************************/


            /****************************************************************************************************/
            //Delete record upon confirmation

      

            $scope.Delete = function (row) {
                var bodyText = 'ID : ' + row.entity.release_id + ' : ' + row.entity.release_nm + '  Are you sure to delete?';
                $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

            }

    // Function to load all records

            $scope.SetSelectedData = function (tmp_data)
            {
                $rootScope.SetSelectedTickedValue($scope.releaseSprints, $scope.selecteddata.sprint, "sprint_id")
            }



            $scope.ImportMasterData = function () {


                var parameters = {
                    param: null
                };
                var promiseGet1 = crudServiceController.execute(parameters, CONTROLLERNAME, 'ImportMasterData'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    console.log(data);
                    //$scope.GridDataWorkItems.data = data;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                },

                function (error1) {
                    $log.error('failure in search', error1);
                });



            }




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


