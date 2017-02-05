'use strict';

app.controller("WorkItemController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "WORKITEM";

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

    $scope.GridData = {
        data: []
    };


    $scope.tmp_data = null;


    /****************************************************************************************************/
    //Start-up functions

    function startup() {

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
                exporterCsvFilename: 'WorkItems_' + new Date().toLocaleDateString() + '.csv',
                columnDefs: [
               { name: 'View', field: 'work_item_id', cellTemplate: myEditAndDeleteCellTemplate },
               { name: 'Name', field: 'work_item_ext_id' },
               { name: 'Scope', field: 'scope_nm' },
               { name: 'Sprint', field: 'sprint_nm' },
               { name: 'Title', field: 'work_item_title', width: "450"}
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
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'SearchWorkItem'); //The Method Call from service to get all data;
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
            $scope.GetDetail(row.entity.work_item_id);
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
                    var promisePut = crudServiceController.delete(row.entity.work_item_id, CONTROLLERNAME).then(function (pl) {
                        ngNotify.set('Successfully deleted', { type: 'warn' });
                        $scope.deleteflag = true;///// start here
                        search();
                    }, function (err) {
                        ngNotify.set('Failed while deleting - ' + err, { type: 'error' });
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

                $scope.data.sprint_id = ($scope.selecteddata.sprint == null ? null : $scope.selecteddata.sprint.sprint_id);
                $scope.data.scope_id = ($scope.selecteddata.scope == null ? null : $scope.selecteddata.scope.scope_id);

                var promisePut;
                if ($scope.data.work_item_id == 0) //Add
                {
                    promisePut = crudServiceController.post($scope.data, CONTROLLERNAME); 
                }
                else //Update
                {
                     promisePut = crudServiceController.put($scope.data.work_item_id, $scope.data, CONTROLLERNAME);
                }

                promisePut.then(function (pl) {
                    ngNotify.set('Successfully saved', { type: 'success' });
                    search();
                }, function (err) {
                    ngNotify.set('Failed while saving - ' + err, { type: 'error' });
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
                var bodyText = 'ID : ' + row.entity.work_item_ext_id + ' : ' + row.entity.work_item_title + '  Are you sure to delete?';
                $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

            }

    // Function to load all Configurations records

            $scope.SetSelectedData = function (tmp_data)
            {
                $scope.selecteddata.sprint = $filter('filter')($scope.startupdata.sprints, { sprint_id: tmp_data.sprint_id })[0];
                $scope.selecteddata.scope = $filter('filter')($scope.startupdata.scopes, { scope_id: tmp_data.scope_id })[0];
            }

            function AddTickedForMultiSelect() {
                $rootScope.AddTicked($scope.startupdata.sprints, false);
                $rootScope.AddTicked($scope.startupdata.applications, false);
                $rootScope.AddTicked($scope.startupdata.scopes, false);

            }



            $scope.onblur = function (controlname, inputvalue) {
                switch (controlname) {
                    case 'txtWorkItem':
                        {
                            var parameters = {
                                work_item_ext_id: inputvalue
                            };

                            $scope.validation.isvalid = false;

                            var promiseGet1 = crudServiceController.search(parameters, "COMMON", 'WorkItem'); //The Method Call from service to get all data;
                            promiseGet1.success(function (data) {
                                $scope.dynamicCSS.has_success_error = "has-error";
                                if (data.length > 0) return;

                                $scope.dynamicCSS.has_success_error = "has-success";
                                $scope.validation.isvalid = true;

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






            startup();
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