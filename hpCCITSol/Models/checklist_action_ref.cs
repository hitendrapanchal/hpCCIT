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
    
    public partial class checklist_action_ref
    {
        public int checklist_action_id { get; set; }
        public string checklist_action_nm { get; set; }
        public Nullable<short> checklist_template_id { get; set; }
        public Nullable<short> sub_type_id { get; set; }
        public string comments { get; set; }
        public Nullable<System.DateTime> created_dtm { get; set; }
        public string created_usr_id { get; set; }
        public Nullable<System.DateTime> modified_dtm { get; set; }
        public string modified_usr_id { get; set; }
    }
}
