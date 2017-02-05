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
using System.Data.Entity;
using System.Reflection;

namespace eTrackerSol.Controllers
{
    public class MasterRefAPIController : ApiController
    {

        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("MasterRef")]
        public Array GetMasterRef(MasterRef mref)
        {
            //DbSet dbset = GetMasterRefDBSet(mref);
            var entryPoint = (from data in db.Config_Types
                              select data).ToList();
            
            return entryPoint.ToArray();
        }
        
        // GET api/ConfigurationAPI
        [ActionName("MasterRef")]
        public object GetMasterRefUI(MasterRef mref)
        {
            object table= GetMasterRef_TableObject(mref);
            Type tabletype= table.GetType();

            IList<PropertyInfo> props = new List<PropertyInfo>(tabletype.GetProperties());

            // PropertyInfo[] properties = tabletype.GetProperties();
            //foreach (PropertyInfo property in properties)
            //{
            //    //property.SetValue(record, value);
            //}

            return table;
        }


        // GET api/ConfigurationAPI/5
        [ActionName("MasterRef")]
        public object GetMasterRef(int id, MasterRef mref)
        {
            if (id == 0) return GetEmptyMasterRef(mref); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            DbSet item = GetMasterRefDBSet(mref);
            item.Find(id);

            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        // GET api/ConfigurationAPI/0
        private object GetEmptyMasterRef(MasterRef mref)
        {
            return GetMasterRef_TableObject(mref);
        }

        private DbSet GetMasterRefDBSet(MasterRef mref)
        {
            DbSet returnvalue = null ;
            switch (mref)
            {
                case MasterRef.config_type_ref:
                    {
                        returnvalue= db.Config_Types;
                        break;
                    }
                case MasterRef.scope_ref:
                    {
                        returnvalue = db.Scopes;
                        break;
                    }
                case MasterRef.status_ref:
                    {
                        returnvalue = db.Statuses;
                        break;
                    }
            }
            return returnvalue;
        }

        private object GetMasterRef_TableObject(MasterRef mref)
        {
            object returnvalue = null;
            switch (mref)
            {
                case MasterRef.config_type_ref:
                    {
                        returnvalue = new config_type_ref();
                        break;
                    }
                case MasterRef.scope_ref:
                    {
                        returnvalue = new scope_ref();
                        break;
                    }
                case MasterRef.status_ref:
                    {
                        returnvalue = new status_ref();
                        break;
                    }
            }
            return returnvalue;
        }



        // PUT api/WorkItemAPI/5
        [ActionName("MasterRef")]
        public HttpResponseMessage PutMasterRef(int id, report_ref data)
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
        [ActionName("MasterRef")]
        public HttpResponseMessage PostMasterRef(report_ref data)
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
        [ActionName("MasterRef")]
        public HttpResponseMessage DeleteMasterRef(int id)
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


        

    }
}