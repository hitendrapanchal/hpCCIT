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
    public class CheckListAPIController : ApiController
    {
        private DataContext db = new DataContext();

        #region "Checklist Template"
        [ActionName("ChecklistTemplate")]
        public Array GetChecklistTemplate()
        {

            var entryPoint = (from checklisttemplate in db.CheckListTemplates
                              join refsubtype in db.SubTypes on checklisttemplate.sub_type_id equals refsubtype.sub_type_id into grefsubtype
                              from agrefsubtype in grefsubtype.DefaultIfEmpty()
                              select new { 
                                  checklisttemplate.checklist_template_id,
                                  checklisttemplate.checklist_template_nm,
                                  checklisttemplate.sub_type_id,
                                  agrefsubtype.sub_type_nm
                              }
                              );

            return entryPoint.ToArray();
        }

        [ActionName("ChecklistTemplate")]
        public checklist_template_ref GetChecklistTemplate(int id)
        {
            if (id == 0) return GetEmptyChecklistTemplate(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            checklist_template_ref item = db.CheckListTemplates.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }


        // GET api/ConfigurationAPI/0
        private checklist_template_ref GetEmptyChecklistTemplate()
        {
            return new checklist_template_ref();
        }

        //        public Array GetConfiguration(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate=null, DateTime? enddate=null)






        // PUT api/WorkItemAPI/5
        [ActionName("ChecklistTemplate")]
        public HttpResponseMessage PutChecklistTemplate(int id, checklist_template_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.checklist_template_id)
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
        [ActionName("ChecklistTemplate")]
        public HttpResponseMessage PostChecklistTemplate(checklist_template_ref data)
        {
            if (ModelState.IsValid)
            {
                db.CheckListTemplates.Add(data);
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
        [ActionName("ChecklistTemplate")]
        public HttpResponseMessage DeleteChecklistTemplate(int id)
        {
            checklist_template_ref data = db.CheckListTemplates.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.CheckListTemplates.Remove(data);


            var chklistaitems = db.CheckListTemplatesXref.Where(s => s.checklist_template_id == id);
            db.CheckListTemplatesXref.RemoveRange(chklistaitems);

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

        #endregion

        #region "Checklist Template Items"

        // GET api/ConfigurationAPI/5
        [ActionName("CheckListTemplateItem")]
        public checklist_template_xref GetCheckListTemplateItem(int id)
        {
            checklist_template_xref item = db.CheckListTemplatesXref.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        [ActionName("CheckListTemplateItem")]
        public HttpResponseMessage PutCheckListTemplateItem(int id, checklist_template_xref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.checklist_template_xref_id)
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

        [ActionName("CheckListTemplateItem")]
        public HttpResponseMessage DeleteCheckListTemplateItem(int id)
        {
            checklist_template_xref data = db.CheckListTemplatesXref.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.CheckListTemplatesXref.Remove(data);

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


        [ActionName("CheckListTemplateItems")]
        public Array GetCheckListTemplateItems(short id)
        {
            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            var entryPoint = (from chklist in db.CheckLists
                              join chktmp in db.CheckListTemplatesXref on chklist.checklist_id equals chktmp.checklist_id
                              join refsubtype in db.SubTypes on chklist.sub_type_id equals refsubtype.sub_type_id into grefsubtype
                              from agrefsubtype in grefsubtype.DefaultIfEmpty()
                              where (chktmp.checklist_template_id == id)
                              select new
                              {
                                  chktmp.checklist_template_xref_id,
                                  chklist.checklist_id,
                                  chklist.checklist_nm,
                                  chklist.sub_type_id,
                                  agrefsubtype.sub_type_nm,
                                  chktmp.priority_order
                              }).OrderBy(x=> x.priority_order).ToList();

            return entryPoint.ToArray();
        }


        // POST api/ReleaseAPI/ReleaseWorkItems
        [ActionName("SaveCheckListTemplateMapping")]
        public HttpResponseMessage PostSaveCheckListTemplateMapping(JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            short checklist_template_id = Convert.ToInt16(paramList["checklist_template_id"].ToString());

            var checklistitemsData = Newtonsoft.Json.JsonConvert.DeserializeObject(paramList["datatoadd"].ToString());
            List<checklist_template_xref> addchecklistItemsData = new List<checklist_template_xref>();
            foreach (var item in (JArray)checklistitemsData)
            {


                checklist_template_xref row = new checklist_template_xref();
                row.checklist_template_id = checklist_template_id;
                row.checklist_id = Convert.ToInt16(((JValue)(item["checklist_id"])).Value);

                //Get default powershell settings from check_list_ref
                checklist_ref chkref = db.CheckLists.Find(row.checklist_id);
                if (chkref != null)
                {
                    row.powershell_script = chkref.default_powershell_script;
                    row.powershell_script_timedout = chkref.default_powershell_script_timedout;
                }

                addchecklistItemsData.Add(row);
            }

            var checklistitemsDataToDelete = Newtonsoft.Json.JsonConvert.DeserializeObject(paramList["datatodelete"].ToString());


            List<checklist_template_xref> deletechecklistItemsData = new List<checklist_template_xref>();
            foreach (var item in (JArray)checklistitemsDataToDelete)
            {


                checklist_template_xref row = new checklist_template_xref();
                row.checklist_template_id = checklist_template_id;
                row.checklist_id = Convert.ToInt16(((JValue)(item["checklist_id"])).Value);
                deletechecklistItemsData.Add(row);
            }


            try
            {
                db.SaveChanges();

                /*************************************************************************************
                //Delete items 
                *************************************************************************************/
                var checkTemplateXreflocal = (from chktempxref in db.CheckListTemplatesXref
                                              where chktempxref.checklist_template_id == checklist_template_id
                                              select chktempxref).ToList();

                var recordsToRemove_UnMapped = (from chktmpxref in checkTemplateXreflocal
                                                where deletechecklistItemsData.Any(s => s.checklist_id == chktmpxref.checklist_id && chktmpxref.checklist_template_id == checklist_template_id)
                                                select chktmpxref).Distinct().ToList();

                db.CheckListTemplatesXref.RemoveRange(recordsToRemove_UnMapped);
                db.SaveChanges();

                /*************************************************************************************
                //Add newly mapped items
                *************************************************************************************/
                db.CheckListTemplatesXref.AddRange(addchecklistItemsData);
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }


        // GET api/ReleaseAPI
        [ActionName("CheckListTemplateMapping")]
        public object GetCheckListTemplateMapping([FromUri] object param)
        {

            short checklist_template_id = 0;

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["checklist_template_id"].ToString()))
                checklist_template_id = Convert.ToInt16(((JValue)paramdata["checklist_template_id"]).Value);


            var dbMappedItems = (from checklist in db.CheckLists
                                 join refsubtype in db.SubTypes on checklist.sub_type_id equals refsubtype.sub_type_id into grefsubtype
                                 from agrefsubtype in grefsubtype.DefaultIfEmpty()
                                 where !db.CheckListTemplatesXref.Any(s => s.checklist_id == checklist.checklist_id && s.checklist_template_id == checklist_template_id)
                                 select new { checklist.checklist_id,
                                     checklist.checklist_nm,
                                     agrefsubtype.sub_type_nm }).ToList();

            var temaplateInfo = (from chklisttmp in db.CheckListTemplates
                                 where chklisttmp.checklist_template_id == checklist_template_id
                                 select chklisttmp).ToList();
            

            var returnObject = new { CheckListTemplateItems = GetCheckListTemplateItems(checklist_template_id), CheckListItems = dbMappedItems, TemaplateInfo = temaplateInfo };
            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return returnObject;

        }

        #endregion

        #region "Checklist Ref/Master"

        // GET api/ConfigurationAPI
        [ActionName("Checklist")]
        public Array GetChecklist()
        {

            var entryPoint = (from checklist in db.CheckLists
                              join refsubtype in db.SubTypes on checklist.sub_type_id equals refsubtype.sub_type_id into grefsubtype
                              from agrefsubtype in grefsubtype.DefaultIfEmpty()
                              select new { 
                                  checklist.checklist_id,
                                  checklist.checklist_nm,
                                  checklist.sub_type_id,
                                  agrefsubtype.sub_type_nm
                              }
                              ).ToList();

            return entryPoint.ToArray();
        }

        // GET api/ConfigurationAPI/5
        [ActionName("Checklist")]
        public checklist_ref GetChecklist(int id)
        {
            if (id == 0) return GetEmptyChecklist(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            checklist_ref item = db.CheckLists.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }
        // GET api/ConfigurationAPI/0
        private checklist_ref GetEmptyChecklist()
        {
            return new checklist_ref();
        }

        // PUT api/WorkItemAPI/5
        [ActionName("Checklist")]
        public HttpResponseMessage PutChecklist(int id, checklist_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.checklist_id)
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
        [ActionName("Checklist")]
        public HttpResponseMessage PostChecklist(checklist_ref data)
        {
            if (ModelState.IsValid)
            {
                db.CheckLists.Add(data);
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
        [ActionName("Checklist")]
        public HttpResponseMessage DeleteChecklist(int id)
        {
            checklist_ref data = db.CheckLists.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.CheckLists.Remove(data);

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


        #endregion


        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

    }
}