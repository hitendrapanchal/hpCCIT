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
    public class ReportAPIController : ApiController
    {
        Timer myTimer;
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("Report")]
        public Array GetReport()
        {

            var entryPoint = (from report in db.Reports
                              select  report).ToList();
            
            return entryPoint.ToArray();
        }


        // GET api/ConfigurationAPI/5
        [ActionName("Report")]
        public report_ref GetReport(int id)
        {
            if (id == 0) return GetEmptyReport(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            report_ref item = db.Reports.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        // GET api/ConfigurationAPI/0
        private report_ref GetEmptyReport()
        {
            return new report_ref();
        }


        //        public Array GetConfiguration(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate=null, DateTime? enddate=null)


     


        // PUT api/WorkItemAPI/5
        [ActionName("Report")]
        public HttpResponseMessage PutReport(int id, report_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.report_id)
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
        public HttpResponseMessage PostReport(report_ref data)
        {
            if (ModelState.IsValid)
            {
                db.Reports.Add(data);
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
            report_ref data= db.Reports.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Reports.Remove(data);

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



        // GET api/ConfigurationAPI
        [ActionName("ExecuteReport")]
        public object GetExecuteReport([FromUri] object param)
        {
            int report_id = 0;
            short? interval_minute = 0;

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["report_id"].ToString()))
                report_id = Convert.ToInt32(((JValue)paramdata["report_id"]).Value);

            if (!string.IsNullOrEmpty(paramdata["interval"].ToString()))
                interval_minute = Convert.ToInt16(((JValue)paramdata["interval"]).Value);


            report_ref item = db.Reports.Find(report_id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            var returnObject = new { reportdata = GetReportData(item, interval_minute) };
            return returnObject;

        }

        // GET api/ConfigurationAPI
        [ActionName("SendEmail")]
        public object PostSendEmail([FromBody] object param)
        {
            int report_id = 0;
            short? interval_minute = 0;

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["report_id"].ToString()))
                report_id = Convert.ToInt32(((JValue)paramdata["report_id"]).Value);

            if (!string.IsNullOrEmpty(paramdata["interval"].ToString()))
                interval_minute = Convert.ToInt16(((JValue)paramdata["interval"]).Value);


            report_ref item = db.Reports.Find(report_id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound, "Report does not exist"));
            }

            DataSet ds;
            try
            {
                ds = GetReportData(item, interval_minute);
            }
            catch(Exception ex)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.InternalServerError, "Error occured while exeuting report SQL"));
            }

            string[] strCSVOutput;
            try
            {
                CommonFunctions commfun = new CommonFunctions();
                strCSVOutput = commfun.GetCSVOutput(ds);
            }
            catch (Exception ex)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.InternalServerError, "Error occured while generating CSV file"));
            }

            try
            {
                MemoryStream[] ms = new MemoryStream[ds.Tables.Count];
                CommonEmail email = new CommonEmail();
                email.ConfigureDefaultSMTPclient();

                Attachment[] attachments = new Attachment[ds.Tables.Count];

                for (int i = 0; i < strCSVOutput.Length; i++)
                {
                    ms[i] = new MemoryStream(Encoding.UTF8.GetBytes(strCSVOutput[i]));
                    attachments[i] = new Attachment(ms[i], "Report" + i.ToString() + ".csv", "text/csv");
                }

                string emailSubject = "eTracker Report : " + item.report_nm + " executed on : " + DateTime.Now.ToLongDateString() + " " + DateTime.Now.ToLongTimeString();
                StringBuilder sbEmailbody = new StringBuilder();
                sbEmailbody.AppendLine("This report is generated from eTracker Reporting Tool");
                sbEmailbody.AppendLine("Report Name : " + item.report_nm);
                sbEmailbody.AppendLine("Description : " + item.report_descr);

                if (attachments != null && attachments.Count() > 0)
                {
                    sbEmailbody.AppendLine("Report output is attached (CSV format)");
                }

                email.SendEmail(item.scheduler_email_ids, emailSubject, sbEmailbody.ToString(), attachments);

                ms = null;
            }
            catch (Exception ex)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.InternalServerError, "Error occured while sending email"));
            }
            return "Successfully email sent";
        }

        private DataSet GetReportData(report_ref rpt, short? interval_minute)
        {
            string connectionstr = rpt.db_connectionstr;
            if (!interval_minute.HasValue) interval_minute = 15;

            string sql_script = rpt.sql_script.Replace("@interval", interval_minute.ToString());
            SQLHelper sqlhelp = new SQLHelper();
            return sqlhelp.GetDataSets(sql_script, connectionstr);

        }




        [ActionName("StartSchedulingTimer")]
        public bool GetStartSchedulingTimer([FromUri] object param)
        {
            GetReportsForTimer_Elapsed();
            return true;

            //int minutes = 0;
            //JObject minuteobj = null;

            //JObject paramdata = JObject.Parse(param.ToString());
            //if (!string.IsNullOrEmpty(paramdata["interval"].ToString()))
            //    minuteobj = JObject.Parse(paramdata["interval"].ToString());


            //minutes = Convert.ToInt32(((JValue)minuteobj["value"]).Value);


            //myTimer = new Timer();
            //myTimer.Interval = minutes * 1000; 
            //myTimer.Elapsed += new ElapsedEventHandler(myTimer_Elapsed);
            //myTimer.Start();
            //return true;
        }

        [ActionName("StopSchedulingTimer")]
        public bool GetStopSchedulingTimer([FromUri] object param)
        {
            myTimer.Stop();
            myTimer = null;
            return true;
        }

        private void myTimer_Elapsed(object sender, System.Timers.ElapsedEventArgs e)
        {
            
        }


        public bool GetReportsForTimer_Elapsed()
        {

            var entryPoint = (from report in db.Reports
                              where report.is_scheduling == true && report.report_id ==5
                              select report).ToList();

            DataSet dsResultSets = null;
            StringWriter writer = new StringWriter();


            foreach (report_ref rpt in entryPoint)
            {
                dsResultSets = GetReportData(rpt, rpt.scheduler_interval_minutes);

                for (int counter = 0; counter < dsResultSets.Tables.Count; counter++)
                {
                    dsResultSets.Tables[counter].TableName = "Table" + counter.ToString();
                    dsResultSets.Tables[counter].WriteXml(writer, true);
                }
            }

            //foreach (report_ref rpt in entryPoint)
            //{
            //    dsResultSets = GetReportData(rpt, rpt.scheduler_interval_minutes);
            //    dsResultSets.Tables[0].WriteXml(writer, true);
            //}
            return false;

        }

    }
}