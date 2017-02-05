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
using System.Data.Entity.Core.Objects.DataClasses;

namespace eTrackerSol.Controllers
{
    public class InventoryAPIController : ApiController
    {
        private DataContext db = new DataContext();


        // GET api/ConfigurationAPI
        [ActionName("Inventory")]
        public Array GetInventory([FromUri] object param)
        {

            var entryPoint = (from inventref in db.Inventory
                              join refappl in db.Applications on inventref.application_id equals refappl.application_id into grefappl
                              from agrefappl in grefappl.DefaultIfEmpty()
                              join deplenv in db.DeploymentEnvironments on inventref.deployment_environment_id equals deplenv.deployment_environment_id into gdeplenv
                              from agdeplenv in gdeplenv.DefaultIfEmpty()
                              join depl_mse_env in db.DeploymentMSEEnvironments on inventref.deployment_mse_environment_id equals depl_mse_env.deployment_mse_environment_id into gdepl_mse_env
                              from agdepl_mse_env in gdepl_mse_env.DefaultIfEmpty()
                              join servertypes in db.ServerTypes on inventref.server_type_id equals servertypes.server_type_id into gservertypes
                              from agservertypes in gservertypes.DefaultIfEmpty()
                              select new
                              {
                                  inventref.inventory_id,
                                  inventref.inventory_nm,
                                  inventref.deployment_environment_id,
                                  inventref.server_type_id,
                                  inventref.deployment_mse_environment_id,
                                  inventref.application_id,
                                  inventref.port_number,
                                  inventref.is_https,
                                  inventref.website_nm,
                                  inventref.virtual_directory,
                                  inventref.physical_path,
                                  inventref.auto_validation_url,
                                  inventref.metadata,
                                  inventref.comments,
                                  agrefappl.application_nm,
                                  agdeplenv.deployment_environment_nm,
                                  agdepl_mse_env.deployment_mse_environment_nm,
                                  agservertypes.server_type_nm
                              }
                              ).OrderBy(x => new { x.deployment_environment_nm, x.deployment_mse_environment_nm, x.application_nm, x.server_type_nm}).ToList();


            return entryPoint.ToArray();
        }

        [ActionName("InventorySummary")]
        public Array GetInventorySummary([FromUri] object param)
        {

            var entryPoint = (from inventref in db.Inventory
                              join refappl in db.Applications on inventref.application_id equals refappl.application_id into grefappl
                              from agrefappl in grefappl.DefaultIfEmpty()
                              join deplenv in db.DeploymentEnvironments on inventref.deployment_environment_id equals deplenv.deployment_environment_id into gdeplenv
                              from agdeplenv in gdeplenv.DefaultIfEmpty()
                              join depl_mse_env in db.DeploymentMSEEnvironments on inventref.deployment_mse_environment_id equals depl_mse_env.deployment_mse_environment_id into gdepl_mse_env
                              from agdepl_mse_env in gdepl_mse_env.DefaultIfEmpty()
                              join servertypes in db.ServerTypes on inventref.server_type_id equals servertypes.server_type_id into gservertypes
                              from agservertypes in gservertypes.DefaultIfEmpty()
                              join servers in db.Servers on inventref.server_type_id equals servers.server_type_id into gservers
                              from agservers in gservers.DefaultIfEmpty()
                              select new
                              {
                                  inventref.inventory_id,
                                  inventref.inventory_nm,
                                  inventref.deployment_environment_id,
                                  inventref.server_type_id,
                                  inventref.deployment_mse_environment_id,
                                  inventref.application_id,
                                  inventref.port_number,
                                  inventref.is_https,
                                  inventref.website_nm,
                                  inventref.virtual_directory,
                                  inventref.physical_path,
                                  inventref.validation_interface,
                                  inventref.metadata,
                                  inventref.comments,
                                  agrefappl.application_nm,
                                  agdeplenv.deployment_environment_nm,
                                  agdepl_mse_env.deployment_mse_environment_nm,
                                  agservertypes.server_type_nm,
                                  agservers.server_nm,
                                  auto_validation_url = string.Empty //UpdateAutoValidationURL(inventref)
                              }
                              ).OrderBy(x => new { x.deployment_environment_nm, x.deployment_mse_environment_nm, x.server_type_nm, x.application_nm, x.server_nm }).ToList();


            var auto_validation_url = (from inventref in entryPoint
                          select new
                           {
                               inventref.inventory_id,
                               inventref.inventory_nm,
                               inventref.deployment_environment_id,
                               inventref.server_type_id,
                               inventref.deployment_mse_environment_id,
                               inventref.application_id,
                               inventref.port_number,
                               inventref.is_https,
                               inventref.website_nm,
                               inventref.virtual_directory,
                               inventref.physical_path,
                               inventref.metadata,
                               inventref.comments,
                               inventref.application_nm,
                               inventref.deployment_environment_nm,
                               inventref.deployment_mse_environment_nm,
                               inventref.server_type_nm,
                               inventref.server_nm,
                               auto_validation_url = UpdateAutoValidationURL(inventref.is_https,inventref.server_nm, inventref.validation_interface, inventref.website_nm, inventref.virtual_directory, inventref.port_number)
                           }).ToList();


            return auto_validation_url.ToArray();
        }

        private string UpdateAutoValidationURL(bool? is_https, string server_nm, string validation_interface, string website_nm, string virtual_directory, string port_number)
        {
            string returnVal = string.Empty;

            if (validation_interface != null)
            {
                if (!validation_interface.ToLower().Contains("http"))
                {
                    returnVal = (is_https != null && is_https == true ? "https://" : "http://");
//                    returnVal += (!String.IsNullOrEmpty(website_nm) ? website_nm : string.Empty);
                    returnVal += server_nm;
                    returnVal += (!String.IsNullOrEmpty(port_number) ? ":" + port_number : string.Empty);
                    returnVal += (!String.IsNullOrEmpty(virtual_directory) ? "/" + virtual_directory + "/" : string.Empty);
                    returnVal += (!String.IsNullOrEmpty(validation_interface) ? validation_interface : string.Empty);
                }
                else
                {
                    returnVal = validation_interface;
                }
            }
            else
            {
                returnVal = (is_https != null && is_https == true ? "https://" : "http://");
                //returnVal += (!String.IsNullOrEmpty(website_nm) ? website_nm  : string.Empty);
                returnVal += server_nm;
                returnVal += (!String.IsNullOrEmpty(port_number) ? ":" + port_number : string.Empty);
                returnVal += (!String.IsNullOrEmpty(virtual_directory) ? "/" + virtual_directory + "/" : string.Empty);
            }
            return returnVal;
        }
        // GET api/ConfigurationAPI/5
        [ActionName("Inventory")]
        public inventory_ref GetInventory(int id)
        {
            if (id == 0) return GetEmptyInventory(); //Used to create empty structure for configuration_ref for ADD-NEW-Record

            inventory_ref item = db.Inventory.Find(id);
            if (item == null)
            {
                throw new HttpResponseException(Request.CreateResponse(HttpStatusCode.NotFound));
            }

            return item;
        }

        // GET api/InventoryAPI/0
        private inventory_ref GetEmptyInventory()
        {
            return new inventory_ref();
        }




        // PUT api/WorkItemAPI/5
        [ActionName("Inventory")]
        public HttpResponseMessage PutInventory(int id, inventory_ref data)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != data.inventory_id)
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
        [ActionName("Inventory")]
        public HttpResponseMessage PostInventory(inventory_ref data)
        {
            if (ModelState.IsValid)
            {

                db.Inventory.Add(data);
                db.SaveChanges();

                HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, data);
                return response;
            }
            else
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
        }

   
        // DELETE api/ConfigurationAPI/5
        [ActionName("Inventory")]
        public HttpResponseMessage DeleteInventory(int id)
        {
            inventory_ref data = db.Inventory.Find(id);
            if (data == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            db.Inventory.Remove(data);

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