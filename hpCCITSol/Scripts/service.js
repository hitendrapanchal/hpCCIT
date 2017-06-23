/// <reference path="../angular.js" />
/// <reference path="Module.js" />


app.service('crudService', function ($http, $rootScope, $location) {


    //Get master tables
    var url = $location.protocol() + "://" + $location.host() + ":" + $location.port();


    this.masterdata = function () {
        return $http.get(url + "/api/CommonAPI/MasterData");
    }

    this.application = function () {
        return $http.get(url + "/api/CommonAPI/Application");
    }

    this.sprint = function () {
        return $http.get(url + "/api/CommonAPI/Sprint");
    }

    this.config_type = function () {
        return $http.get(url + "/api/CommonAPI/Config_Type");
    }

    this.status = function () {
        return $http.get(url + "/api/CommonAPI/Status");
    }
    this.scope = function () {
        return $http.get(url + "/api/CommonAPI/Scope");
    }



    this.GetWorkItemDetails = function (parameters) {


        var config = {
            params: parameters
        };

        return $http.get(url + "/api/WorkItemAPI/WorkItemDetails", config);

    }


});





app.service('crudServiceController', function ($http, $rootScope, $location) {

    var apicontollerurl = "";


    function getApiController(controllername, actionname) {
        actionname = actionname || "";

        var url = $location.protocol() + "://" + $location.host() + ":" + $location.port();

        switch (controllername) {
            case "RELEASE":
                {
                    apicontollerurl = "/api/ReleaseAPI/Release";
                    break;
                }
            case "CONFIGURATION":
                {
                    apicontollerurl = "/api/ConfigurationAPI/Configuration";
                    break;
                }

            case "SETTINGS":
                {
                    apicontollerurl = "/api/SettingsAPI/Settings";
                    break;
                }
            case "COMMON":
                {
                    apicontollerurl = "/api/CommonAPI/Common";
                    break;
                }
            case "WORKITEM":
                {
                    apicontollerurl = "/api/WorkItemAPI/WorkItem";
                    break;
                }
            case "REPORT":
                {
                    apicontollerurl = "/api/ReportAPI/Report";
                    break;
                }
            case "VALIDATION":
                {
                    apicontollerurl = "/api/ValidationAPI/Validation";
                    break;
                }
            case "CHECKLIST":
                {
                    apicontollerurl = "/api/CheckListAPI/CheckList";
                    break;
                }
            case "CHECKLISTACTION":
                {
                    apicontollerurl = "/api/CheckListActionAPI/CheckListAction";
                    break;
                }
            case "APIMGMT":
                {
                    apicontollerurl = "/api/APIMgmtAPI/APIMgmt";
                    break;
                }

            case "INVENTORY":
                {
                    apicontollerurl = "/api/InventoryAPI/Inventory";
                    break;
                }
        }

        if (actionname != "") apicontollerurl = apicontollerurl.substring(0, apicontollerurl.lastIndexOf("/") + 1) + actionname;
        console.log(url + apicontollerurl);
        return url + apicontollerurl;
    }

    //Create new record
    this.post = function (mydata, controllername, actionname) {
        var request = $http({
            method: "post",
            url: getApiController(controllername, actionname),
            data: mydata
        });
        return request;
    }


    //Get Single Records
    this.get = function (id, controllername, actionname) {
        return $http.get(getApiController(controllername, actionname) + "/" + id);
    }


    //Get All 
    this.getAllData = function (controllername) {
        return $http.get(getApiController(controllername));
    }

    //Get All 
    this.getAllActionData = function (controllername, actionname) {
        return $http.get(getApiController(controllername, actionname));
    }

    //Get custom records
    this.search = function (parameters, controllername, actionname) {
        console.log('In search');
        var config = {
            params: parameters
        };
        return $http.get(getApiController(controllername, actionname), config);
    }

    //Get custom records
    this.execute = function (parameters, controllername, actionname) {

        var config = {
            params: parameters
        };
        return $http.get(getApiController(controllername, actionname), config);
    }


    //Update the Record
    this.put = function (id, mydata, controllername, actionname) {

        var request = $http({
            method: "put",
            url: getApiController(controllername, actionname) + "/" + id,
            data: mydata
        });
        return request;
    }
    //Delete the Record
    this.delete = function (id, controllername, actionname) {
        var request = $http({
            method: "delete",
            url: getApiController(controllername, actionname) + "/" + id
        });
        return request;
    }

    //Delete the Record
    this.saveasword = function (id, controllername, actionname, filename) {
        $http.post(getApiController(controllername, actionname) + "/" + id, id, { responseType: 'arraybuffer' })
          .success(function (data) {
              var file = new Blob([data], { type: 'application/msword' });
              saveAs(file, filename);
          });
    }

    function saveAs(blob, fileName) {
        var url = window.URL.createObjectURL(blob);

        var doc = document.createElement("a");
        doc.href = url;
        doc.download = fileName;
        doc.click();
        window.URL.revokeObjectURL(url);
    }



});



app.service('CommonServices', function (uiGridExporterConstants, uiGridExporterService) {

    //UI-Grid : CSV Export
    this.exportCSV = function (filename, grid) {
        var exportService = uiGridExporterService;
        var grid = grid;
        var fileName = filename + Date() + '.csv';

        exportService.loadAllDataIfNeeded(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE).then(function () {
            var exportColumnHeaders = exportService.getColumnHeaders(grid, uiGridExporterConstants.VISIBLE);
            var exportData = exportService.getData(grid, uiGridExporterConstants.ALL, uiGridExporterConstants.VISIBLE);
            var csvContent = exportService.formatAsCsv(exportColumnHeaders, exportData, grid.options.exporterCsvColumnSeparator);
            exportService.downloadFile(fileName, csvContent, grid.options.exporterOlderExcelCompatibility);
        });
    };


});

