'use strict';

app.controller("myController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "CONFIGURATION";

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
        pdfactions: [{ key: 1, value: 'New' }, { key: 2, value: 'Update' }, { key: 3, value: 'Delete' }]
    };

    
    $scope.dynamicCSS = {
        has_success_error: ""
    };


    $scope.validation = {
        isvalid: false,
        error_msg:""
    };
    $scope.selecteddata = {
        application: [],
        sprint: [],
        config_type: [],
        scope : [],
        status: []
    };

    $scope.filters = {
        work_item_nm: "",
        scope_id: 0,
        sprint_id: null,
        application_id: null,
        modified_usr_id: "",

        scopes: null,
        sprints: null,
        applications: null,
        statuses: null,

        startdate :null,
        enddate:null
    };


    $scope.IsEdit = false;

    $scope.GridData = {
        data: []
    };


    $scope.tmp_configuration = null;


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
        },
        function (error1) {
            $log.error('failure startup masterdata', error1);
        });

    }


        /****************************************************************************************************/
        //ui-grid 

            var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                           ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button> </div>';

            $scope.gridOptions1 = {
                enableSorting: true,
                enableGridMenu: true,
                enableRowSelection: false,
                enableSelectAll: true,
                data: 'GridData.data',
                enableFiltering: true,
                exporterCsvFilename: 'Config_Tracker_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
               { name: 'View', field: 'config_id', cellTemplate: myEditAndDeleteCellTemplate },
               { name: 'Sprint', field: 'sprint_nm' },
               { name: 'Work Item', field: 'work_item_ext_id' },
               { name: 'Application', field: 'application_nm' },
               { name: 'Name', field: 'config_nm' },
               { name: 'Type', field: 'sprint_nm' },
               { name: 'Key', field: 'config_key' },
               { name: 'Type', field: 'config_type_nm' },
               { name: 'Status', field: 'status_nm' }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };


            $scope.SearchModal = function () {

                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'Content/others/myModalGenericSearch.html',
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



            $scope.SearchClear = function () {

                    $scope.filters.work_item_nm="";
                    $scope.filters.scopes=null;
                    $scope.filters.scope_id=0;
                    $scope.filters.sprint_id=null;
                    $scope.filters.application_id = null;
                    $rootScope.AddTicked($scope.startupdata.applications);
                    $rootScope.AddTicked($scope.startupdata.scopes);
                    $rootScope.AddTicked($scope.startupdata.sprints);
                    $scope.filters.modified_usr_id = "";
                    $scope.filters.startdate;
                    $scope.filters.enddate;

                    $rootScope.dates.startdate=null;
                    $rootScope.dates.enddate=null;

            };


            $scope.Search = function () {
                search();
            };

            function search() {

                var filterparameters = {
                    sprints: $scope.filters.sprints,
                    applications: $scope.filters.applications,
                    work_item_nm: $scope.filters.work_item_nm,
                    scopes: $scope.filters.scopes,
                    modified_usr_id: $scope.filters.modified_usr_id,
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate
                };

                var parameters = {
                    param: filterparameters
                };
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'SearchConfiguration'); //The Method Call from service to get all data;
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
        //Get single record : Configuration Detail based on config_id
        //tmp_xxx variables are for client side editing/updating

        var defer = $q.defer();
        $scope.GetConfiguration = function (id) {

            var parameters = {
                work_item_id:id
            };
            crudServiceController.search(parameters, CONTROLLERNAME, 'ConfigurationDetails').then(function (response) {
                defer.resolve(response.data);

                $scope.configuration = response.data.Configuration;
                $scope.tmp_configuration = angular.copy($scope.configuration);


                if (response.data.WorkItemDetails != null) {
                    $scope.tmp_configuration.work_item_ext_id = response.data.WorkItemDetails[0].work_item_ext_id;
                    $scope.tmp_configuration.sprint_id = response.data.WorkItemDetails[0].sprint_id;
                }

                $scope.SetSelectedData($scope.tmp_configuration);

                $scope.dynamicCSS.has_success_error = "";

                $scope.open('lg');
                return defer.promise;
            });
        }




        $scope.ShowDetails = function (row) {
            $scope.IsEdit = true;
            $scope.validation.isvalid = true; //edit
            $scope.GetConfiguration(row.entity.config_id);
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
                        return $scope.tmp_configuration;
                    }
                }
            });
            //Save
            uibModalInstance.result.then(function (updateddata) {
                $scope.tmp_configuration = updateddata;
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
                    var promisePut = crudServiceController.delete(row.entity.config_id, CONTROLLERNAME).then(function (pl) {
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
                $scope.configuration = angular.extend($scope.configuration, $scope.tmp_configuration);

                $scope.configuration.config_status_id = ($scope.selecteddata.status == null ? null : $scope.selecteddata.status.status_id);
                $scope.configuration.application_id = ($scope.selecteddata.application == null ? null : $scope.selecteddata.application.application_id);
                $scope.configuration.sprint_id = ($scope.selecteddata.sprint == null ? null : $scope.selecteddata.sprint.sprint_id);
                $scope.configuration.config_type_id = ($scope.selecteddata.config_type  == null ? null :$scope.selecteddata.config_type.config_type_id);
                $scope.configuration.scope_id = ($scope.selecteddata.scope == null ? null : $scope.selecteddata.scope.scope_id );

                var promisePut;
                if ($scope.configuration.config_id == 0) //Add
                {
                    promisePut = crudServiceController.post($scope.configuration, CONTROLLERNAME);

                }
                else //Update
                {
                     promisePut = crudServiceController.put($scope.configuration.config_id, $scope.configuration, CONTROLLERNAME);
                 }

                promisePut.then(function (pl) {
                    //$scope.Message = "Successfuly completed.";
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
                $scope.IsEdit = false;
                $scope.validation.isvalid = false; //add
                $scope.GetConfiguration(0);
            };
            /****************************************************************************************************/


            /****************************************************************************************************/
            //Delete record upon confirmation

      

            $scope.Delete = function (row) {
                var bodyText = 'Config ID : ' + row.entity.config_id + ' : ' + row.entity.config_key + '  Are you sure to delete?';
                $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

            }

    // Function to load all Configurations records

            $scope.SetSelectedData = function (tmp_configuration)
            {
                $scope.selecteddata.status = $filter('filter')($scope.startupdata.statuses, { status_id: tmp_configuration.config_status_id })[0];
                $scope.selecteddata.application = $filter('filter')($scope.startupdata.applications, { application_id: tmp_configuration.application_id })[0];
                $scope.selecteddata.sprint = $filter('filter')($scope.startupdata.sprints, { sprint_id: tmp_configuration.sprint_id })[0];
                $scope.selecteddata.config_type = $filter('filter')($scope.startupdata.config_types, { config_type_id: tmp_configuration.config_type_id })[0];
                $scope.selecteddata.scope = $filter('filter')($scope.startupdata.scopes, { scope_id: tmp_configuration.scope_id })[0];
            }

            function AddTickedForMultiSelect() {
                $rootScope.AddTicked($scope.startupdata.sprints, false);
                $rootScope.AddTicked($scope.startupdata.applications, false);
                $rootScope.AddTicked($scope.startupdata.scopes, false);

                //angular.forEach($scope.startupdata.scopes, function (value, key) {
                //    value.ticked = false;
                //});

            }


            $scope.onblur = function (controlname, inputvalue) {
                switch (controlname) {
                    case 'txtWorkItem':
                        {
                            var parameters = {
                                work_item_ext_id: inputvalue
                            };

                            $scope.validation.isvalid = false;
                            $scope.tmp_configuration.work_item_id = 0;

                            var promiseGet1 = crudServiceController.search(parameters, "COMMON", 'WorkItem'); //The Method Call from service to get all data;
                            promiseGet1.success(function (data) {
                                $scope.dynamicCSS.has_success_error = "has-error";
                                if (data.length == 0) return;

                                $scope.dynamicCSS.has_success_error = "has-success";
                                $scope.validation.isvalid = true;

                                $scope.selecteddata.sprint = $filter('filter')($scope.startupdata.sprints, { sprint_id: data[0].sprint_id })[0];
                                $scope.selecteddata.scope = $filter('filter')($scope.startupdata.scopes, { scope_id: data[0].scope_id })[0];
                               // angular.extend($scope.tmp_configuration.work_item_id, data[0].work_item_id);

                                $scope.tmp_configuration.work_item_id = data[0].work_item_id;

                                if (!$scope.$$phase) {
                                    $scope.$apply();
                                }

                            },

                            function (error1) {
                                $log.error('failure in search', error1);
                            });
                            break;
                        }
                    default:
                        break;
                }
            }

            $scope.startup();
            AddTickedForMultiSelect();
            search();
        }]);


// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

angular.module('myModule').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance, data) {
    $scope.ok = function (isvalid) {
        if ( isvalid ) $uibModalInstance.close(data);
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