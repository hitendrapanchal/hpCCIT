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
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Data.Objects;

namespace eTrackerSol.Controllers
{
    public class ConfigurationAPIController : ApiController
    {
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("Configuration")]
        public Array GetConfiguration()
        {

            var entryPoint = (from configs in db.Configurations
                              join wkitems in db.WorkItems on configs.work_item_id equals wkitems.work_item_id
                              join status in db.Statuses on configs.config_status_id equals status.status_id into st
                              from sts in st.DefaultIfEmpty()
                              join application in db.Applications on configs.application_id equals application.application_id into ap
                              from app in ap.DefaultIfEmpty()
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              join sprint in db.Sprints on wkitems.sprint_id equals sprint.sprint_id into sp
                              from spr in sp.DefaultIfEmpty()
                              join config_type in db.Config_Types on configs.config_type_id equals config_type.config_type_id into ct
                              from cot in ct.DefaultIfEmpty()
                              //where e.OwnerID == user.UID
                              select new { configs.config_id,
                                  configs.config_nm,
                                  configs.config_key,
                                  configs.config_dev_int_value,
                                  configs.config_qa_value,
                                  configs.config_prod_value,
                                  configs.config_status_id, 
                                  configs.config_type_id,
                                  configs.application_id,
                                    wkitems.sprint_id,
                                  wkitems.work_item_ext_id,
                                    wkitems.scope_id,
                                  configs.is_pdf,
                                  configs.pdfaction,
                                  configs.comments,
                                  app.application_nm,
                                  sco.scope_nm,
                                  spr.sprint_nm,
                                  sts.status_nm,
                                   cot.config_type_nm
                              }).ToList();
            
            //return db.Configurations.AsEnumerable();

            return entryPoint.ToArray();
        }

   
        // GET api/ConfigurationAPI/5
        [ActionName("Configuration")]
        public configuration_ref GetConfiguration(int id)
        {
            if (id == 0) return GetEmptyConfiguration(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            configuration_ref configuration = db.Configurations.Find(id);
            if (configuration == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return configuration;
        }


        // GET api/ConfigurationAPI/ConfigurationDetails
        [ActionName("ConfigurationDetails")]
        public object GetConfigurationDetails(int work_item_id)
        {
            configuration_ref returnconfiguration_ref= new configuration_ref(); 
            object returnwork_item_ref=null;

            //Used to create empty structure for configuration_ref for ADD-NEW-Record
            if (work_item_id != 0)
            {
                returnconfiguration_ref = GetConfiguration(work_item_id);
                if (returnconfiguration_ref != null && returnconfiguration_ref.work_item_id != null && returnconfiguration_ref.work_item_id >= 0)
                { 
                     returnwork_item_ref = (new WorkItemAPIController()).GetWorkItemDetails(returnconfiguration_ref.work_item_id);
                }
            }

            var returnObject = new { Configuration = returnconfiguration_ref , WorkItemDetails = returnwork_item_ref };
            return returnObject;
        }

        // GET api/ConfigurationAPI/0
        private configuration_ref GetEmptyConfiguration()
        {
            return new configuration_ref();
        }


        //        public Array GetConfiguration(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate=null, DateTime? enddate=null)

        // GET api/ConfigurationAPI
        [ActionName("SearchConfiguration")]
        public object GetSearchConfiguration([FromUri] object param)
        {

            CommonFilters commfilters = new CommonFilters();
            commfilters.DeserializeParameters(param);

            db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);
            var entryPoint = (from configs in db.Configurations
                              join wkitems in db.WorkItems on configs.work_item_id equals wkitems.work_item_id
                              join status in db.Statuses on configs.config_status_id equals status.status_id  
                              join application in db.Applications on configs.application_id equals application.application_id
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id
                              join sprint in db.Sprints on wkitems.sprint_id equals sprint.sprint_id  
                              join config_type in db.Config_Types on configs.config_type_id equals config_type.config_type_id
                              where (String.IsNullOrEmpty(commfilters.work_item_nm) || commfilters.work_item_nm.Contains(wkitems.work_item_ext_id))
                                    && (String.IsNullOrEmpty(commfilters.modified_usr_ids) || commfilters.modified_usr_ids.Contains(configs.modified_usr_id))
                                    && ((commfilters.startdate == null || configs.modified_dtm==null) || configs.modified_dtm >= commfilters.startdate)
                                    && ((commfilters.enddate == null || configs.modified_dtm==null) || configs.modified_dtm <= commfilters.enddate)
                              select new
                              {
                                  configs.config_id,
                                  configs.config_nm,
                                  configs.config_key,
                                  configs.config_dev_int_value,
                                  configs.config_qa_value,
                                  configs.config_prod_value,
                                  configs.config_status_id,
                                  configs.config_type_id,
                                  configs.application_id,
                                  wkitems.sprint_id,
                                  wkitems.work_item_ext_id,
                                  wkitems.scope_id,
                                  configs.is_pdf,
                                  configs.pdfaction,
                                  configs.comments,
                                  application.application_nm,
                                  scope.scope_nm,
                                  sprint.sprint_nm,
                                  status.status_nm,
                                  config_type.config_type_nm
                              }).ToList();

            //return db.Configurations.AsEnumerable();
            db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            // Apply filters
            var filtereddata = (from dbdata in entryPoint
                                where ((commfilters.applications==null || commfilters.applications.Count == 0) || commfilters.applications.Any(cp => cp.application_id.Equals(dbdata.application_id)))
                          && ((commfilters.scopes==null || commfilters.scopes.Count == 0) || commfilters.scopes.Any(cp => cp.scope_id.Equals(dbdata.scope_id)))
                          && ((commfilters.sprints ==null || commfilters.sprints.Count == 0) || commfilters.sprints.Any(cp => cp.sprint_id.Equals(dbdata.sprint_id)))
                                select dbdata);


            return filtereddata.ToArray();
        }


   

        ////GET with multiple parameter
        //[ActionName("Configuration")]
        //public IEnumerable<configuration_ref> GetConfiguration(string sprint_nm, string application_nm)
        //{

        //    var query = from a in db.Configurations
        //               // where (a.sprint_nm == sprint_nm && a.application_nm == application_nm)
        //                select a;
        //    IEnumerable<configuration_ref> configurations = query.AsEnumerable<configuration_ref>();


        //    if (configurations == null)
        //    {
        //        throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
        //    }
        //    return configurations;
        //}

        // PUT api/ConfigurationAPI/5
        [ActionName("Configuration")]
        public HttpResponseMessage PutConfiguration(int id, configuration_ref configuration)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != configuration.config_id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(configuration).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // POST api/ConfigurationAPI
        [ActionName("Configuration")]
        public HttpResponseMessage PostConfiguration(configuration_ref configuration)
        {
            if (ModelState.IsValid)
            {
                db.Configurations.Add(configuration);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, configuration);
                //response.Headers.Location = new Uri(Url.Link("ApiByName", new { id = configuration.config_id }));
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        // DELETE api/ConfigurationAPI/5
        [ActionName("Configuration")]
        public HttpResponseMessage DeleteConfiguration(int id)
        {
            configuration_ref configuration = db.Configurations.Find(id);
            if (configuration == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Configurations.Remove(configuration);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, configuration);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}