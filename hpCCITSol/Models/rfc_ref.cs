//------------------------------------------------------------------------------
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
    using System.Collections.Generic;
    
    public partial class rfc_ref
    {
        public int rfc_id { get; set; }
        public string rfc_nm { get; set; }
        public string rfc_descr { get; set; }
        public string rfc_number { get; set; }
        public Nullable<short> release_id { get; set; }
        public Nullable<short> rfc_template_id { get; set; }
        public Nullable<short> deployment_type_id { get; set; }
        public Nullable<short> server_type_id { get; set; }
        public Nullable<byte> deployment_environment_id { get; set; }
        public Nullable<byte> deployment_mse_environment_id { get; set; }
        public string rfc_template_filename { get; set; }
        public string comments { get; set; }
    }
}
