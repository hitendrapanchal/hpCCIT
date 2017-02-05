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
    public class WorkItemAPIController : ApiController
    {
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("WorkItem")]
        public Array GetWorkItem()
        {

            var entryPoint = (from wkitems in db.WorkItems
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              join sprint in db.Sprints on wkitems.sprint_id equals sprint.sprint_id into sp
                              from spr in sp.DefaultIfEmpty()
                              select new {
                                  wkitems.sprint_id,
                                  wkitems.work_item_ext_id,
                                  wkitems.scope_id,
                                  sco.scope_nm,
                                  spr.sprint_nm
                              }).ToList();
            
            return entryPoint.ToArray();
        }


        // GET api/ConfigurationAPI/5
        [ActionName("WorkItem")]
        public work_item_ref GetWorkItem(int id)
        {
            if (id == 0) return GetEmptyWorkItem(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            work_item_ref workitem = db.WorkItems.Find(id);
            if (workitem == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return workitem;
        }

        // GET api/ConfigurationAPI/0
        private work_item_ref GetEmptyWorkItem()
        {
            return new work_item_ref();
        }


        //        public Array GetConfiguration(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate=null, DateTime? enddate=null)

        // GET api/ConfigurationAPI
        [ActionName("SearchWorkItem")]
        public object GetSearchWorkItem([FromUri] object param)
        {

            CommonFilters commfilters = new CommonFilters();
            commfilters.DeserializeParameters(param);

            var entryPoint = (from wkitems in db.WorkItems
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id
                              join sprint in db.Sprints on wkitems.sprint_id equals sprint.sprint_id
                              where ((commfilters.startdate == null || wkitems.modified_dtm == null) || wkitems.modified_dtm >= commfilters.startdate)
                                    && ((commfilters.enddate == null || wkitems.modified_dtm == null) || wkitems.modified_dtm <= commfilters.enddate)

                              //where (String.IsNullOrEmpty(commfilters.work_item_nm) || commfilters.work_item_nm.Contains(wkitems.work_item_ext_id))
                                    //&& (String.IsNullOrEmpty(commfilters.modified_usr_ids) || commfilters.modified_usr_ids.Contains(wkitems.modified_usr_id))
                                    ////&& (commfilters.startdate == null || wkitems.modified_dtm >= commfilters.startdate)
                                    //&& (commfilters.enddate == null || wkitems.modified_dtm <= commfilters.enddate)
                              select new
                              {
                                  wkitems.work_item_id,
                                  wkitems.sprint_id,
                                  wkitems.work_item_ext_id,
                                  wkitems.scope_id,
                                  scope.scope_nm,
                                  sprint.sprint_nm,
                                  wkitems.work_item_title
                              }).ToList();

            // Apply filters
            var filtereddata = (from dbdata in entryPoint
                                where ((commfilters.scopes==null || commfilters.scopes.Count == 0) || commfilters.scopes.Any(cp => cp.scope_id.Equals(dbdata.scope_id)))
                          && ((commfilters.sprints ==null || commfilters.sprints.Count == 0) || commfilters.sprints.Any(cp => cp.sprint_id.Equals(dbdata.sprint_id)))
                                select dbdata);


            return filtereddata.ToArray();
        }

        // GET api/ReleaseAPI
        [ActionName("WorkItemDetails")]
        public object GetWorkItemDetails(int? work_item_id)
        {
            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            var entryPoint = (from wkitems in db.WorkItems
                              join spr in db.Sprints on wkitems.sprint_id equals spr.sprint_id into sprint
                              from sprnt in sprint.DefaultIfEmpty()
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              where wkitems.work_item_id == work_item_id
                              select new
                              {
                                  sprnt.sprint_id,
                                  sprnt.sprint_nm,
                                  sco.scope_id,
                                  sco.scope_nm,
                                  wkitems.work_item_ext_id, //VOICE-3233
                                  wkitems.work_item_title,
                                  wkitems.work_item_id
                              });

            return entryPoint;
        }


        // PUT api/WorkItemAPI/5
        [ActionName("WorkItem")]
        public HttpResponseMessage PutWorkItem(int id, work_item_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.work_item_id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(data).State = System.Data.Entity.EntityState.Modified;

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

        // POST api/WorkItemAPI
        [ActionName("WorkItem")]
        public HttpResponseMessage PostWorkItem(work_item_ref data)
        {
            if (ModelState.IsValid)
            {
                db.WorkItems.Add(data);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                //response.Headers.Location = new Uri(Url.Link("ApiByName", new { id = configuration.config_id }));
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        // DELETE api/ConfigurationAPI/5
        [ActionName("WorkItem")]
        public HttpResponseMessage DeleteWorkItem(int id)
        {
            work_item_ref data= db.WorkItems.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.WorkItems.Remove(data);

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, data);
        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }
    }
}