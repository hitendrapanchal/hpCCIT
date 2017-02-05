using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;
using eTrackerSol.Models;

namespace eTrackerSol.Models
{
    public class DataContext : DbContext
    {
        public DataContext()
            : base("name=DataModelEntities1")
            
        {
           
        }

        public DbSet<configuration_ref> Configurations { get; set; }
        public DbSet<sprint_ref> Sprints { get; set; }
        public DbSet<application_ref> Applications { get; set; }
        public DbSet<config_type_ref> Config_Types { get; set; }
        public DbSet<status_type_ref> StatusTypes { get; set; }
        public DbSet<status_ref> Statuses { get; set; }
        public DbSet<scope_ref> Scopes { get; set; }
        public DbSet<release_ref> Releases { get; set; }
        public DbSet<release_work_item_xref> Release_Work_Item_Xrefs  { get; set; }
        public DbSet<work_item_ref> WorkItems { get; set; }
        public DbSet<release_sprint_xref> Release_Sprint_Xrefs { get; set; }
        public DbSet<report_ref> Reports { get; set; }
        public DbSet<checklist_ref> CheckLists { get; set; }
        public DbSet<checklist_template_ref> CheckListTemplates { get; set; }
        public DbSet<checklist_template_xref> CheckListTemplatesXref { get; set; }
        public DbSet<checklist_action_ref> CheckListActions { get; set; }
        public DbSet<checklist_action_xref> CheckListActionsXref { get; set; }

        public DbSet<rfc_ref> Rfcs { get; set; }
        public DbSet<rfc_detail_ref> RfcDetails { get; set; }

        public DbSet<rfc_template_application_xref> RfcTemplateApplicationsXref { get; set; }
        public DbSet<rfc_template_ref> RfcTemplates{ get; set; }
        public DbSet<server_type_ref> ServerTypes { get; set; }
        public DbSet<server_ref> Servers{ get; set; }
        public DbSet<deployment_environment_ref> DeploymentEnvironments { get; set; }
        public DbSet<deployment_mse_environment_ref> DeploymentMSEEnvironments{ get; set; }
        public DbSet<deployment_type_ref> DeploymentTypes{ get; set; }
        public DbSet<rfc_template_detail_ref> RFCTemplateDetails { get; set; }
        public DbSet<report_part_ref> ReportParts { get; set; }

        public DbSet<type_ref> Types { get; set; }
        public DbSet<sub_type_ref> SubTypes { get; set; }
        public DbSet<client_ref> Clients { get; set; }
        public DbSet<api_ref> APIs { get; set; }
        public DbSet<api_type_ref> APITypes { get; set; }

        public DbSet<inventory_ref> Inventory { get; set; }

        public override int SaveChanges()
        {
           
            // Generic audit (created-modified by and datetime) code added
            // add interface IAudit wherever audit is required

            var entities = ChangeTracker.Entries().Where(x => x.Entity is IAudit && (x.State == EntityState.Added || x.State == EntityState.Modified));

            var currentUsername = (HttpContext.Current != null && HttpContext.Current.User != null) 
                ? HttpContext.Current.User.Identity.Name
                : "Anonymous";

            currentUsername = String.IsNullOrEmpty(currentUsername) ? System.Environment.UserName.Substring(System.Environment.UserName.IndexOf(@"\") + 1) : currentUsername;
            currentUsername = String.IsNullOrEmpty(currentUsername) ? "Anonymous" : currentUsername;
 
            foreach (var entity in entities)
            {
                if (entity.State == EntityState.Added)
                {
                    ((IAudit)entity.Entity).created_dtm= DateTime.Now;
                    ((IAudit)entity.Entity).created_usr_id = currentUsername;
                }

                ((IAudit)entity.Entity).modified_dtm = DateTime.Now;
                ((IAudit)entity.Entity).modified_usr_id = currentUsername;
            }
            
            return base.SaveChanges();

        }


    }


}