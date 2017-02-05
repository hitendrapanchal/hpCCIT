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
    public class SettingsAPIController : ApiController
    {
        private DataContext db = new DataContext();
        StringBuilder strLog = new StringBuilder();

        // GET api/ReleaseAPI
        [ActionName("WorkItemsFromExternalSource")]
        public object GetWorkItemsFromExternalSource([FromUri] object param)
        {

            //Get all workites from external resources
            //Identify and add any new sprint into sprint_ref
            //Highlight workitems already present into system 
            //Highlight data has been changed for existing work items
            //Highlight workitems need to imported now
            //Update changed data into system
            //Add user selected work item into system

            JObject paramdata = JObject.Parse(param.ToString());

            string sprint_nm = paramdata["sprint_nm"].ToString();

            /*************************************************************************************
            Get all workites from external resources
            *************************************************************************************/
            AppCommonSettings appsetting = new AppCommonSettings();
            IList<work_item_external_ref> externalsourceWorkItems = appsetting.GetWorkItemsFromExternalSource();


            /*************************************************************************************
            //Identify and add any new sprint into sprint_ref
            *************************************************************************************/
            var recordsToAdd_NewSprints = (from extwi in externalsourceWorkItems
                                           where !db.Sprints.Any(s => s.sprint_nm == extwi.sprint_nm)
                                           select new { extwi.sprint_nm }
                       ).Distinct().ToList();
           

            IList<sprint_ref> addsprints = new List<sprint_ref>();
            foreach (var item in recordsToAdd_NewSprints)
            {
                sprint_ref row = new sprint_ref();
                row.sprint_nm = item.ToString();
                addsprints.Add(row);
            }
            if (addsprints.Count > 0)
            {
                db.Sprints.AddRange(addsprints);
                db.SaveChanges();
            }
            /*************************************************************************************
            //Highlight workitems already present into system 
            *************************************************************************************/
            //Linq to Object require data in memory
            var allDBWorkItems = (from wkitems in db.WorkItems
                                  select wkitems).ToList();

            

            var entryPoint = (from extnWI in externalsourceWorkItems 
                              join wkitems in allDBWorkItems on  extnWI.work_item_ext_id equals wkitems.work_item_ext_id into WIgrp
                              from wi in WIgrp.DefaultIfEmpty()
                              join spr in db.Sprints on extnWI.sprint_nm equals spr.sprint_nm into sprint
                              from sprnt in sprint.DefaultIfEmpty()
                              select new
                              {
                                  extnWI.work_item_ext_id,
                                  //work_item_title_new = (wi==null? string.Empty:  wi.work_item_title) ,
                                  sprint_nm = extnWI.sprint_nm,
                                  sprint_id = sprnt.sprint_id,
                                  work_item_title = extnWI.work_item_title,
                                  work_item_id_is_new = (wi == null ? true : false)
                              }).ToList();

            return entryPoint.ToArray();
        }

        // POST api/ReleaseAPI/ReleaseWorkItems
        [ActionName("SaveWorkItems")]
        public HttpResponseMessage PostSaveWorkItems(JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            var WorkItemsData = Newtonsoft.Json.JsonConvert.DeserializeObject(paramList["workitems"].ToString());

            List<work_item_ref> addWorkItemsData = new List<work_item_ref>();


            foreach (var item in (JArray)WorkItemsData)
            {
                work_item_ref row = new work_item_ref();
                //row.work_item_id = Convert.ToInt32(((JValue)(item["work_item_id"])).Value);
                row.work_item_ext_id = item["work_item_ext_id"].ToString();
                row.work_item_title = item["work_item_title"].ToString();
                row.sprint_id = Convert.ToInt16(((JValue)(item["sprint_id"])).Value);
                addWorkItemsData.Add(row);
            }


            try
            {
                db.WorkItems.AddRange(addWorkItemsData);
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        public bool CheckApplicatinSettings()
        { 
            CheckMasterTables(db.Config_Types);
            CheckMasterTables(db.Statuses);
            CheckMasterTables(db.Scopes);
            return true;
 
        }

        public bool CheckMasterTables(dynamic table)
        {
            if (table.Count()== 0)
            {
                strLog.AppendLine(table.ToString());
                return false;
            }
            return true;
        }

        [ActionName("ImportMasterData")]
        public bool GetImportMasterData(JObject paramList)
        {

            try
            {
                string file_MasterData = HostingEnvironment.ApplicationPhysicalPath + @"\App_Data\MasterData.xls";
                string strExcelConn = "provider=Microsoft.Jet.OLEDB.4.0;Data Source='" + file_MasterData + "';Extended Properties='Excel 8.0;HDR=Yes;'";

                OleDbConnection connExcel = new OleDbConnection(strExcelConn);

                connExcel.Open();
                DataTable dtExcelSchema;
                dtExcelSchema = connExcel.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
                connExcel.Close();

                string tablename = string.Empty;
                string sqlscriptexcel = string.Empty;
                DataTable dt;
                OleDbCommand cmdExcel = null;
                OleDbDataAdapter cmdda =null;
                foreach (DataRow dr in dtExcelSchema.Rows)
                {
                    tablename = dr["TABLE_NAME"].ToString();
                    sqlscriptexcel = "select * from " + tablename;
                    dt = new DataTable();
                    cmdExcel = new OleDbCommand(sqlscriptexcel, connExcel);
                    cmdda = new OleDbDataAdapter(cmdExcel);
                    cmdda.Fill(dt);


                }


                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }



        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

     
    }
}
