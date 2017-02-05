'use strict';

app.controller("ReleaseController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "RELEASE";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);


    $scope.startupdata = {
        applications: [],
        sprints: [],
        config_types: [],
        scopes: [],
        statuses: [],
        server_type_ref:[],
        deployment_environment_ref:[],
        deployment_mse_environment_ref:[],
        deployment_type_ref :[],
        reportparts: [],
        rfctemplatefiles: []
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
    }
    ;

    $scope.GridData = {
        data: []
    };


    $scope.GridDataReleaseWorkItem = {
        data: []
    };

    $scope.GridDataReleaseConfigs = {
        data: []
    };

    $scope.GridDataReleasePDFs = {
        data: []
    };
    

    $scope.ApplicationMatrix = {
        data: []
    };

    
    $scope.GridDataReleaseBusinessValidationDetails = {
        data: []
    };

    $scope.GridDataRN = {
        data: []
    };

    $scope.GridDataRFCDetails = {
        data: []
    };

    $scope.GridDataRFCDetails = {
        data: []
    };
    

    $scope.SelectedItemsToBeSaved =
        {
            workitems:[]
        }
    $scope.SelectedReleaseID = 0;

    /****************************************************************************************************/
    //Start-up functions

    $scope.startup = function () {



        var promiseGet = crudService.masterdata();
        promiseGet.success(function (data) {
            $scope.startupdata.applications = data["applications"];
            $scope.startupdata.sprints = data["sprints"];
            $scope.startupdata.config_types = data["config_types"];
            $scope.startupdata.scopes = data["scopes"];
            $scope.startupdata.statuses = data["statuses"];
            $scope.startupdata.server_type_ref = data["servertypes"];
            $scope.startupdata.deployment_environment_ref = data["deploymentenvironments"];
            $scope.startupdata.deployment_mse_environment_ref = data["deployment_mse_environments"];
            $scope.startupdata.deployment_type_ref = data["deploymenttypes"];
            $scope.startupdata.statuses = data["statuses"];
            $scope.startupdata.reportparts = data["reportparts"];
        },
        function (error1) {
            $log.error('failure startup masterdata', error1);
        });



        //Get RFC Templates file list on start up
        var promiseGet;
        promiseGet = crudServiceController.getAllActionData("COMMON", 'RFCTemplateFiles');
        promiseGet.success(function (data) {
            $scope.startupdata.rfctemplatefiles = data;
        },
        function (error1) {
            $log.error('failure startup RFCTemplateFiles', error1);
        });




    }


    function AddTickedForMultiSelect() {
        $rootScope.AddTicked($scope.startupdata.sprints, false);
    }


        /****************************************************************************************************/
        //Main ui-grid 

            var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                            ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                            ' </div>'



            $scope.gridOptions1 = {

                //enableFullRowSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                enableRowHeaderSelection: false,
                data: 'GridData.data',
                enableFiltering: true,
                enableGridMenu: true,
                exporterCsvFilename: 'Release_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
               { name: 'Actions', field: 'release_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false },
               { name: 'Release Name', field: 'release_nm' },
               { name: 'Release Date', field: 'release_dt' },
               { name: 'Release Notes', field: 'release_descr' },
                { name: 'IT Validation', field: 'release_descr' },
                { name: 'Business Validation', field: 'release_descr' }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                    //$scope.gridApi.grid.registerDataChangeCallback(function (data) {
                    //    $scope.gridApi.selection.selectRow($scope.gridOptions1.data[0]);
                    //}, [uiGridConstants.dataChange.ROW]);

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.ShowAllDetails(row.entity.release_id);

                    });
                }
            };



            var GridDataReleaseWorkItemEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">View<span class="glyphicon glyphicon-view"></span></button>' +
                                                                    '</div>';
   
            // Release Work Item ui-grid
            $scope.gridOptionsReleaseWorkItem = {
                enableSorting: true,
                enableFiltering: true,
                enableSelectAll: true,
                enableRowSelection: true,
                enableGridMenu: true,
                exporterCsvFilename: 'ReleaseWorkItems_' + new Date().toLocaleDateString() + '.csv',
                //showSelectionCheckbox:true,
                data: 'GridDataReleaseWorkItem.data',
                columnDefs: [
               { name: 'Actions', field: 'release_id', cellTemplate: GridDataReleaseWorkItemEditAndDeleteCellTemplate, enableFiltering: false, width: 70 },
               //{ name: 'Select', cellTemplate: '<div class="centeralign"><input type="checkbox" ng-model="row.entity.work_item_id_select"> </div>', enableFiltering: false, width: 60 },
               { name: 'Sprint', field: 'sprint_nm', width: "*"},
               { name: 'Scope',   field: 'scope_nm' },
               {
                   name: 'Work Item ID', field: 'work_item_ext_id', cellClass: function (grid, row, col, rowRenderIndex, colRenderIndex) {
                       if (row.entity.work_item_id_select == true) {
                           return 'selected';
                       }
                   }
               },
               { name: 'Work Item Title', field: 'work_item_title', width: 450 }

                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptionsReleaseWorkItemgridApi = gridApi;

                }
            };



          //Release Configuration ui-grid 

            var ReleaseConfigsEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                           ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button> </div>';

            var r = '<a href="~/Release" class="btn btn-default btn-lg"><i class="fa fa-github fa-fw"></i> <span class="network-name">Release Matrix</span></a>'
            //var c1 = '<div ng-controller="WorkItemController">  <a ng-href="#" ng-click="GetDetail(row.entity.work_item_id)">{{row.entity.work_item_ext_id}}</a></div>'
            //var c1 = '<a ng-href="#" ng-click="grid.appScope.ShowWorkItem(row)">{{row.entity.work_item_ext_id}}</a>'

            $scope.gridOptionsReleaseConfigs = {
                enableSorting: true,
                enableHorizontalScrollbar:true,
                data: 'GridDataReleaseConfigs.data',
                enableFiltering: true,
                enableGridMenu: true,
                exporterCsvFilename: 'ITValidation_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
               //{ name: 'View', field: 'config_id', cellTemplate: ReleaseConfigsEditAndDeleteCellTemplate },
               { name: 'Work Item', field: 'work_item_ext_id'},
               { name: 'Application', field: 'application_nm' },
               { name: 'Scope', field: 'scope_nm' },
               { name: 'Type', field: 'config_type_nm' },
               { name: 'Name', field: 'config_nm' },
               { name: 'Key', field: 'config_key' },
               { name: 'Dev Value', field: 'config_dev_value' ,visible:false },
               { name: 'Dev_Int Value', field: 'config_dev_int_value', visible: false },
               { name: 'QA Value', field: 'config_qa_value', visible: false },
                {
                    name: 'Production Value', field: 'config_prod_value',
                    cellTooltip: function (row, col) { return row.entity.config_prod_value }

                }
],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptionsReleaseConfigsApi = gridApi;
                }
            };





            /****************************************************************************************************
            PDFs
            ****************************************************************************************************/

/*            $scope.gridOptionsReleasePDFs = {
                enableSorting: true,
                enableHorizontalScrollbar: true,
                data: 'GridDataReleasePDFs.data',
                enableFiltering: true,
                enableGridMenu: true,
                exporterCsvFilename: 'PDFs_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
               { name: 'Work Item', field: 'work_item_ext_id' },
               { name: 'Application', field: 'application_nm' },
               { name: 'Scope', field: 'scope_nm' },
               { name: 'Type', field: 'config_type_nm' },
               { name: 'Name', field: 'config_nm' },
               { name: 'Key', field: 'config_key' },
               { name: 'Dev Value', field: 'config_dev_value', visible: false },
               { name: 'Dev_Int Value', field: 'config_dev_int_value', visible: false },
               { name: 'QA Value', field: 'config_qa_value', visible: false },
                {
                    name: 'Production Value', field: 'config_prod_value',
                    cellTooltip: function (row, col) { return row.entity.config_prod_value }

                }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridOptionsReleasePDFsApi = gridApi;
                }
            };

            */

            $scope.gridOptionsReleasePDFs = {
                enableSorting: true,
                enableFiltering: true,
                treeRowHeaderAlwaysVisible: false,
                enableHorizontalScrollbar: 2, /* WHEN_NEEDED */
                enableVerticalScrollbar: 2,/* WHEN_NEEDED */
                enableGridMenu: true,
                exporterCsvFilename: 'PDF_' + new Date().toLocaleDateString() + '.csv',
                data: 'GridDataReleasePDFs.data',
                columnDefs: [
               { name: 'Application', field: 'application_nm', grouping: { groupPriority: 0 }, width: '125' },
                { name: 'PDF File Name', field: 'pdf_file_name' },
                { name: 'Work Item', field: 'work_item_ext_id' },
               { name: 'Name', field: 'config_nm' },
               { name: 'PDF Action', field: 'pdfactions' },
               { name: 'Type', field: 'config_type_nm' },
               { name: 'Key', field: 'config_key' },
               { name: 'Dev Value', field: 'config_dev_value', visible: false },
               { name: 'Dev_Int Value', field: 'config_dev_int_value', visible: false },
               { name: 'QA Value', field: 'config_qa_value', visible: false },
                {
                    name: 'Production Value', field: 'config_prod_value',
                    cellTooltip: function (row, col) { return row.entity.config_prod_value }

                }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi1 = gridApi;
                }
            };




            /****************************************************************************************************
            Business Validation
            ****************************************************************************************************/

            var ReleaseBusinessValidationDetailsCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.GetReleaseBusinessValidationDetail(row.entity.release_work_item_id)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                   ' </div>';


            $scope.gridOptionsReleaseBusinessValidationDetails = {
                enableSorting: true,
                enableHorizontalScrollbar: true,
                data: 'GridDataReleaseBusinessValidationDetails.data',
                enableFiltering: true,
                enableGridMenu: true,
                exporterCsvFilename: 'BizValidation_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
                { name: 'View', field: 'release_work_item_id', cellTemplate: ReleaseBusinessValidationDetailsCellTemplate, enableFiltering: false, width: "75" },
               { name: 'Work Item#', field: 'work_item_ext_id', width: "100" },
               {
                   name: 'Work Item Title', field: 'work_item_title', width: "250",
                   cellTooltip: function (row, col) { return row.entity.work_item_title }
               },
               { name: 'Is Biz', field: 'is_biz_validation_required', width: "100" },
               { name: 'Biz Validator', field: 'biz_validator_nm', width: "150" },
               {
                   name: 'IT Validation SQL/Steps', field: 'biz_validation_sql',
                   cellTooltip: function (row, col) { return row.entity.biz_validation_sql }
               },
               {
                   name: 'Business Validation', field: 'biz_validation_comments',
                   cellTooltip: function (row, col) { return row.entity.biz_validation_comments }
               }
            ]
            };


            $scope.GetReleaseBusinessValidationDetails = function (id) {

                //$scope.SelectedReleaseID = id;
                var parameters = {
                    release_id: id   //row.entity.release_id
                };

                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'ReleaseBusinessValidationDetails'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {

                    $scope.GridDataReleaseBusinessValidationDetails.data = data;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                },

                function (error1) {
                    $log.error('failure in GetReleaseBusinessValidationDetails', error1);
                });
            }

            $scope.GetReleaseBusinessValidationDetail = function (id) {
                crudServiceController.get(id, CONTROLLERNAME, 'ReleaseBusinessValidationDetail').then(function (response) {
                    defer.resolve(response.data);
                    $scope.data = response.data;
                    $scope.tmp_data_biz_vld_detail = angular.copy($scope.data);
                    $scope.openReleaseBusinessValidationDetailEdit('lg');
                    return defer.promise;
                });
            }

            $scope.SaveReleaseBusinessValidationDetail = function ()
            {

                //extend: to, from
                $scope.data = angular.extend($scope.data, $scope.tmp_data_biz_vld_detail);

                var promisePut;
                promisePut = crudServiceController.put($scope.data.release_work_item_id, $scope.data, CONTROLLERNAME, 'ReleaseBusinessValidationDetail');
                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.GetReleaseBusinessValidationDetails($scope.SelectedReleaseID);

                }, function (err) {
                    console.log("Err" + err);
                });
            }

            $scope.openReleaseBusinessValidationDetailEdit = function (size) {

                //$templateCache.remove('myReport.html');

                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'ReleaseBusinessValidationDetailsEdit.html',
                    controller: 'ModalInstanceCtrl',
                    scope: $scope,
                    size: size,
                    resolve: {
                        data: function () {
                            return $scope.tmp_data_biz_vld_detail;
                        }
                    }
                });
                //Save
                uibModalInstance.result.then(function (updateddata) {
                    $scope.tmp_data_biz_vld_detail = updateddata;
                    $scope.SaveReleaseBusinessValidationDetail();
                }, function () {

                });
            };


        //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Business Validation End >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>/
        


            /****************************************************************************************************
            Release Notes Creation - Start
            ****************************************************************************************************/



            var RNCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowRFCRef(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                       ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.DeleteRFC(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                       ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowRFCDetails(row.entity.rfc_id)">Details</button>&nbsp;' +
                                       ' <button type="button" class="btn btn-warning btn-xs" ng-click="grid.appScope.ShowRFCReleaseNote(row.entity.rfc_id, row.entity.rfc_nm)">Release Notes</button> </div>';



            $scope.gridOptionsRN = {
                enableSorting: true,
                enableHorizontalScrollbar: true,
                data: 'GridDataRN.data',
                enableFiltering: true,
                enableGridMenu: true,
                exporterCsvFilename: 'Releasenotes_' + new Date().toLocaleDateString() + '.csv',

                columnDefs: [
                { name: 'Actions', field: 'release_work_item_id', cellTemplate: RNCellTemplate, enableFiltering: false, width: "290" },
               {
                   name: 'RFC#', field: 'rfc_number', width: "120"
               },
               {
                   name: 'Release Note', field: 'rfc_nm',
                   cellTooltip: function (row, col) { return 'empty' }
               }

                ]
            };


            $scope.GetRFCs = function (id) {

                //$scope.SelectedReleaseID = id;
                var parameters = {
                    release_id: id   //row.entity.release_id
                };

                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'RFCs'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {

                    $scope.GridDataRN.data = data;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                },

                function (error1) {
                    $log.error('failure in GetReleaseN', error1);
                });
            }


            var defer = $q.defer();
            $scope.ShowRFCReleaseNote = function (id, filename) {
                crudServiceController.saveasword(id, CONTROLLERNAME, 'RFCReleaseNotes', filename).then(function (response) {
                    defer.resolve(response.data);
                    //$scope.data = response.data;
                    //$scope.tmp_rfc_data = angular.copy($scope.data);
                    //$scope.openRFC('lg');
                    return defer.promise;
                });
            }

            $scope.ShowRFCRef = function (row) {
                $scope.IsEdit = true;
                $scope.GetRFCRef(row.entity.rfc_id);
            }

            var defer = $q.defer();
            $scope.GetRFCRef = function (id) {
                crudServiceController.get(id, CONTROLLERNAME, 'RFC').then(function (response) {
                    defer.resolve(response.data);
                    $scope.data = response.data;
                    $scope.tmp_rfc_data = angular.copy($scope.data);
                    $scope.openRFC('lg');
                    return defer.promise;
                });
            }

            $scope.openRFC = function (size) {
                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'myModalContentRFC.html',
                    controller: 'ModalInstanceCtrl',
                    scope: $scope,
                    size: size,
                    resolve: {
                        data: function () {
                            return $scope.tmp_rfc_data;
                        }
                    }
                });
                //Save
                uibModalInstance.result.then(function (updateddata) {
                    $scope.tmp_rfc_data = updateddata;
                    SaveRFC();
                }, function () {

                });
            };

            $scope.AddNewRFC = function () {
                $scope.IsEdit = false;
                $scope.GetRFCRef(0);
            };


            function SaveRFC() {

                //extend: to, from
                $scope.tmp_rfc_data.release_id = $scope.SelectedReleaseID;
                $scope.data = angular.extend($scope.data, $scope.tmp_rfc_data);
                var DataToSave = {
                    data: []
                };

                DataToSave.data = $scope.data;
                var promisePut;
                if ($scope.data.rfc_id == 0) //Add
                {
                    promisePut = crudServiceController.post(DataToSave, CONTROLLERNAME, 'RFC');
                }
                else //Update
                {
                    promisePut = crudServiceController.put($scope.data.rfc_id, DataToSave, CONTROLLERNAME, 'RFC');
                }

                promisePut.then(function (pl) {
                    ngNotify.set('Successfully saved', { type: 'success' });
                    $scope.GetRFCs($scope.SelectedReleaseID);
                }, function (err) {
                    ngNotify.set('Failed while saving - ' + err, { type: 'error' });
                    console.log("Err" + err);
                });
            }


            $scope.DeleteRFC = function (row) {
                var bodyText = 'ID : ' + row.entity.rfc_id + ' : ' + row.entity.rfc_nm + '  Are you sure to delete?';
                $scope.openDialogConfirmDeleteRFC(row, 'Delete', bodyText, 'Cancel', 'Delete', false);

            }


            $scope.openDialogConfirmDeleteRFC = function (row, headerText, bodyText, closeButtonText, actionButtonText) {

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
                        var promisePut = crudServiceController.delete(row.entity.rfc_id, CONTROLLERNAME, 'RFC').then(function (pl) {
                            $scope.Message = "Successfuly completed.";
                            $scope.deleteflag = true;///// start here
                            $scope.GetRFCs($scope.SelectedReleaseID);

                        }, function (err) {
                            console.log("Err" + err);
                        });
                    }
                }, function () {

                });
            };


            //RFC Details

            var myRFCDetailCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowRFCDetailEntry(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                        ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.DeleteRFCDetail(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>' +
                                        ' </div>';


            $scope.gridOptionsRFCDetails = {
                enableSorting: true,
                enableFiltering: true,
                enableSelectAll: true,
                enableRowSelection: true,
                enableGridMenu: true,
                data: 'GridDataRFCDetails.data',
                columnDefs: [
               { name: 'View', field: 'rfc_detail_id', cellTemplate: myRFCDetailCellTemplate, enableFiltering: false, width: "150" },
               { name: 'Report Part', field: 'report_part_nm', width: "150" },
                { name: 'Details', field: 'rfc_detail_nm' }

                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApiRFCDetails = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.ShowHide.SearchBox = true;

                    });
                }
            };

            $scope.ShowRFCDetails = function (rfc_detail_id) {
                $scope.GetRFCDetails(rfc_detail_id);
                $scope.openRFCDetails('lg');
            }

            $scope.GetRFCDetails = function (rfc_id) {
                $scope.rfc_id = rfc_id;

                var filterparameters = {
                    rfc_id: rfc_id
                };

                var parameters = {
                    param: filterparameters
                };
                var promiseGet1 = crudServiceController.search(filterparameters, CONTROLLERNAME, 'RFCDetails'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    $scope.tmp_data_details = data;

                    $scope.GridDataRFCDetails.data = data["rfcdetails"];

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                },

                function (error1) {
                    $log.error('failure in GetRFCDetails', error1);
                });

            }

            $scope.openRFCDetails = function (size) {

                //$templateCache.remove('myReport.html');

                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'myRFCDetail.html',
                    controller: 'ModalInstanceCtrl',
                    scope: $scope,
                    size: size,
                    resolve: {
                        data: function () {
                            return $scope.tmp_rfc_detail;
                        }
                    }
                });
                //Save
                uibModalInstance.result.then(function (updateddata) {
                    $scope.tmp_rfc_detail = updateddata;
                    //search();
                }, function () {

                });
            };

            $scope.AddNewRFCDetail = function () {
                $scope.IsEdit = false;
                $scope.GetRFCDetail(0);
            };

            $scope.ShowRFCDetailEntry = function (row) {
                $scope.IsEdit = true;
                $scope.GetRFCDetail(row.entity.rfc_detail_id);
            }

            $scope.openRFCDetailEntry = function (size) {
                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'RFCDetailEntry.html',
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
                    SaveRFCDetailEntry();
                }, function () {

                });
            };

            $scope.GetRFCDetail = function (id) {
                crudServiceController.get(id, CONTROLLERNAME, 'RFCDetail').then(function (response) {
                    defer.resolve(response.data);
                    $scope.data = response.data;
                    $scope.tmp_data_rfc_detail = angular.copy($scope.data);
                    $scope.tmp_data_rfc_detail.rfc_id = $scope.rfc_id;

                    $scope.openRFCDetailEntry('lg');
                    return defer.promise;
                });
            }

            $scope.DeleteRFCDetail = function (row) {
                var bodyText = 'ID : ' + row.entity.rfc_detail_id + '  Are you sure to delete?';
                $scope.openRFCDetailDelete(row, 'Delete', bodyText, 'Cancel', 'Delete', true);

            }

            function SaveRFCDetailEntry() {

                //extend: to, from
                $scope.data = angular.extend($scope.data, $scope.tmp_data_rfc_detail);

                var promisePut;
                if ($scope.data.rfc_detail_id == 0) //Add
                {
                    promisePut = crudServiceController.post($scope.data, CONTROLLERNAME, 'RFCDetail');
                }
                else //Update
                {
                    promisePut = crudServiceController.put($scope.data.rfc_detail_id, $scope.data, CONTROLLERNAME, 'RFCDetail');
                }

                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.GetRFCDetails($scope.rfc_id);

                }, function (err) {
                    console.log("Err" + err);
                });
            }

            $scope.openRFCDetailDelete = function (row, headerText, bodyText, closeButtonText, actionButtonText) {

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
                        var promisePut = crudServiceController.delete(row.entity.rfc_detail_id, CONTROLLERNAME, 'RFCDetail').then(function (pl) {
                            $scope.Message = "Successfuly completed.";
                            $scope.deleteflag = true;///// start here
                            $scope.GetRFCDetails($scope.rfc_id);

                        }, function (err) {
                            console.log("Err" + err);
                        });
                    }
                }, function () {

                });
            };

            /****************************************************************************************************
            Release Notes Creation -End
            ****************************************************************************************************/

            
            /****************************************************************************************************/
            //Load all data
            //loadAllData();


           // Function to load all records
            $scope.loadAllData = function () {

                var promiseGet = crudServiceController.getAllData(CONTROLLERNAME); //The Method Call from service to get all data;
                promiseGet.success(function (data) {
                    $scope.GridData.data = data;
                    if (data.length > 0)
                    {
                        setTimeout(function () {
                            $scope.gridApi.selection.selectRow($scope.GridData.data[0],true);
                        }, 0);

                        $scope.ShowAllDetails($scope.GridData.data[0].release_id);
                    }
                },

                function (error1) {
                    $log.error('failure loading', error1);
                });
            }


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


                var parameters = {
                    sprint_nm: $scope.filters.sprint_nm,
                    application_nm: $scope.filters.application_nm,
                    work_item_nm: $scope.filters.work_item_nm,
                    scope_nm: ($scope.filters.scope == null ? "" : scopelst),
                    modified_usr_id: $scope.filters.modified_usr_id,
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate
                };

 
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME); //The Method Call from service to get all data;
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

        /****************************************************************************************************/
        //On Release Row Click : 
        /****************************************************************************************************/


            $scope.ShowAllDetails= function (id) {

                $scope.SelectedReleaseID = id;
                var parameters = {
                    release_id: id   //row.entity.release_id
                };


                //Get Sprint Work Items List based on Release
                //Show all release information on Tabs based on release_id
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'ReleaseInformation'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {

                    $scope.GetReleaseBusinessValidationDetails(id);
                    $scope.GridDataReleaseWorkItem.data = data["ReleaseWorkItem"];
                    $scope.GridDataReleaseConfigs.data = data["ReleaseConfiguration"];
                    $scope.GridDataReleasePDFs.data = data["ReleasePDFs"];  // To change to PDF
                    $scope.ApplicationMatrix.data = data["ApplicationMatrix"];
                    $scope.GridDataRN.data = data["RFCs"];

                    $scope.ShowHide.SaveWorkItem = false;
                    if ($scope.GridDataReleaseWorkItem.data.length != 0) {
                        $scope.ShowHide.SaveWorkItem = true;
                    }

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                    $timeout(function () {


                        angular.forEach($scope.GridDataReleaseWorkItem.data, function (value, key) {
                            if ( value.work_item_id_select)
                                $scope.gridOptionsReleaseWorkItemgridApi.selection.selectRow(value);
                        });

                    });
  

                },

                function (error1) {
                    $scope.ShowHide.SaveWorkItem = false;
                    $log.error('failure in ShowAllDetails', error1);
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
                //if ($scope.release.release_dt == null)
                //    $scope.release.release_dt = new Date();
                //else
                //    $scope.release.release_dt = new Date($scope.release.release_dt);

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
            //The Save scope method use to define the object.
            //In this method if IsNewRecord is not zero then Update else 
            //Create 

            function Save() {

                //extend: to, from
                $scope.release = angular.extend($scope.release, $scope.tmp_data);

                $scope.release.status_id = ($scope.selecteddata.status == null ? null : $scope.selecteddata.status.status_id);
                //$scope.release.application_id = ($scope.selecteddata.application == null ? null : $scope.selecteddata.application.application_id);
                //$scope.release.sprint_id = ($scope.selecteddata.sprint == null ? null : $scope.selecteddata.sprint.sprint_id);
                //$scope.release.scope_id = ($scope.selecteddata.scope == null ? null : $scope.selecteddata.scope.scope_id );

                var DataToSave = {
                    release: [],
                    sprints: []
                };
                
                DataToSave.release = $scope.release;
                DataToSave.sprints = angular.extend(DataToSave.sprints, $scope.selecteddata.sprint);

                $rootScope.RemoveTicked(DataToSave.sprints);


                var promisePut;
                if ($scope.release.release_id == 0) //Add
                {
                    promisePut = crudServiceController.post(DataToSave, CONTROLLERNAME);
                }
                else //Update
                {
                    promisePut = crudServiceController.put($scope.release.release_id, DataToSave, CONTROLLERNAME);
                }

                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.release = null;
                    $scope.loadAllData();
                }, function (err) {
                    console.log("Err" + err);
                });
            }

    /****************************************************************************************************/
    //The Save - Release workitems : Always delete and add

            $scope.SaveReleaseWorkItems = function () {

                var SelectedWorkItemsToBeSaved = $scope.gridOptionsReleaseWorkItemgridApi.selection.getSelectedRows();

                //extend: to, from

                var DataToSave = {
                    release_id : $scope.SelectedReleaseID,
                    workitems: []
                };
                DataToSave.workitems = SelectedWorkItemsToBeSaved;

                var promisePut;
                //Update
                promisePut = crudServiceController.post(DataToSave, CONTROLLERNAME, 'ReleaseWorkItems');

                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.ShowAllDetails($scope.SelectedReleaseID);

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
                $rootScope.SetSelectedTickedValue($scope.startupdata.sprints, $scope.selecteddata.sprint, "sprint_id")
            // $scope.selecteddata.status = $filter('filter')($rootScope.GlobalMasterData.statuses, { status_id: tmp_data.status_id })[0];
               // $scope.selecteddata.application = $filter('filter')($rootScope.GlobalMasterData.applications, { application_id: tmp_data.application_id })[0];
                //$scope.selecteddata.sprint = $filter('filter')($rootScope.GlobalMasterData.sprints, { sprint_id: tmp_data.sprint_id })[0];
               // $scope.selecteddata.scope = $filter('filter')($rootScope.GlobalMasterData.scopes, { scope_id: tmp_data.scope_id })[0];
            }

            
            $scope.startup();
            $scope.loadAllData();
            AddTickedForMultiSelect();
            //search();
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