﻿//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace eTrackerSol.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class DataModelEntities1 : DbContext
    {
        public DataModelEntities1()
            : base("name=DataModelEntities1")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public DbSet<api_ref> api_ref { get; set; }
        public DbSet<api_type_ref> api_type_ref { get; set; }
        public DbSet<application_ref> application_ref { get; set; }
        public DbSet<checklist_action_ref> checklist_action_ref { get; set; }
        public DbSet<checklist_action_xref> checklist_action_xref { get; set; }
        public DbSet<checklist_ref> checklist_ref { get; set; }
        public DbSet<checklist_template_ref> checklist_template_ref { get; set; }
        public DbSet<checklist_template_xref> checklist_template_xref { get; set; }
        public DbSet<client_ref> client_ref { get; set; }
        public DbSet<config_type_ref> config_type_ref { get; set; }
        public DbSet<configuration_ref> configuration_ref { get; set; }
        public DbSet<deployment_environment_ref> deployment_environment_ref { get; set; }
        public DbSet<deployment_mse_environment_ref> deployment_mse_environment_ref { get; set; }
        public DbSet<deployment_type_ref> deployment_type_ref { get; set; }
        public DbSet<inventory_ref> inventory_ref { get; set; }
        public DbSet<release_ref> release_ref { get; set; }
        public DbSet<release_sprint_xref> release_sprint_xref { get; set; }
        public DbSet<release_work_item_xref> release_work_item_xref { get; set; }
        public DbSet<report_part_ref> report_part_ref { get; set; }
        public DbSet<report_ref> report_ref { get; set; }
        public DbSet<rfc_detail_ref> rfc_detail_ref { get; set; }
        public DbSet<rfc_ref> rfc_ref { get; set; }
        public DbSet<rfc_template_application_xref> rfc_template_application_xref { get; set; }
        public DbSet<rfc_template_detail_ref> rfc_template_detail_ref { get; set; }
        public DbSet<rfc_template_ref> rfc_template_ref { get; set; }
        public DbSet<scope_ref> scope_ref { get; set; }
        public DbSet<server_ref> server_ref { get; set; }
        public DbSet<server_type_ref> server_type_ref { get; set; }
        public DbSet<sprint_ref> sprint_ref { get; set; }
        public DbSet<status_ref> status_ref { get; set; }
        public DbSet<status_type_ref> status_type_ref { get; set; }
        public DbSet<sub_type_ref> sub_type_ref { get; set; }
        public DbSet<type_ref> type_ref { get; set; }
        public DbSet<work_item_ref> work_item_ref { get; set; }
        public DbSet<ssrs_report_ref> ssrs_report_ref { get; set; }
    }
}
