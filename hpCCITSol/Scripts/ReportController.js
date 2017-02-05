'use strict';

app.controller("ReportController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', '$templateCache', 'NgTableParams', 'ngNotify', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter, $templateCache, NgTableParams, ngNotify) {




    /****************************************************************************************************/
    //Variable declaration
    var CONTROLLERNAME = "REPORT";

    $rootScope.dates = {
        startdate: new Date(),
        enddate: new Date()
    };
    $rootScope.dates.startdate.setMonth(new Date().getMonth() - 1);
    $scope.reportdata = null;

    $scope.startupdata = {
        applications: [],
        sprints: [],
        config_types: [],
        scopes: [],
        statuses: [],
        intervals: [{ key: 5, value: '5 Minutes' },
                        { key: 10, value: '10 Minutes' },
                        { key: 15, value: '15 Minutes' },
                        { key: 30, value: '30 Minutes' },
                        { key: 60, value: '1 Hours' },
                        { key: 120, value: '2 Hours' },
                        { key: 180, value: '3 Hours' }
],
        reportoutputs: [{ key: 1, value: 'CSV' }, { key: 2, value: 'HTML' }, { key: 3, value: 'PDF' }]
    };


    $scope.ShowHide = {
        SearchBox: false
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
        status: [],
        report_id:[]
    };

    $scope.filters = {
        interval: [],
        reportoutput : [],
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
    $scope.tmp_report_data = null;
    

    /****************************************************************************************************/
    //Start-up functions

    function startup() {

        $scope.filters.interval = $scope.startupdata.intervals[3].key;
        $scope.filters.reportoutput = $scope.startupdata.reportoutputs[0].key;


    }


        /****************************************************************************************************/
        //ui-grid 

            var myEditAndDeleteCellTemplate = '<div class="text-center" style="padding-top: 3px;"><button type="button" class="btn btn-info btn-xs" ng-click="grid.appScope.ShowDetails(row)">Edit <span class="glyphicon glyphicon-edit"></span></button>&nbsp;' +
                                           ' <button type="button" class="btn btn-danger btn-xs" ng-click="grid.appScope.Delete(row)">Delete <span class="glyphicon glyphicon-remove"></span></button>&nbsp;' +
                                            ' <button type="button" class="btn btn-success btn-xs" ng-click="grid.appScope.ShowReportScheduler(row.entity.report_id)">Scheduler</button> </div>';


            $scope.gridOptions1 = {

                enableFullRowSelection: true,
                enableRowSelection: true,
                multiSelect: false,
                enableRowHeaderSelection: false,

                data: 'GridData.data',
                enableFiltering: true,
                columnDefs: [
               { name: 'View', field: 'report_id', cellTemplate: myEditAndDeleteCellTemplate, enableFiltering: false, width: "250" },
               { name: 'Report Name', field: 'report_nm' },
               //{ name: 'Description', field: 'report_descr', width: "450" }
                ],
                onRegisterApi: function (gridApi) {
                    $scope.gridApi = gridApi;

                    gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                        $scope.ReportDetails(row.entity.report_id);

                    });


                }


            };

            $scope.ShowReportScheduler= function (report_id) {
                $scope.GetDetail(report_id, 'scheduler');
            }


            $scope.openReportScheduler = function (size) {

                //$templateCache.remove('myReport.html');

                var uibModalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'myModalScheduler.html',
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






        /****************************************************************************************************/
        //Get single record : Detail based on id
        //tmp_xxx variables are for client side editing/updating

        var defer = $q.defer();
        $scope.GetDetail = function (id, modelname) {
            modelname = modelname || "";

            crudServiceController.get(id, CONTROLLERNAME).then(function (response) {
                defer.resolve(response.data);
                $scope.data = response.data;
                $scope.tmp_data = angular.copy($scope.data);
                $scope.SetSelectedData($scope.tmp_data);

                if ($scope.IsEdit) {
                    $scope.validation.isvalid = true;
                    $scope.dynamicCSS.has_success_error = "";
                }
                if (modelname == 'scheduler')
                {
                    $scope.openReportScheduler('md');
                }
                else
                {
                    $scope.open('lg');
                }

                return defer.promise;
            });
        }


        $scope.SetSelectedData = function (tmp_data) {
            $scope.selecteddata.scheduler_interval_minutes = tmp_data.scheduler_interval_minutes;
            $scope.selecteddata.scheduler_interval_minutes = tmp_data.scheduler_interval_minutes;
            //console.log($scope.selecteddata
        }


        $scope.ShowDetails = function (row) {
            $scope.IsEdit = true;
            $scope.GetDetail(row.entity.report_id);
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
                    var promisePut = crudServiceController.delete(row.entity.report_id, CONTROLLERNAME).then(function (pl) {
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
    //Report- Dialog

        $scope.openReport = function (size) {

            //$templateCache.remove('myReport.html');

            var uibModalInstance = $uibModal.open({
                animation: true,
                templateUrl: 'myReport.html',
                controller: 'ModalInstanceCtrl',
                scope: $scope,
                size: size,
                resolve: {
                    data: function () {
                        return $scope.tmp_report_data;
                    }
                }
            });
            //Save
            uibModalInstance.result.then(function (updateddata) {
                //$scope.tmp_data = updateddata;
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
                if ($scope.data.report_id== 0) //Add
                {
                    promisePut = crudServiceController.post($scope.data, CONTROLLERNAME); 
                }
                else //Update
                {
                    promisePut = crudServiceController.put($scope.data.report_id, $scope.data, CONTROLLERNAME);
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
                var bodyText = 'ID : ' + row.entity.report_id + ' : ' + row.entity.report_nm + '  Are you sure to delete?';
                $scope.openDialogConfirm(row, 'Delete', bodyText, 'Cancel', 'Delete');

            }

    // Function to load all Configurations records


       

            //Click on report grid
            $scope.ReportDetails = function (report_id) {

                $scope.selecteddata.report_id = report_id;

                var filterparameters = {
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate,
                    report_id: report_id
                };

                var parameters = {
                    param: filterparameters
                };


                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'Report'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    $scope.ShowHide.SearchBox = true;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }

                },

                function (error1) {
                    $log.error('failure in search', error1);
                });
            }


            $scope.EnableDisableSchedulingTimer = function () {


                var filterparameters = {
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate,
                    report_id: $scope.selecteddata.report_id,
                    interval: $scope.filters.interval
                };

                var parameters = {
                    param: filterparameters
                };
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'StartSchedulingTimer'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    //$scope.tmp_report_data = data;
                },

                function (error1) {
                    $log.error('failure in search', error1);
                });
            }


            $scope.ExecuteReport= function () {


                var filterparameters = {
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate,
                    report_id: $scope.selecteddata.report_id,
                    interval:$scope.filters.interval
                };

                var parameters = {
                    param: filterparameters
                };
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'ExecuteReport'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {

                    $scope.tmp_report_data = data;
                    $scope.tableParams = new NgTableParams({}, { dataset: $scope.tmp_report_data.reportdata });
                    $scope.openReport('lg');
                },

                function (error1) {
                    $log.error('failure in search', error1);
                });
            }

            $scope.SendEmail = function () {

                //var divreportdata = document.getElementById('divreportdata');
               // $scope.reportdata = angular.element(divreportdata).html();
                
                //var linkedfun = $compile(divreportdata);
                //var result = linkedfun($scope);

                //console.log(divreportdata);
                //return;

                var filterparameters = {
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate,
                    report_id: $scope.selecteddata.report_id,
                    interval: $scope.filters.interval,
                    reportdata:$scope.reportdata
                };


                var parameters = {
                    param: filterparameters
                };


                var promiseGet1 = crudServiceController.post(filterparameters, CONTROLLERNAME, 'SendEmail'); //The Method Call from service to get all data;
                promiseGet1.success(function (data) {
                    ngNotify.set(data);
                },

                function (error1) {
                    console.log("My custom : " + error1);
                    $log.error('failure in Sendemail', error1);
                });

                promiseGet1.error(function (data) {
                    ngNotify.set(data, {type: 'error'});
                }
                    )
                ;
            }

            function search() {

                var filterparameters = {
                    startdate: $rootScope.dates.startdate,
                    enddate: $rootScope.dates.enddate
                };

                var parameters = {
                    param: filterparameters
                };
                var promiseGet1 = crudServiceController.search(parameters, CONTROLLERNAME, 'Report'); //The Method Call from service to get all data;
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