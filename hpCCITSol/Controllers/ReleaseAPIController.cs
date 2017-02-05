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
using System.IO;
using System.Net.Http.Headers;
using Novacode;



namespace eTrackerSol.Controllers
{
    public class ReleaseAPIController : ApiController
    {
        private DataContext db = new DataContext();

        
        #region Release
        // GET api/ReleaseAPI
        [ActionName("Release")]
        public Array GetRelease()
        {

            var entryPoint = (from release in db.Releases
                              select new
                              {
                                  release.release_id,
                                  release.release_nm,
                                  release.release_dt
                              }).ToList();

            return entryPoint.ToArray();
        }


        // GET api/ReleaseAPI/5
        [ActionName("Release")]
        public object GetRelease(int id)
        {
            if (id == 0)
            {
                return new { release = GetEmptyRelease(), sprints= new List<sprint_ref>() };

            }//Used to create empty structure for release_ref for ADD-NEW-Record

            release_ref release = db.Releases.Find(id);

//            IList<release_sprint_xref> releaseSprints = db.Release_Sprint_Xrefs.Where(x => x.release_id == release.release_id).ToList < release_sprint_xref>();
            var releaseSprints = (from sprints in db.Sprints
                              join relSprXref in db.Release_Sprint_Xrefs on sprints.sprint_id equals relSprXref.sprint_id
                              where relSprXref.release_id == release.release_id
                              select sprints).ToList();
            


            var returnObject = new { release, sprints = releaseSprints };

            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return returnObject;
        }

        // GET api/ReleaseAPI/0
        private release_ref GetEmptyRelease()
        {

            return new release_ref();
        }


        // GET api/ReleaseAPI
        [ActionName("Release")]
        public Array GetRelease(string sprint_nm, string application_nm, string work_item_nm, string scope_nm, string modified_usr_id, DateTime? startdate = null, DateTime? enddate = null)
        {

            var entryPoint = "";
            return entryPoint.ToArray();
        }


      // GET api/ReleaseAPI
        [ActionName("ReleaseInformation")]
        public object GetReleaseInformation(short release_id)
        {
            var returnObject = new {    ReleaseWorkItem = GetReleaseWorkItem(release_id), 
                                        ReleaseConfiguration = GetReleaseConfiguration(release_id),
                                        ReleasePDFs = GetReleasePDFs(release_id),
                                        ApplicationMatrix = GetReleaseApplicationMatrix(release_id),
                                        RFCs = GetRFCs(release_id) 
            };
            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return returnObject;
        
        }

        // GET api/ReleaseAPI
        [ActionName("ReleaseWorkItem")]
        public Array GetReleaseWorkItem(short release_id)
        {
            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            var entryPoint = (from relSpExref in db.Release_Sprint_Xrefs
                              join spr in db.Sprints on relSpExref.sprint_id equals spr.sprint_id
                              join wkitems in db.WorkItems on relSpExref.sprint_id equals wkitems.sprint_id into wk
                              from wki in wk.DefaultIfEmpty()
                              join scope in db.Scopes on wki.scope_id equals scope.scope_id
                              join relWIExref in db.Release_Work_Item_Xrefs on relSpExref.release_id equals relWIExref.release_id into relsp
                              from relSpr in relsp.Where(r=>r.work_item_id==wki.work_item_id).DefaultIfEmpty()
                              where (relSpExref.release_id == release_id) && scope.is_production==true 
                              select new
                              {
                                  release_id = release_id,
                                  spr.sprint_nm,
                                  scope.scope_nm,
                                  wki.work_item_ext_id, //VOICE-3233
                                  wki.work_item_title,
                                  wki.work_item_id,
                                  work_item_id_select= relSpr.work_item_id.HasValue
                              }).ToList();

            //.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            return entryPoint.ToArray();
        }

        // GET api/ReleaseAPI
        [ActionName("ReleaseConfiguration")]
        public Array GetReleaseConfiguration(short release_id)
        {

            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);
            var entryPoint = (from relWIExref in db.Release_Work_Item_Xrefs 
                              join wkitems in db.WorkItems on relWIExref.work_item_id equals wkitems.work_item_id
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              join config in db.Configurations on wkitems.work_item_id equals config.work_item_id
                              join application in db.Applications on config.application_id equals application.application_id into ap
                              from app in ap.DefaultIfEmpty()
                              join config_type in db.Config_Types on config.config_type_id equals config_type.config_type_id into ct
                              from cot in ct.DefaultIfEmpty()
                              where (relWIExref.release_id == release_id)
                              select new
                              {
                                  app.application_nm,
                                  cot.config_type_nm,
                                  sco.scope_nm,
                                  config.config_key,
                                  config.config_nm,
                                  config.work_item_id,
                                  wkitems.work_item_ext_id,
                                  config.config_dev_value,
                                  config.config_dev_int_value,
                                  config.config_qa_value,
                                  config.config_prod_value

                              }).ToList();

            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            return entryPoint.ToArray();
        }

        // GET api/ReleaseAPI
        [ActionName("ReleasePDFs")]
        public Array GetReleasePDFs(short release_id)
        {

            var entryPoint = (from relWIExref in db.Release_Work_Item_Xrefs
                              join wkitems in db.WorkItems on relWIExref.work_item_id equals wkitems.work_item_id
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              join config in db.Configurations on wkitems.work_item_id equals config.work_item_id
                              join rfctmpappxref in db.RfcTemplateApplicationsXref on config.application_id equals rfctmpappxref.application_id
                              join rfctmpref in db.RfcTemplates on rfctmpappxref.rfc_template_id equals rfctmpref.rfc_template_id
                              join application in db.Applications on config.application_id equals application.application_id into ap
                              from app in ap.DefaultIfEmpty()
                              join config_type in db.Config_Types on config.config_type_id equals config_type.config_type_id into ct
                              from cot in ct.DefaultIfEmpty()
                              where (relWIExref.release_id == release_id && config.is_pdf == true)
                              select new
                              {
                                  app.application_nm,
                                  cot.config_type_nm,
                                  sco.scope_nm,
                                  config.config_key,
                                  config.config_nm,
                                  config.work_item_id,
                                  config.pdfaction,
                                  rfctmpappxref.pdf_file_name,
                                  wkitems.work_item_ext_id,
                                  config.config_dev_value,
                                  config.config_dev_int_value,
                                  config.config_qa_value,
                                  config.config_prod_value
                              }
                              ).OrderBy(x => new { x.application_nm, x.work_item_ext_id, x.pdfaction }).ToList();

            var result = (from ep in entryPoint
                          select new
                          {
                              ep.application_nm,
                              ep.config_type_nm,
                              ep.scope_nm,
                              ep.config_key,
                              ep.config_nm,
                              ep.work_item_id,
                              pdfactions = ((CRUD)(ep.pdfaction == null ? 0 : ep.pdfaction)).ToString(),
                              ep.pdf_file_name,
                              ep.work_item_ext_id,
                              ep.config_dev_value,
                              ep.config_dev_int_value,
                              ep.config_qa_value,
                              ep.config_prod_value
                          }).ToList();


            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            return result.ToArray();
        }

        // PUT api/ReleaseAPI/5
        [ActionName("Release")]
        public HttpResponseMessage PutRelease(int id, JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            release_ref releaseData = Newtonsoft.Json.JsonConvert.DeserializeObject<release_ref>(paramList["release"].ToString());
            sprint_ref[] releaseSprintsData = Newtonsoft.Json.JsonConvert.DeserializeObject<sprint_ref[]>(paramList["sprints"].ToString());


            if (id != releaseData.release_id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(releaseData).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();
                //Delete any old record exists; usally there should be any record exist in case of new release
                DeleteSprints(releaseData.release_id);
                //Now add sprints for newly added release
                AddSprints(releaseSprintsData, releaseData.release_id);

            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        // POST api/ReleaseAPI
        [ActionName("Release")]
        public HttpResponseMessage PostRelease(JObject paramList)
        {
            

            if (ModelState.IsValid)
            {

                release_ref releaseData = Newtonsoft.Json.JsonConvert.DeserializeObject<release_ref>(paramList["release"].ToString());
                sprint_ref[] releaseSprintsData = Newtonsoft.Json.JsonConvert.DeserializeObject<sprint_ref[]>(paramList["sprints"].ToString());


                db.Releases.Add(releaseData);
                db.SaveChanges();

                //Delete any old record exists; usally there should be any record exist in case of new release
                DeleteSprints(releaseData.release_id);


                //Now add sprints for newly added release
                AddSprints(releaseSprintsData, releaseData.release_id);

                AddProductionScopeWIs(releaseData.release_id);
                CreateRFCFromTemplate(releaseData.release_id);

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, releaseData);
               // response.Headers.Location = new Uri(Url.Link("ApiByName", new { id = configuration.config_id }));
                return response;

            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }


        // POST api/ReleaseAPI/ReleaseWorkItems
        [ActionName("ReleaseWorkItems")]
        public HttpResponseMessage PostReleaseWorkItems(JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            short release_id = Convert.ToInt16(paramList["release_id"].ToString());

            var releaseWorkItemsData = Newtonsoft.Json.JsonConvert.DeserializeObject(paramList["workitems"].ToString());

            List<release_work_item_xref> addreleaseWorkItemsData = new List<release_work_item_xref>();


            foreach (var item in (JArray)releaseWorkItemsData)
            {


                //release_id = Convert.ToInt16(((JValue)(item["release_id"])).Value);  // any release_id -- it will be same in all rows  
                release_work_item_xref row = new release_work_item_xref();
                row.work_item_id = Convert.ToInt32(((JValue)(item["work_item_id"])).Value);
                row.release_id = release_id;
                addreleaseWorkItemsData.Add(row);
            }


            try
            {
                /*************************************************************************************
                //Delete items from db which is unmapped from UI
                *************************************************************************************/
                var Release_Work_Item_Xrefs_local = (from relwktmpxref in db.Release_Work_Item_Xrefs
                                                     where relwktmpxref.release_id == release_id
                                                     select relwktmpxref).ToList();

                var recordsToRemove_UnMapped = (from relwktmpxref in Release_Work_Item_Xrefs_local
                                                where !addreleaseWorkItemsData.Any(s => s.work_item_id == relwktmpxref.work_item_id && relwktmpxref.release_id == release_id)
                                                select relwktmpxref).Distinct().ToList();

                db.Release_Work_Item_Xrefs.RemoveRange(recordsToRemove_UnMapped);
                db.SaveChanges();

                /*************************************************************************************
                //Now add newly mapped items from UI in db (not present in db)
                *************************************************************************************/
                var recordsToAdd_NewlyMapped = (from relwktmpxref in addreleaseWorkItemsData
                                                where !Release_Work_Item_Xrefs_local.Any(s => s.work_item_id == relwktmpxref.work_item_id)
                                                select relwktmpxref).Distinct().ToList();


                db.Release_Work_Item_Xrefs.AddRange(recordsToAdd_NewlyMapped);
                db.SaveChanges();

                CreateRFCFromTemplate(release_id);

            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

                
        // DELETE api/ReleaseAPI/5
        [ActionName("Release")]
        public HttpResponseMessage DeleteRelease(short id)
        {
            release_ref dbset = db.Releases.Find(id);
            if (dbset == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Releases.Remove(dbset);
            db.SaveChanges();

            try
            {
                DeleteOnReleaseID(id);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK, dbset);
        }

        private void DeleteSprints(short release_id)
        {
            //Delete any old record exists; usally there should be any record exist in case of new release
            var recordsToDelete = (from a in db.Release_Sprint_Xrefs
                                   where a.release_id == release_id
                                   select a);

            db.Release_Sprint_Xrefs.RemoveRange(recordsToDelete);
            db.SaveChanges();
        }

        private void DeleteOnReleaseID(short release_id)
        {
            //Delete any old record exists; usally there should be any record exist in case of new release
            var recordsToDelete = (from a in db.Rfcs
                                   where a.release_id == release_id
                                   select a).ToList();



            //Create local copy for memory joins
            var recordsToDeleteDtl = (from rfcrefdtl in db.RfcDetails
                                      join rfcref in db.Rfcs on rfcrefdtl.rfc_id equals rfcref.rfc_id
                                      where (rfcref.release_id == release_id)
                                      select rfcrefdtl
                                    ).ToList();

            db.RfcDetails.RemoveRange(recordsToDeleteDtl);
            db.Rfcs.RemoveRange(recordsToDelete);
            db.SaveChanges();


            //Delete Sprint WIs
            var recordsToDeleteRelWI = (from a in db.Release_Work_Item_Xrefs
                               where a.release_id ==release_id
                                   select a);

            db.Release_Work_Item_Xrefs.RemoveRange(recordsToDeleteRelWI);
            db.SaveChanges();


            DeleteSprints(release_id);
        }


        private void AddSprints(sprint_ref[] releaseSprintsData, short release_id)
        {
            IList<release_sprint_xref> addsprints = new List<release_sprint_xref>();

            foreach (var item in releaseSprintsData)
            {
                release_sprint_xref row = new release_sprint_xref();
                row.release_id = release_id;
                row.sprint_id = item.sprint_id;
                addsprints.Add(row);
            }
            db.Release_Sprint_Xrefs.AddRange(addsprints);
            db.SaveChanges();        
        }

        private void AddProductionScopeWIs(short release_id)
        {
            var WIsTobeAdded = (from relSpExref in db.Release_Sprint_Xrefs
                              join spr in db.Sprints on relSpExref.sprint_id equals spr.sprint_id
                              join wkitems in db.WorkItems on relSpExref.sprint_id equals wkitems.sprint_id
                                join scope in db.Scopes on wkitems.scope_id equals scope.scope_id
                              where (relSpExref.release_id == release_id) && scope.is_production == true
                              select new
                              {
                                  wkitems.work_item_id
                              }).Distinct().ToList();

            IList<release_work_item_xref> addsWIs= new List<release_work_item_xref>();

            foreach (var item in WIsTobeAdded)
            {
                release_work_item_xref row = new release_work_item_xref();
                //PK row.release_work_item_id 
                row.release_id = release_id;
                row.work_item_id = item.work_item_id;
                row.is_biz_validation_required = true;
                addsWIs.Add(row);
            }
            db.Release_Work_Item_Xrefs.AddRange(addsWIs);
            db.SaveChanges();
        }
        
        #endregion


        #region Business Validation
        // GET api/ReleaseAPI
        [ActionName("ReleaseBusinessValidationDetails")]
        public Array GetReleaseBusinessValidationDetails(short release_id)
        {
            //db.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            var entryPoint = (from rel in db.Releases
                              join relWIExref in db.Release_Work_Item_Xrefs on rel.release_id equals relWIExref.release_id
                              join wkitems in db.WorkItems on relWIExref.work_item_id equals wkitems.work_item_id
                              where (rel.release_id == release_id)
                              select new
                              {
                                  release_id = release_id,
                                  wkitems.work_item_ext_id, //VOICE-3233
                                  wkitems.work_item_title,
                                  wkitems.work_item_id,
                                  relWIExref.release_work_item_id,
                                  relWIExref.is_biz_validation_required,
                                  relWIExref.biz_validator_nm,
                                  relWIExref.biz_validation_status,
                                  relWIExref.biz_validation_sql,
                                  relWIExref.biz_validation_comments

                              }).ToList();

            //.Database.Log = s => System.Diagnostics.Debug.WriteLine(s);

            return entryPoint.ToArray();
        }

        [ActionName("ReleaseBusinessValidationDetail")]
        public release_work_item_xref GetReleaseBusinessValidationDetail(short id)
        {
            release_work_item_xref item = db.Release_Work_Item_Xrefs.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        [ActionName("ReleaseBusinessValidationDetail")]
        public HttpResponseMessage PutReleaseBusinessValidationDetail(int id, release_work_item_xref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.release_work_item_id)
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

        #endregion

        
        #region RFCTemplate

        [ActionName("RFCTemplate")]
        public object GetRFCTemplate()
        {

            var entryPoint = (from rfctemplates in db.RfcTemplates
                              join deplenv in db.DeploymentEnvironments on rfctemplates.deployment_environment_id equals deplenv.deployment_environment_id into gdeplenv
                              from agdeplenv in gdeplenv.DefaultIfEmpty()
                              join depl_mse_env in db.DeploymentMSEEnvironments on rfctemplates.deployment_mse_environment_id equals depl_mse_env.deployment_mse_environment_id into gdepl_mse_env
                              from agdepl_mse_env in gdepl_mse_env.DefaultIfEmpty()
                              join depltypes in db.DeploymentTypes on rfctemplates.deployment_type_id equals depltypes.deployment_type_id into gdepltypes
                              from agdepltypes in gdepltypes.DefaultIfEmpty()
                              join servertypes in db.ServerTypes on rfctemplates.server_type_id equals servertypes.server_type_id into gservertypes
                              from agservertypes in gservertypes.DefaultIfEmpty()
                              select new
                              {
                                  rfctemplates.rfc_template_id,
                                  rfctemplates.rfc_template_nm,
                                  rfctemplates.deployment_type_id,
                                  rfctemplates.deployment_environment_id,
                                  rfctemplates.deployment_mse_environment_id,
                                  rfctemplates.server_type_id,
                                  agdeplenv.deployment_environment_nm,
                                  agdepl_mse_env.deployment_mse_environment_nm,
                                  agdepltypes.deployment_type_nm,
                                  agservertypes.server_type_nm
                              }
                              ).ToList();

            var returnObject = new { rfctemplates = entryPoint.ToArray()};
            return returnObject;
        }

        // GET api/ReleaseAPI/5
        [ActionName("RFCTemplate")]
        public object GetRFCTemplate(short id)
        {
            if (id == 0)
            {
                return new { rfctemplate = GetEmptyRFCTemplate(), applications = ""}; 
            }

            rfc_template_ref item = db.RfcTemplates.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            var rfcappxref = ( from rfcapp in db.RfcTemplateApplicationsXref
                               where rfcapp.rfc_template_id==id
                                   select rfcapp).ToList();
 

            if (item== null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            var returnObject = new { rfctemplate = item, applications = rfcappxref };
            return returnObject;
        }

        private rfc_template_ref GetEmptyRFCTemplate()
        {
            return new rfc_template_ref();
        }

        [ActionName("RFCTemplate")]
        public HttpResponseMessage PutRFCTemplate(short id, JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            rfc_template_ref data = Newtonsoft.Json.JsonConvert.DeserializeObject<rfc_template_ref>(paramList["data"].ToString());
            application_ref[] applications = Newtonsoft.Json.JsonConvert.DeserializeObject<application_ref[]>(paramList["applications"].ToString());

            if (id != data.rfc_template_id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            db.Entry(data).State = System.Data.Entity.EntityState.Modified;

            try
            {
                db.SaveChanges();

                var recordsToDelete = (from a in db.RfcTemplateApplicationsXref
                                       where a.rfc_template_id == id
                                       select a);

                db.RfcTemplateApplicationsXref.RemoveRange(recordsToDelete);
                db.SaveChanges();

                IList<rfc_template_application_xref> add_temp_appl_xref = new List<rfc_template_application_xref>();
                foreach (var item in applications)
                {
                    rfc_template_application_xref row = new rfc_template_application_xref();
                    row.rfc_template_id = id;
                    row.application_id = item.application_id;
                    add_temp_appl_xref.Add(row);
                }
                db.RfcTemplateApplicationsXref.AddRange(add_temp_appl_xref);
                db.SaveChanges();        
            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }

            return Request.CreateResponse(HttpStatusCode.OK);
        }

        [ActionName("RFCTemplate")]
        public HttpResponseMessage PostRFCTemplate(JObject paramList)
        {

            rfc_template_ref data = Newtonsoft.Json.JsonConvert.DeserializeObject<rfc_template_ref>(paramList["data"].ToString());
            application_ref[] applications = Newtonsoft.Json.JsonConvert.DeserializeObject<application_ref[]>(paramList["applications"].ToString());

            if (ModelState.IsValid)
            {
                db.RfcTemplates.Add(data);
                db.SaveChanges();

                IList<rfc_template_application_xref> add_temp_appl_xref = new List<rfc_template_application_xref>();
                foreach (var item in applications)
                {
                    rfc_template_application_xref row = new rfc_template_application_xref();
                    row.rfc_template_id = data.rfc_template_id;
                    row.application_id = item.application_id;
                    add_temp_appl_xref.Add(row);
                }
                db.RfcTemplateApplicationsXref.AddRange(add_temp_appl_xref);
                db.SaveChanges();        


                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [ActionName("RFCTemplate")]
        public HttpResponseMessage DeleteRFCTemplate(int id)
        {
            rfc_template_ref data = db.RfcTemplates.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.RfcTemplates.Remove(data);

            try
            {
                db.SaveChanges();

                var recordsToDelete = (from a in db.RfcTemplateApplicationsXref
                                       where a.rfc_template_id == data.rfc_template_id
                                       select a);

                db.RfcTemplateApplicationsXref.RemoveRange(recordsToDelete);
                db.SaveChanges();

                var recordsToDeleteRFCDtl = (from a in db.RFCTemplateDetails
                                       where a.rfc_template_id == data.rfc_template_id
                                       select a);

                db.RFCTemplateDetails.RemoveRange(recordsToDeleteRFCDtl);
                db.SaveChanges();

            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }
            return Request.CreateResponse(HttpStatusCode.OK, data);
        }

        [ActionName("RFCTemplateDetail")]
        public rfc_template_detail_ref GetRFCTemplateDetail(short id)
        {
            if (id == 0)
            {
                return GetEmptyRFCTemplateDetail();
            }

            rfc_template_detail_ref item = db.RFCTemplateDetails.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        private rfc_template_detail_ref GetEmptyRFCTemplateDetail()
        {
            return new rfc_template_detail_ref();
        }

        [ActionName("RFCTemplateDetail")]
        public HttpResponseMessage DeleteRFCTemplateDetail(int id)
        {
            rfc_template_detail_ref data = db.RFCTemplateDetails.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.RFCTemplateDetails.Remove(data);

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

        [ActionName("RFCTemplateDetails")]
        public object GetRFCTemplateDetails(int rfc_template_id)
        {

            var entryPoint = (from rfctemplatesdtl in db.RFCTemplateDetails
                              join rptprt in db.ReportParts on rfctemplatesdtl.rfc_report_part_id equals rptprt.report_part_id 
                              //join depl_mse_env in db.DeploymentMSEEnvironments on rfctemplates.deployment_mse_environment_id equals depl_mse_env.deployment_mse_environment_id into gdepl_mse_env
                              //from agdepl_mse_env in gdepl_mse_env.DefaultIfEmpty()
                              //join depltypes in db.DeploymentTypes on rfctemplates.deployment_type_id equals depltypes.deployment_type_id into gdepltypes
                              //from agdepltypes in gdepltypes.DefaultIfEmpty()
                              //join servertypes in db.ServerTypes on rfctemplates.server_type_id equals servertypes.server_type_id into gservertypes
                              //from agservertypes in gservertypes.DefaultIfEmpty()
                              where rfctemplatesdtl.rfc_template_id == rfc_template_id
                              select new
                              {
                                  rptprt.report_part_nm,
                                  rfctemplatesdtl.rfc_template_detail_key,
                                  rfctemplatesdtl.rfc_template_detail_id,
                                  rfctemplatesdtl.rfc_template_detail_nm,
                                  rfctemplatesdtl.rfc_report_part_id
                              }
                              ).ToList();


            var returnObject = new { rfctemplatedetails = entryPoint.ToArray() };
            return returnObject;
        }

        // POST api/WorkItemAPI
        [ActionName("RFCTemplateDetail")]
        public HttpResponseMessage PostRFCTemplateDetail(rfc_template_detail_ref data)
        {
            if (ModelState.IsValid)
            {
                db.RFCTemplateDetails.Add(data);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [ActionName("RFCTemplateDetail")]
        public HttpResponseMessage PutRFCTemplateDetail(int id, rfc_template_detail_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.rfc_template_detail_id)
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

        #endregion


        #region ApplicationMatrix
        [ActionName("ReleaseApplicationMatrix")]
        public object GetReleaseApplicationMatrix(short release_id)
        {


            var appmatrix = (from relWIExref in db.Release_Work_Item_Xrefs
                              join wkitems in db.WorkItems on relWIExref.work_item_id equals wkitems.work_item_id
                              join scope in db.Scopes on wkitems.scope_id equals scope.scope_id into sc
                              from sco in sc.DefaultIfEmpty()
                              join config in db.Configurations on wkitems.work_item_id equals config.work_item_id
                              join application in db.Applications on config.application_id equals application.application_id into ap
                              from app in ap.DefaultIfEmpty()
                              where (relWIExref.release_id == release_id)
                              select new
                              {
                                  app.application_nm,
                                  sco.scope_nm,
                                  wkitems.work_item_title,
                                  wkitems.work_item_id,
                                  wkitems.work_item_ext_id,
                              }).Distinct().ToList();

            var apps = (from appref in appmatrix
                                select new { appref.application_nm }).Distinct().ToList();

            var returnObject = new { applications = apps, matrixdata = appmatrix };
            return returnObject;
        }

        #endregion

        #region Release Notes Creation

        #region RFCs
        // GET api/ReleaseAPI/5
        [ActionName("RFC")]
        public object GetRFC(int id)
        {
            if (id == 0)
            {
                return GetEmptyRFC();
            }

            rfc_ref item = db.Rfcs.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

  
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return item;

        }

        private rfc_ref GetEmptyRFC()
        {
            return new rfc_ref();
        }

        [ActionName("RFCReleaseNotes")]
        public HttpResponseMessage PostRFCReleaseNotes(int id)
        {

            rfc_ref item = db.Rfcs.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            CommonFunctions commfun = new CommonFunctions();
            MemoryStream stream = new MemoryStream();

            string rfc_template_filename = commfun.GetApplicationPath() + Constants.RFCTemplatesPath +  @"\" + item.rfc_template_filename;
            if (File.Exists(rfc_template_filename))
            {
                object missing = Type.Missing;

                DocX doc = DocX.Load(rfc_template_filename);
                //doc.AddCustomProperty(new CustomProperty("v1", "myvalue"));
                ReplaceRFCinfomationInReleaseNote(item.rfc_id, doc);
                doc.SaveAs(stream);
                stream.Seek(0, SeekOrigin.Begin);
            }

            if (stream != null)
            {
                HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
                result.Content = new StreamContent(stream);
                result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                //result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/msword");
                return result;
            }
            else
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

        }

        private void ReplaceRFCinfomationInReleaseNote(int local_rfc_id, DocX doc)
        {

            var rfcdeployment = (from rfc in db.Rfcs
                                 join deplenv in db.DeploymentEnvironments on rfc.deployment_environment_id equals deplenv.deployment_environment_id into gdeplenv
                                 from agdeplenv in gdeplenv.DefaultIfEmpty()
                                 join depl_mse_env in db.DeploymentMSEEnvironments on rfc.deployment_mse_environment_id equals depl_mse_env.deployment_mse_environment_id into gdepl_mse_env
                                 from agdepl_mse_env in gdepl_mse_env.DefaultIfEmpty()
                                 join depltypes in db.DeploymentTypes on rfc.deployment_type_id equals depltypes.deployment_type_id into gdepltypes
                                 from agdepltypes in gdepltypes.DefaultIfEmpty()
                                 join servertypes in db.ServerTypes on rfc.server_type_id equals servertypes.server_type_id into gservertypes
                                 from agservertypes in gservertypes.DefaultIfEmpty()
                                 where rfc.rfc_id == local_rfc_id
                                 select new
                                 {
                                     rfc.rfc_nm,
                                     rfc.rfc_number,
                                     rfc.rfc_descr,
                                     rfc.comments,
                                     rfc.release_id,
                                     agdeplenv.deployment_environment_nm,
                                     agdepl_mse_env.deployment_mse_environment_nm,
                                     agdepltypes.deployment_type_nm,
                                     agservertypes.server_type_nm,
                                     agservertypes.server_type_id
                                 }
                              ).FirstOrDefault();


            var rfcdetails = (from rfcdtl in db.RfcDetails
                              join reportprt in db.ReportParts on rfcdtl.rfc_report_part_id equals reportprt.report_part_id into grptpart
                              from agrptpart in grptpart.DefaultIfEmpty()
                              where rfcdtl.rfc_id == local_rfc_id
                              select new
                              {
                                  rfcdtl.rfc_detail_id,
                                  rfcdtl.rfc_detail_nm,
                                  rfcdtl.rfc_detail_key,
                                  agrptpart.report_part_nm
                              }
                              ).OrderBy(x => x.report_part_nm).ToList();


            DocxReplaceText(doc, "rfc_nm", rfcdeployment.rfc_nm);
            DocxReplaceText(doc, "rfc_number", rfcdeployment.rfc_number);
            DocxReplaceText(doc, "rfc_descr", rfcdeployment.rfc_descr);
            DocxReplaceText(doc, "rfc_comments", rfcdeployment.comments);

            DocxReplaceText(doc, "deployment_environment_nm", rfcdeployment.deployment_environment_nm);
            DocxReplaceText(doc, "deployment_mse_environment_nm", rfcdeployment.deployment_mse_environment_nm);
            DocxReplaceText(doc, "deployment_type_nm", rfcdeployment.deployment_type_nm);
            DocxReplaceText(doc, "server_type_nm", rfcdeployment.server_type_nm);

            foreach (var rfcdtl in rfcdetails)
            {
                DocxReplaceText(doc, rfcdtl.report_part_nm + (rfcdtl.rfc_detail_key == null ? string.Empty : rfcdtl.rfc_detail_key), rfcdtl.rfc_detail_nm);
            }

            var servers = (from sers in db.Servers
                           where sers.server_type_id == rfcdeployment.server_type_id
                           select sers.server_nm).ToArray();

            string server_nms = String.Join(",", servers.AsEnumerable());
            DocxReplaceText(doc, "servers", server_nms);


            //Get Workitems
            var rfcWorkItems = (from relWIExref in db.Release_Work_Item_Xrefs
                                join conf in db.Configurations on relWIExref.work_item_id equals conf.work_item_id
                                join rfctmpappxref in db.RfcTemplateApplicationsXref on conf.application_id equals rfctmpappxref.application_id
                                join rfctmpref in db.RfcTemplates on rfctmpappxref.rfc_template_id equals rfctmpref.rfc_template_id
                                join wkref in db.WorkItems on relWIExref.work_item_id equals wkref.work_item_id
                                where (relWIExref.release_id == rfcdeployment.release_id)
                                select new { workitem = wkref.work_item_ext_id + "-" + wkref.work_item_title }
                              ).Distinct().ToArray();



            DocxReplaceText(doc, "workitems", String.Join("\n", rfcWorkItems.Select(x=>x.workitem).ToArray()));

        }

        private void DocxReplaceText(DocX doc, string find, string replacetext)
        {
            if (string.IsNullOrEmpty(find)) return;
            doc.ReplaceText("@" + find, replacetext == null ? string.Empty : replacetext,false, System.Text.RegularExpressions.RegexOptions.None, null,null, MatchFormattingOptions.ExactMatch);
        }


        [ActionName("RFC")]
        public HttpResponseMessage PostRFC(JObject paramList)
        {

            rfc_ref data = Newtonsoft.Json.JsonConvert.DeserializeObject<rfc_ref>(paramList["data"].ToString());

            if (ModelState.IsValid)
            {
                db.Rfcs.Add(data);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [ActionName("RFC")]
        public HttpResponseMessage PutRFC(int id, JObject paramList)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            rfc_ref data = Newtonsoft.Json.JsonConvert.DeserializeObject<rfc_ref>(paramList["data"].ToString());

            if (id != data.rfc_id)
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


        [ActionName("RFC")]
        public HttpResponseMessage DeleteRFC(int id)
        {
            rfc_ref data = db.Rfcs.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Rfcs.Remove(data);

            try
            {
                db.SaveChanges();
            
                var recordsToDeleteRFCDtl = (from a in db.RfcDetails
                                             where a.rfc_id == data.rfc_id
                                             select a);

                db.RfcDetails.RemoveRange(recordsToDeleteRFCDtl);
                db.SaveChanges();

            }
            catch (DbUpdateConcurrencyException ex)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, ex);
            }
            return Request.CreateResponse(HttpStatusCode.OK, data);
        }

        [ActionName("RFCs")]
        public Array GetRFCs(short release_id)
        {
            var entryPoint = (from rfcref in db.Rfcs
                              where (rfcref.release_id == release_id)
                              select new
                              {
                                  rfcref.rfc_id,
                                  rfcref.rfc_nm,
                                  rfcref.rfc_number
                              }).ToList();

            return entryPoint.ToArray();
        }

        private void CreateRFCFromTemplate(short release_id)
        {

            //Get No. of RFC which is required
            var rfcTemplateRequires = (from relWIExref in db.Release_Work_Item_Xrefs
                              join conf in db.Configurations on relWIExref.work_item_id equals conf.work_item_id
                              join rfctmpappxref in db.RfcTemplateApplicationsXref on conf.application_id equals rfctmpappxref.application_id
                              join rfctmpref in db.RfcTemplates on rfctmpappxref.rfc_template_id equals rfctmpref.rfc_template_id
                              where (relWIExref.release_id == release_id)
                              select rfctmpref
                              ).Distinct().ToList();


            //Create local copy for memory joins
            var rfcref_local = (from rfcref in db.Rfcs
                               where (rfcref.release_id == release_id)
                              select rfcref
                              ).ToList();

            //Create local copy for memory joins
            var rfcrefdetail_local = (from rfcrefdtl in db.RfcDetails
                                      join rfcref in db.Rfcs on rfcrefdtl.rfc_id equals rfcref.rfc_id
                                      where (rfcref.release_id == release_id)
                                      select rfcrefdtl
                                    ).ToList();

            //Delete RFCs which is not required and created earlier <<

            //Delete RFCs which is not required and created earlier 
            //(IMP: do not delete RFCs which are created manually for that rfc_template_id will be null)
            var recordsToRemove_RFC = (from rfcref in rfcref_local
                                       where (rfcref.rfc_template_id != null && !rfcTemplateRequires.Any(s => s.rfc_template_id == rfcref.rfc_template_id && rfcref.release_id == release_id))
                                       select rfcref).Distinct().ToList();

            //Delete RFC Details
            var recordsToRemove_RFCDtl = (from rfcrefdtl in rfcrefdetail_local
                                          join rfcref in recordsToRemove_RFC on rfcrefdtl.rfc_id equals rfcref.rfc_id
                                          select rfcrefdtl).ToList();

            db.RfcDetails.RemoveRange(recordsToRemove_RFCDtl);
            db.Rfcs.RemoveRange(recordsToRemove_RFC);
            db.SaveChanges();
            //>>


            //Create RFC from Template if not exist in RFC_REF <<

            //Create RFC
            var recordsToAdd_RFC = (from rfctmp in rfcTemplateRequires
                                    where !rfcref_local.Any(s => s.rfc_template_id == rfctmp.rfc_template_id)
                                    select rfctmp).Distinct().ToList();


            foreach (var item in recordsToAdd_RFC)
            {

                rfc_ref rowrfc = new rfc_ref();
                rowrfc.release_id = release_id;
                rowrfc.rfc_nm = item.rfc_template_nm;
                rowrfc.rfc_descr = item.rfc_template_descr;
                rowrfc.rfc_template_id = item.rfc_template_id;
                rowrfc.deployment_environment_id = item.deployment_environment_id;
                rowrfc.deployment_mse_environment_id = item.deployment_mse_environment_id;
                rowrfc.deployment_type_id = item.deployment_type_id;
                rowrfc.server_type_id = item.server_type_id;
                rowrfc.rfc_template_filename = item.rfc_template_filename;

                db.Rfcs.Add(rowrfc);
                db.SaveChanges();

                //Create RFC Details
                var rfctmpdetail_local = (from rfcrefdtl in db.RFCTemplateDetails
                                          where (rfcrefdtl.rfc_template_id == rowrfc.rfc_template_id)
                                          select rfcrefdtl
                                        ).ToList();

                List<rfc_detail_ref> rowdtls = new List<rfc_detail_ref>();
                foreach (var itemdtl in rfctmpdetail_local)
                {
                    rfc_detail_ref rowdtl = new rfc_detail_ref();
                    rowdtl.rfc_id = rowrfc.rfc_id;
                    rowdtl.rfc_detail_nm = itemdtl.rfc_template_detail_nm;
                    rowdtl.rfc_report_part_id = itemdtl.rfc_report_part_id;
                    rowdtl.rfc_detail_key = itemdtl.rfc_template_detail_key;
                    rowdtls.Add(rowdtl);
                }
                db.RfcDetails.AddRange(rowdtls);
                db.SaveChanges();
            }


        }
        #endregion

        #region RFCDetails
        [ActionName("RFCDetail")]
        public rfc_detail_ref GetRFCDetail(short id)
        {
            if (id == 0)
            {
                return GetEmptyRFCDetail();
            }

            rfc_detail_ref item = db.RfcDetails.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        private rfc_detail_ref GetEmptyRFCDetail()
        {
            return new rfc_detail_ref();
        }

        [ActionName("RFCDetail")]
        public HttpResponseMessage DeleteRFCDetail(int id)
        {
            rfc_detail_ref data = db.RfcDetails.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.RfcDetails.Remove(data);

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

        [ActionName("RFCDetails")]
        public object GetRFCDetails(int rfc_id)
        {

            var entryPoint = (from rfcdtl in db.RfcDetails
                              join rptprt in db.ReportParts on rfcdtl.rfc_report_part_id equals rptprt.report_part_id
                              where rfcdtl.rfc_id == rfc_id
                              select new
                              {
                                  rptprt.report_part_nm,
                                  rfcdtl.rfc_detail_id,
                                  rfcdtl.rfc_detail_nm,
                                  rfcdtl.rfc_detail_key,
                                  rfcdtl.rfc_report_part_id
                              }
                              ).ToList();


            var returnObject = new { rfcdetails = entryPoint.ToArray() };
            return returnObject;
        }

        [ActionName("RFCDetail")]
        public HttpResponseMessage PostRFCDetail(rfc_detail_ref data)
        {
            if (ModelState.IsValid)
            {
                db.RfcDetails.Add(data);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

        [ActionName("RFCDetail")]
        public HttpResponseMessage PutRFCDetail(int id, rfc_detail_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.rfc_detail_id)
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

        #endregion

        #endregion

        protected override void Dispose(bool disposing)
        {
            db.Dispose();
            base.Dispose(disposing);
        }

    }
}
