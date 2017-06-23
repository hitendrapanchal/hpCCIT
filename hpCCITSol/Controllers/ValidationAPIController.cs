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
using Newtonsoft.Json.Linq;
using System.Data.Entity;
using System.IO;
using System.Text;
using System.Web.Hosting;
using System.Data.OleDb;


namespace eTrackerSol.Controllers
{
    public class ValidationAPIController : ApiController
    {
        private DataContext db = new DataContext();
        StringBuilder strLog = new StringBuilder();


        // GET api/ConfigurationAPI
        [ActionName("ExecuteReport")]
        public object GetExecuteReport([FromUri] object param)
        {
            string source_env, source_envtype, target_env, target_envtype, app_cvpmt;

            short? interval_minute = 0;
            //"{\"source_env\":\"DEV_INT\",\"source_envtype\":\"EnvA\",\"target_env\":\"DEV_INT\",\"target_envtype\":\"EnvA\",\"app_cvpmt\":\"VSS-MT\"}"

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["source_env"].ToString()))
                source_env = paramdata["source_env"].ToString();

            if (!string.IsNullOrEmpty(paramdata["source_envtype"].ToString()))
                source_envtype = paramdata["source_envtype"].ToString();

            if (!string.IsNullOrEmpty(paramdata["target_env"].ToString()))
                target_env = paramdata["target_env"].ToString();

            if (!string.IsNullOrEmpty(paramdata["target_envtype"].ToString()))
                target_envtype = paramdata["target_envtype"].ToString();

            if (!string.IsNullOrEmpty(paramdata["app_cvpmt"].ToString()))
                app_cvpmt = paramdata["app_cvpmt"].ToString();

            report_ref item = db.Reports.Find(2);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            //var returnObject= new { reportdata = GetReportData(item, interval_minute) };
            var returnObject = item;
            return returnObject;

        }

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

     
    }
}
