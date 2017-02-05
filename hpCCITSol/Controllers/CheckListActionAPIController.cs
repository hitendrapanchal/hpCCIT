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
using System.Threading.Tasks;
using System.Text;


namespace eTrackerSol.Controllers
{
    public class CheckListActionAPIController : ApiController
    {
        private DataContext db = new DataContext();



        // GET api/ReleaseAPI
        [ActionName("CheckListItemsDetail")]
        public object GetCheckListItemsDetail([FromUri] object param)
        {

            short checklist_action_id = 0;

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["checklist_action_id"].ToString()))
                checklist_action_id = Convert.ToInt16(((JValue)paramdata["checklist_action_id"]).Value);


            var chklstactionitems = (from chklstitemxref in db.CheckListActionsXref
                                     join chklstref in db.CheckLists on chklstitemxref.checklist_id equals chklstref.checklist_id
                                     join status in db.Statuses on chklstitemxref.status_id equals status.status_id into st
                                     from sts in st.DefaultIfEmpty()
                                     where chklstitemxref.checklist_action_id == checklist_action_id
                                     select new
                                     {
                                         chklstitemxref.checklist_id,
                                         chklstitemxref.checklist_action_id,
                                         chklstitemxref.checklist_action_xref_id,
                                         chklstitemxref.powershell_script,
                                         chklstitemxref.powershell_script_execution_comments,
                                         chklstitemxref.powershell_script_timedout,
                                         chklstref.checklist_nm,
                                         sts.status_nm
                                     }
                                        ).ToList();

            var checklistInfo = (from chklistaction in db.CheckListActions
                                 where chklistaction.checklist_action_id == checklist_action_id
                                 select chklistaction).ToList();


            var returnObject = new { CheckListActionItems = chklstactionitems, CheckListActionInfo = checklistInfo };
            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return returnObject;

        }


        // GET api/ReleaseAPI
        [ActionName("CheckListActionDetail")]
        public object GetCheckListActionDetail([FromUri] object param)
        {

            int checklist_action_xref_id = 0;

            JObject paramdata = JObject.Parse(param.ToString());

            if (!string.IsNullOrEmpty(paramdata["checklist_action_xref_id"].ToString()))
                checklist_action_xref_id = Convert.ToInt32(((JValue)paramdata["checklist_action_xref_id"]).Value);


            var chklstactionitems = (from chklstitemxref in db.CheckListActionsXref
                                     join chklstref in db.CheckLists on chklstitemxref.checklist_id equals chklstref.checklist_id
                                     join status in db.Statuses on chklstitemxref.status_id equals status.status_id into st
                                     from sts in st.DefaultIfEmpty()
                                     where chklstitemxref.checklist_action_xref_id == checklist_action_xref_id
                                     select new
                                     {
                                         chklstitemxref.checklist_id,
                                         chklstitemxref.checklist_action_id,
                                         chklstitemxref.checklist_action_xref_id,
                                         chklstitemxref.powershell_script,
                                         chklstitemxref.powershell_script_execution_comments,
                                         chklstitemxref.powershell_script_timedout,
                                         chklstitemxref.priority_order,
                                         chklstref.checklist_nm,
                                         sts.status_nm,
                                         sts.status_id,
                                         chklstitemxref.comments
                                     }).OrderBy(x => x.priority_order).ToList();

            Dictionary<string, int> checklistactionstatus = new Dictionary<string, int>();
            checklistactionstatus.Add(CheckListStatus.NOTSTARTED.ToString(), (int)CheckListStatus.NOTSTARTED);
            checklistactionstatus.Add(CheckListStatus.COMPLETED.ToString(), (int)CheckListStatus.COMPLETED);
            checklistactionstatus.Add(CheckListStatus.INPROGRESS.ToString(), (int) CheckListStatus.INPROGRESS);
            checklistactionstatus.Add(CheckListStatus.NOTAPPLICABLE.ToString(), (int) CheckListStatus.NOTAPPLICABLE);


            var returnObject = new { CheckListActionOnItem = chklstactionitems, ChecklistActionStatuses = checklistactionstatus };
            if (returnObject == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }
            return returnObject;

        }

        // GET api/ConfigurationAPI
        [ActionName("CheckListItemSummary")]
        public Array GetCheckListItemSummary([FromUri] object param)
        {


            CommonFilters commfilters = new CommonFilters();
            commfilters.DeserializeParameters(param);

            var entryPoint = (from checklist in db.CheckListActions
                              join chklistactionxref in db.CheckListActionsXref on checklist.checklist_action_id equals chklistactionxref.checklist_action_id
                              join refsubtype in db.SubTypes on checklist.sub_type_id equals refsubtype.sub_type_id into grefsubtype
                              from agrefsubtype in grefsubtype.DefaultIfEmpty()
                              where
                                     (String.IsNullOrEmpty(commfilters.modified_usr_ids) || commfilters.modified_usr_ids.Contains(checklist.modified_usr_id))
                                    && ((commfilters.startdate == null || checklist.modified_dtm == null) || checklist.modified_dtm >= commfilters.startdate)
                                    && ((commfilters.enddate == null || checklist.modified_dtm == null) || checklist.modified_dtm <= commfilters.enddate)

                              group chklistactionxref by new { agrefsubtype.sub_type_nm, checklist.created_usr_id, checklist.created_dtm ,checklist.checklist_action_nm, chklistactionxref.checklist_action_id } into g
                              select new
                              {
                                  NOTSTARTED = g.Count(chklistactionxref => chklistactionxref.status_id == (short)(CheckListStatus.NOTSTARTED)),
                                  COMPLETED = g.Count(chklistactionxref => chklistactionxref.status_id == (short)(CheckListStatus.COMPLETED)),
                                  INPROGRESS = g.Count(chklistactionxref => chklistactionxref.status_id == (short)(CheckListStatus.INPROGRESS)),
                                  NOTAPPLICABLE = g.Count(chklistactionxref => chklistactionxref.status_id == (short)(CheckListStatus.NOTAPPLICABLE)),
                                  g.Key.sub_type_nm,
                                  g.Key.created_usr_id,
                                  g.Key.created_dtm,
                                  g.Key.checklist_action_nm,
                                  g.Key.checklist_action_id,
                              }
                              ).ToList();


            // Apply filters

            var filtereddata = (from dbdata in entryPoint
                                where (
                                (commfilters.search_for_options==null)
                                ||
                                ((commfilters.search_for_options["value"].ToString() == "COMPLETED" && (dbdata.INPROGRESS + dbdata.NOTSTARTED) == 0) ||
                                 (commfilters.search_for_options["value"].ToString() == "INCOMPLETE" && (dbdata.INPROGRESS + dbdata.NOTSTARTED) > 0) ||
                                 (commfilters.search_for_options["value"].ToString() == "ALL" ))
                                 )
                                select dbdata).ToList();


            return filtereddata.ToArray();
        }


        // GET api/ConfigurationAPI
        [ActionName("ChecklistAction")]
        public Array GetChecklistAction()
        {

            var entryPoint = (from checklist in db.CheckListActions
                              select checklist).ToList();

            return entryPoint.ToArray();
        }


        // GET api/ConfigurationAPI/5
        [ActionName("ChecklistAction")]
        public checklist_action_ref GetChecklistAction(int id)
        {
            if (id == 0) return GetEmptyChecklistAction(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            checklist_action_ref item = db.CheckListActions.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

    

        // GET api/ConfigurationAPI/0
        private checklist_action_ref GetEmptyChecklistAction()
        {
            return new checklist_action_ref();
        }



        [ActionName("ChecklistAction")]
        public HttpResponseMessage PutChecklistAction(int id, checklist_action_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.checklist_action_id)
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

        [ActionName("ChecklistAction")]
        public HttpResponseMessage PostChecklistAction(checklist_action_ref data)
        {
            if (ModelState.IsValid)
            {
                // Get sub type ID from template
                checklist_template_ref tmprefdata = db.CheckListTemplates.Find(data.checklist_template_id);

                if (tmprefdata != null)
                {
                    data.sub_type_id = tmprefdata.sub_type_id;
                }

                db.CheckListActions.Add(data);
                db.SaveChanges();

                //For start new checklist : Add all checklist items from template : This will happen only first time when new checklist-action is added
                
                var itemsToBeAddedfromTemplate = (from chktempxref in db.CheckListTemplatesXref
                                                  where chktempxref.checklist_template_id == data.checklist_template_id
                                              select chktempxref).ToList();

                List<checklist_action_xref> addchecklistActionItems = new List<checklist_action_xref>();
                foreach (var item in itemsToBeAddedfromTemplate)
                {


                    checklist_action_xref row = new checklist_action_xref();
                    row.checklist_action_id = data.checklist_action_id;
                    row.checklist_id = item.checklist_id;
                    row.priority_order = item.priority_order;
                    row.status_id = (short)CheckListStatus.NOTSTARTED;
                    row.powershell_script = item.powershell_script;
                    row.powershell_script_timedout = item.powershell_script_timedout;
                    addchecklistActionItems.Add(row);
                }
                db.CheckListActionsXref.AddRange(addchecklistActionItems);
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



        [ActionName("ChecklistActionOnItem")]
        public HttpResponseMessage PutChecklistActionOnItem(int id, checklist_action_xref data)
        {


            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.checklist_action_xref_id)
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


        [ActionName("ChecklistAction")]
        public HttpResponseMessage DeleteChecklistAction(int id)
        {
            checklist_action_ref data = db.CheckListActions.Find(id);

            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.CheckListActions.Remove(data);

            var chklistactionitems = db.CheckListActionsXref.Where(s => s.checklist_action_id == id);
            db.CheckListActionsXref.RemoveRange(chklistactionitems);

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


        [ActionName("ExecutePSCheckListActionOnItem")]
        public HttpResponseMessage GetExecutePSCheckListActionOnItem(int checklist_action_xref_id)
        {
            checklist_action_xref data = db.CheckListActionsXref.Find(checklist_action_xref_id);

            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }


            try
            {
                CommonPowerShell cpshell = new CommonPowerShell();
                string powershell_script = data.powershell_script;
                StringBuilder powershell_returnoutput = new StringBuilder();

                int powershell_script_timedout = Convert.ToInt32(data.powershell_script_timedout);

                if (powershell_script_timedout <= 0)
                {
                    powershell_script_timedout = Constants.DEFAULT_PS_TIMEDOUT;
                    powershell_returnoutput.Append("There was no/0 timed out set. New default timed out is set : " + Constants.DEFAULT_PS_TIMEDOUT + " ms.");

                }
                var task = Task.Run(() => cpshell.ExecutePowerShellSynechronously(powershell_script, powershell_script_timedout));
                if (task.Wait(TimeSpan.FromMilliseconds(powershell_script_timedout)))
                    powershell_returnoutput.AppendLine(task.Result);
                else
                    powershell_returnoutput.AppendLine("Timed out error. Current timeout setting for this PS is : " + powershell_script_timedout.ToString() + " ms.");

               // powershell_returnoutput = cpshell.ExecutePowerShellSynechronously(powershell_script, powershell_script_timedout);
                
                if (powershell_returnoutput.ToString().Contains("[STATUS:"))
                {
                    int firstposition = powershell_returnoutput.ToString().IndexOf("[STATUS:");
                    int lastposition = powershell_returnoutput.ToString().IndexOf("]", firstposition);
                    string getstatus = powershell_returnoutput.ToString().Substring(firstposition + "[STATUS:".Length, lastposition - (firstposition + "[STATUS:".Length));

                    try
                    {
                        CheckListStatus checkListStatus = (CheckListStatus)Enum.Parse(typeof(CheckListStatus), getstatus);
                        data.status_id = Convert.ToInt16(checkListStatus);
                    }
                    catch {
                        powershell_returnoutput.AppendLine("ERROR : " + getstatus + " is not valid status. Please use valid status to be returned from Powershell script output. Eg. [STATUS:COMPLETED]");
                        data.status_id = Convert.ToInt16(CheckListStatus.NOTSTARTED);
                    }

                }

                data.powershell_script_execution_comments = powershell_returnoutput.ToString();
                data.powershell_script_timedout = powershell_script_timedout;
                data.comments += "PS executed on : " + DateTime.Now.ToLongDateString() + " " + DateTime.Now.ToLongTimeString() + "\n";

                db.Entry(data).State = System.Data.Entity.EntityState.Modified;
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