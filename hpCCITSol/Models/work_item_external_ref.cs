using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace eTrackerSol.Models
{
    public class work_item_external_ref //: work_item_ref
    {
        public int work_item_id { get; set; }
        public string work_item_ext_id { get; set; }
        public string work_item_title { get; set; }
        public Nullable<short> sprint_id { get; set; }
        public Nullable<short> scope_id { get; set; }
        public string comments { get; set; }
        public Nullable<System.DateTime> created_dtm { get; set; }
        public string created_usr_id { get; set; }
        public Nullable<System.DateTime> modified_dtm { get; set; }
        public string modified_usr_id { get; set; }
        public string sprint_nm{ get; set; }
    }
}