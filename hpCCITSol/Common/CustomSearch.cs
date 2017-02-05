using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using eTrackerSol.Models;
namespace eTrackerSol.Common
{


    public class CommonFilters
    {
        public List<application_ref> applications;
        public List<scope_ref> scopes;
        public List<status_ref> statuses;
        public List<sprint_ref> sprints;

        public DateTime? startdate;
        public DateTime? enddate;
        public string work_item_nm;
        public string modified_usr_ids;
        public JObject search_for_options;


        public void DeserializeParameters(object param)
        {
            JObject paramdata = JObject.Parse(param.ToString());
  
            if (!string.IsNullOrEmpty(paramdata["startdate"].ToString()))
                startdate = Convert.ToDateTime(((JValue)paramdata["startdate"]).Value);


            if (!string.IsNullOrEmpty(paramdata["enddate"].ToString()))
                enddate = Convert.ToDateTime(((JValue)paramdata["enddate"]).Value).AddDays(1);

  
            applications = (paramdata["applications"] == null) ? null : JsonConvert.DeserializeObject<List<application_ref>>(paramdata["applications"].ToString());
            scopes = (paramdata["scopes"] == null) ? null : JsonConvert.DeserializeObject<List<scope_ref>>(paramdata["scopes"].ToString());
            statuses = (paramdata["statuses"] == null) ? null : JsonConvert.DeserializeObject<List<status_ref>>(paramdata["statuses"].ToString());
            sprints = (paramdata["sprints"] == null) ? null : JsonConvert.DeserializeObject<List<sprint_ref>>(paramdata["sprints"].ToString()); 


            work_item_nm = (paramdata["work_item_nm"] == null ) ? string.Empty:  paramdata["work_item_nm"].ToString();
            modified_usr_ids = (paramdata["modified_usr_ids"] == null) ? string.Empty: paramdata["modified_usr_ids"].ToString();

            if (paramdata["search_for_options"]!=null)
            search_for_options = (string.IsNullOrEmpty(paramdata["search_for_options"].ToString()) ) ? null : JObject.Parse(paramdata["search_for_options"].ToString());
            
        }


    }
}