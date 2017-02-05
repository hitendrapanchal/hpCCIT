'use strict';


var app = angular.module("myModule", ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ngAnimate', 'ui.bootstrap', 'ui.grid.selection', 'ngMaterial', 'ngAria','isteven-multi-select'])

app.controller("myCommonController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', '$q', 'uiGridConstants', '$timeout', '$filter', function ($scope, $http, $uibModal, $log, $rootScope, crudService, $q, uiGridConstants, $timeout, $filter) {




    /****************************************************************************************************/
    //Variable declaration

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
        statuses: []
    };


    $scope.selecteddata = {
        application: [],
        sprint: [],
        config_type: [],
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
        startdate :null,
        enddate:null
    }
    ;

    $scope.GridData = {
        data: []
    };


  

    /****************************************************************************************************/
    //Start-up functions

    $scope.startup = function () {

        //get all applications
        var promiseGet = crudService.application();
        promiseGet.success(function (data) {
            $scope.startupdata.applications = data;
        },
        function (error1) {
            $log.error('failure startup application', error1);
        });


        //get all sprints
        var promiseGet = crudService.sprint();
        promiseGet.success(function (data) {
            $scope.startupdata.sprints = data;
        },
        function (error1) {
            $log.error('failure startup sprint', error1);
        });

        //get all config_types
        var promiseGet = crudService.config_type();
        promiseGet.success(function (data) {
            $scope.startupdata.config_types = data;
        },
        function (error1) {
            $log.error('failure startup config_type', error1);
        });

        //get all status
        var promiseGet = crudService.status();
        promiseGet.success(function (data) {
            $scope.startupdata.statuses = data;
        },
        function (error1) {
            $log.error('failure startup status', error1);
        });

        //get all scope
        var promiseGet = crudService.scope();
        promiseGet.success(function (data) {
            $scope.startupdata.scopes = data;
        },
        function (error1) {
            $log.error('failure startup scope', error1);
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
                exporterCsvFilename: 'myFile.csv',
                columnDefs: [
               { name: 'View', field: 'config_id', cellTemplate: myEditAndDeleteCellTemplate },
               { name: 'Name', field: 'config_nm' },
               { name: 'Type', field: 'sprint_nm' },
               { name: 'Application', field: 'application_nm' },
               { name: 'Work Item', field: 'work_item_nm' },
               { name: 'Key', field: 'config_key' },
               { name: 'Type', field: 'config_type_nm' },
               { name: 'Sprint', field: 'sprint_nm' },
               { name: 'Status', field: 'status_nm' }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;
                }
            };





            
            /****************************************************************************************************/
            //Load all configuration
            //loadConfigurations();


           // Function to load all Configurations records
            $scope.loadConfigurations = function () {

                var promiseGet = crudService.getConfigurations(); //The Method Call from service to get all data;
                promiseGet.success(function (data) {
                    $scope.GridData.data = data;
                },

                function (error1) {
                    $log.error('failure loading configuration', error1);
                });
            }


            $scope.SearchClear = function () {

                    $scope.filters.sprint_nm= "";
                    $scope.filters.application_nm="";
                    $scope.filters.work_item_nm="";
                    $scope.filters.scope=null;
                    $scope.filters.scope_id=0;
                    $scope.filters.sprint_id=null;
                    $scope.filters.application_id=null;
                    $scope.filters.modified_usr_id="";
                    $scope.filters.startdate;
                    $scope.filters.enddate;

                    $rootScope.dates.startdate=null;
                    $rootScope.dates.enddate=null;

            };


            $scope.Search = function () {
                search();
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



                var promiseGet1 = crudService.search(parameters); //The Method Call from service to get all data;
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
            crudService.get(id).then(function (response) {
                defer.resolve(response.data);
                $scope.configuration = response.data;
                $scope.tmp_configuration = angular.copy($scope.configuration);
                $scope.SetSelectedData($scope.tmp_configuration);
                $scope.open('lg');
                return defer.promise;
            });
        }



        $scope.ShowDetails = function (row) {
            $scope.IsEdit = true;
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
                templateUrl: 'myModalDailogContent.html',
                controller: 'ModalConfirmInstanceCtrl',
                scope: $scope,
                size: 'lg',
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
                    var promisePut = crudService.delete(row.entity.config_id).then(function (pl) {
                        $scope.Message = "Successfuly completed.";
                        $scope.deleteflag = true;///// start here
                        $scope.loadConfigurations();
                    }, function (err) {
                        console.log("Err" + err);
                    });
                }
            }, function () {

            });
        };

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
                    promisePut = crudService.post($scope.configuration); 
                }
                else //Update
                {
                     promisePut = crudService.put($scope.configuration.config_id, $scope.configuration);
                }

                promisePut.then(function (pl) {
                    $scope.Message = "Successfuly completed.";
                    $scope.loadConfigurations();
                }, function (err) {
                    console.log("Err" + err);
                });
            }


            /****************************************************************************************************/
            //Add New - Clear all input fields

            $scope.AddNew = function () {
                $scope.IsEdit = false;
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
                angular.forEach($scope.startupdata.scopes, function (value, key) {
                    value.ticked = false;
                });

            }


            $scope.startup();
            AddTickedForMultiSelect();
   

            //$scope.loadConfigurations();
            search();
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




//angular.module('myModule').controller('ModalConfirmInstanceCtrl', function ($scope, $uibModalInstance, data) {


//    $scope.ok = function (btnresponse) {
//        $uibModalInstance.close(btnresponse);   //true
//    };



//    $scope.close = function (btnresponse) {
//        $uibModalInstance.close(btnresponse);       //false
//    };


//});


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