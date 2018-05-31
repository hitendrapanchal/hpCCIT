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
    public class SSRSReportAPIController : ApiController
    {
        Timer myTimer;
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("Report")]
        public Array GetReport()
        {

            var entryPoint = (from report in db.SSRSReports
                              select report).ToList();

            return entryPoint.ToArray();
        }


        // GET api/ConfigurationAPI/5
        [ActionName("Report")]
        public ssrs_report_ref GetReport(int id)
        {
            if (id == 0) return GetEmptyReport(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            ssrs_report_ref item = db.SSRSReports.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        // GET api/ConfigurationAPI/0
        private ssrs_report_ref GetEmptyReport()
        {
            return new ssrs_report_ref();
        }


        //        public Array GetConfiguration(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate=null, DateTime? enddate=null)





        // PUT api/WorkItemAPI/5
        [ActionName("Report")]
        public HttpResponseMessage PutReport(int id, ssrs_report_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.ssrs_report_id)
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
        [ActionName("Report")]
        public HttpResponseMessage PostReport(ssrs_report_ref data)
        {
            if (ModelState.IsValid)
            {
                db.SSRSReports.Add(data);
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
        [ActionName("Report")]
        public HttpResponseMessage DeleteReport(int id)
        {
            ssrs_report_ref data = db.SSRSReports.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.SSRSReports.Remove(data);

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