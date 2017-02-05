using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using eTrackerSol.Models;
using eTrackerSol.Common;
using System.Collections;
using System.Runtime.Caching;

namespace eTrackerSol.Controllers
{
    public class CommonAPIController : ApiController
    {
        private DataContext db = new DataContext();
        MemoryCache eTrackerMemCache = MemoryCache.Default;
        
        // GET api/ReleaseAPI
        [ActionName("MasterData")]
        public object GetMasterData()
        {

            var returnObject = GlobalCachingProvider.Instance.GetItem(Constants.CACHE_KEY_MASTERDATA);
            if (returnObject == null)
            {

                returnObject = new
                {
                    applications = GetApplication(),
                    sprints = GetSprint(),
                    config_types = GetConfig_Type(),
                    statuses = GetStatus(),
                    scopes = GetScope(),
                    servertypes = GetServerTypes(),
                    servers = GetServers(),
                    deploymentenvironments = GetDeploymentEnvironments(),
                    deployment_mse_environments = GetDeploymentMSEEnvironments(),
                    deploymenttypes = GetDeploymentTypes(),
                    reportparts = GetRFCReportParts(),
                    types = GetTypes(),

                };

                GlobalCachingProvider.Instance.AddItem(Constants.CACHE_KEY_MASTERDATA, returnObject);
            }
            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return returnObject;

        }


        // GET api/CommonAPI/Application
        [ActionName("Application")]
        public Array GetApplication()
        {
            return db.Applications.OrderBy(x => x.application_nm).ToArray();

        }

        [ActionName("Types")]
        public Array GetTypes()
        {
            return db.Types.OrderBy(x => x.type_nm).ToArray();
        }
        [ActionName("SubTypes")]
        public Array GetSubTypes()
        {
            return db.SubTypes.ToArray();
        }

        [ActionName("SubTypesForType")]
        public Array GetSubTypesForType(int id)
        {
            var subtypeslocal= (from subtypes in db.SubTypes
                                where subtypes.type_id == id
                                select subtypes).ToList();
            return subtypeslocal.OrderBy(x => x.sub_type_nm).ToArray();
        }

        // GET api/CommonAPI/Application
        [ActionName("RFCReportParts")]
        public Array GetRFCReportParts()
        {
            return db.ReportParts.OrderBy(x => x.report_part_nm).ToArray();
        }

        // GET api/CommonAPI/Sprint
        [ActionName("Sprint")]
        public Array GetSprint()
        {
            return db.Sprints.OrderBy(x => x.sprint_nm).ToArray();
        }

        // GET api/CommonAPI/Config_Types
        [ActionName("Config_Type")]
        public Array GetConfig_Type()
        {
            return db.Config_Types.OrderBy(x => x.config_type_nm).ToArray();
        }

        // GET api/CommonAPI/Config_Types
        [ActionName("Status")]
        public Array GetStatus()
        {
            return db.Statuses.OrderBy(x => x.status_nm).ToArray();
        }
        // GET api/CommonAPI/Config_Types
        [ActionName("Scope")]
        public Array GetScope()
        {
            return db.Scopes.OrderBy(x => x.scope_nm).ToArray();
        }

        [ActionName("ServerTypes")]
        public Array GetServerTypes()
        {
            return db.ServerTypes.OrderBy(x => x.server_type_nm).ToArray();
        }

        [ActionName("Servers")]
        public Array GetServers()
        {
            return db.Servers.OrderBy(x => x.server_nm).ToArray();
        }

        [ActionName("DeploymentEnvironments")]
        public Array GetDeploymentEnvironments()
        {
            return db.DeploymentEnvironments.OrderBy(x => x.deployment_environment_nm).ToArray();
        }

        [ActionName("DeploymentMSEEnvironments")]
        public Array GetDeploymentMSEEnvironments()
        {
            return db.DeploymentMSEEnvironments.OrderBy(x => x.deployment_mse_environment_nm).ToArray();
        }

        [ActionName("DeploymentTypes")]
        public Array GetDeploymentTypes()
        {
            return db.DeploymentTypes.OrderBy(x => x.deployment_type_nm).ToArray();
        }


        [ActionName("RFCTemplateFiles")]
        public Array GetRFCTemplateFiles()
        {
            CommonFunctions commfun = new CommonFunctions();
            Dictionary<string, string> files = commfun.GetFiles(commfun.GetApplicationPath() + Constants.RFCTemplatesPath);

            return files.OrderBy(x => x.Value).ToArray();
        }

        // GET api/ReleaseAPI
        [ActionName("WorkItems")]
        public Array GetWorkItems()
        {
            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            var entryPoint = (from  wkitems in db.WorkItems
                              join spr in db.Sprints on wkitems.sprint_id equals spr.sprint_id into sprint
                              from sprnt in sprint.DefaultIfEmpty()
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              select new
                              {
                                  sprnt.sprint_nm,
                                  sco.scope_nm,
                                  wkitems.work_item_ext_id, //VOICE-3233
                                  wkitems.work_item_title,
                                  wkitems.work_item_id
                              }).ToList();

           return entryPoint.ToArray();
        }

        // GET api/ReleaseAPI
        [ActionName("WorkItem")]
        public Array GetWorkItem(string work_item_ext_id)
        {

            var entryPoint = (from wkitems in db.WorkItems
                              join spr in db.Sprints on wkitems.sprint_id equals spr.sprint_id into sprint
                              from sprnt in sprint.DefaultIfEmpty()
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              where wkitems.work_item_ext_id == work_item_ext_id
                              select new
                              {
                                  sprnt.sprint_id,
                                  sprnt.sprint_nm,
                                  sco.scope_id,
                                  sco.scope_nm,
                                  wkitems.work_item_ext_id, //VOICE-3233
                                  wkitems.work_item_title,
                                  wkitems.work_item_id
                              }).ToList();

            return entryPoint.ToArray();
        }



        [ActionName("APITypes")]
        public Array GetAPITypes()
        {
            return db.APITypes.OrderBy(x => x.api_type_nm).ToArray();
        }

        [ActionName("Clients")]
        public Array GetClients()
        {
            return db.Clients.ToArray();
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}