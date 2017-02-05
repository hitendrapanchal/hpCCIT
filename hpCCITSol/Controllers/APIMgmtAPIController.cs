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
using System.Timers;
using System.IO;
using System.Net.Mail;
using System.Text;
using System.Net.Mime;

namespace eTrackerSol.Controllers
{
    public class APIMgmtAPIController : ApiController
    {
        Timer myTimer;
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("APIMgmt")]
        public Array GetAPIMgmt()
        {

            var entryPoint = (from apiref in db.APIs
                              join refappl in db.Applications on apiref.application_id equals refappl.application_id into grefappl
                              from agrefappl in grefappl.DefaultIfEmpty()
                              join refclient in db.Clients on apiref.client_id equals refclient.client_id into grefclient
                              from agrefclient in grefclient.DefaultIfEmpty()
                              join refapitype in db.APITypes on apiref.api_type_id equals refapitype.api_type_id into grefapitype
                              from agrefapitype in grefapitype.DefaultIfEmpty()
                              select new
                              {
                                  apiref.api_id,
                                  apiref.api_name,
                                  apiref.api_type_id,
                                  apiref.client_id,
                                  apiref.application_id,
                                  apiref.api_dev_version,
                                  apiref.api_dev_int_version,
                                  apiref.api_dev_int_metadata,
                                  apiref.api_qa_version,
                                  apiref.api_qa_metadata,
                                  apiref.api_prod_url,
                                  apiref.api_prod_version,
                                  apiref.api_prod_metadata,
                                  apiref.api_metadata,
                                  apiref.api_comments,
                                  agrefappl.application_nm,
                                  agrefapitype.api_type_nm,
                                  agrefclient.client_nm
                              }
                              ).ToList();


            return entryPoint.ToArray();
        }


        // GET api/ConfigurationAPI/5
        [ActionName("APIMgmt")]
        public api_ref GetAPIMgmt(int id)
        {
            if (id == 0) return GetEmptyAPIMgmt(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            api_ref item = db.APIs.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        // GET api/APIMgmtAPI/0
        private api_ref GetEmptyAPIMgmt()
        {
            return new api_ref();
        }




        // PUT api/WorkItemAPI/5
        [ActionName("APIMgmt")]
        public HttpResponseMessage PutAPIMgmt(int id, api_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.api_id)
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
        [ActionName("APIMgmt")]
        public HttpResponseMessage PostAPIMgmt(api_ref data)
        {
            if (ModelState.IsValid)
            {
                db.APIs.Add(data);
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
        [ActionName("APIMgmt")]
        public HttpResponseMessage DeleteAPIMgmt(int id)
        {
            api_ref data = db.APIs.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.APIs.Remove(data);

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