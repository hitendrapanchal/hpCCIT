using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace eTrackerSol.Models
{
    public interface IAudit
    {
        Nullable<System.DateTime> created_dtm { get; set; }
        string created_usr_id { get; set; }
        Nullable<System.DateTime> modified_dtm { get; set; }
        string modified_usr_id { get; set; }
    }
}
