'use strict';


var app = angular.module("myModule", ['ui.grid', 'ui.grid.edit', 'ui.grid.rowEdit', 'ui.grid.cellNav', 'ngAnimate', 'ui.bootstrap', 'ui.grid.selection', 'ngMaterial', 'ngAria', 'isteven-multi-select', 'ngRoute', 'ui.grid.autoResize', 'ngTable','angular.filter', 'ngNotify', 'ui.grid.draggable-rows', 'ui.grid.exporter', 'ui.grid.treeView', 'ui.grid.grouping']);



app.controller("myAppStartController", ['$scope', '$http', '$uibModal', '$log', '$rootScope', 'crudService', 'crudServiceController', '$q', 'uiGridConstants', '$timeout', '$filter', function ($scope, $http, $uibModal, $log, $rootScope, crudService, crudServiceController, $q, uiGridConstants, $timeout, $filter) {


    //Global Data Declaration
    /****************************************************************************************************/

    $rootScope.GlobalMasterData = {
        applications: [],
        sprints: [],
        config_types: [],
        scopes: [],
        statuses: []
    };

    $scope.ApplicationStart = function () {

        $scope.PopulateMasterData();
    }



    //Add and Remove Ticket is used for Multi Select drop down
    $rootScope.AddTicked = function (data, defaultvalue) {
        defaultvalue = defaultvalue || false;   //set default value to false
        angular.forEach(data, function (value, key) {

            value.ticked = defaultvalue;
        });
    }

    $rootScope.RemoveTicked = function (data) {
        angular.forEach(data, function (value, key) {
            delete value.ticked;
        });
    }

    //Add and Remove Ticket is used for Multi Select drop down
    $rootScope.SetSelectedTickedValue = function (data, selecteddata, key) {
        angular.forEach(data, function (dataitem, k1) {
            dataitem.ticked = false;
            angular.forEach(selecteddata, function (selecteditem, k2) {
                if (dataitem[key] == selecteditem[key]) {
                    dataitem.ticked = true;
                }
            });

        });


    }




    $scope.PopulateMasterData = function () {

            //get all applications
            var promiseGet = crudService.masterdata();
            promiseGet.success(function (data) {
                $rootScope.GlobalMasterData.applications = data["applications"];
                $rootScope.GlobalMasterData.sprints = data["sprints"];
                $rootScope.GlobalMasterData.config_types = data["config_types"];
                $rootScope.GlobalMasterData.scopes = data["scopes"];
                $rootScope.GlobalMasterData.statuses = data["statuses"];
            },
            function (error1) {
                $log.error('failure startup masterdata', error1);
            });

        }

}]);


//angular.module('myModule').config(['fileManagerConfigProvider', function (config) {
//    var defaults = config.$get();
//    config.set({
//        appName: 'angular-filemanager',
//        pickCallback: function (item) {
//            var msg = 'Picked %s "%s" for external use'
//              .replace('%s', item.type)
//              .replace('%s', item.fullPath());
//            window.alert(msg);
//        },

//        allowedActions: angular.extend(defaults.allowedActions, {
//            pickFiles: true,
//            pickFolders: false,
//        }),
//    });
//}]);


/************************************************************************************************************/
// Template Cache
/************************************************************************************************************/

//// HACK: we ask for $injector instead of $compile, to avoid circular dep
//app.factory('$templateCache', function ($cacheFactory, $http, $injector) {
//    var cache = $cacheFactory('templates');
//    var allTplPromise;

//    return {
//        get: function (url) {
//            var fromCache = cache.get(url);

//            // already have required template in the cache
//            if (fromCache) {
//                return fromCache;
//            }

//            // first template request ever - get the all tpl file
//            if (!allTplPromise) {
//                allTplPromise = $http.get('content/others/all-templates.html').then(function (response) {
//                    // compile the response, which will put stuff into the cache
//                    $injector.get('$compile')(response.data);
//                    return response;
//                });
//            }

//            // return the all-tpl promise to all template requests
//            return allTplPromise.then(function (response) {
//                return {
//                    status: response.status,
//                    data: cache.get(url)
//                };
//            });
//        },

//        put: function (key, value) {
//            cache.put(key, value);
//        }
//    };
//});



/************************************************************************************************************/
// App Configuration
/************************************************************************************************************/

//app.config(function ($routeProvider) {
//    $routeProvider.when('/myModalDailogContent', { templateUrl: 'myModalDailogContent.html' });
//    $routeProvider.when('/two', { templateUrl: 'two.html' });
//});