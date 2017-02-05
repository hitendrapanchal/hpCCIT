using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Web;
using eTrackerSol.Models;
using System.Threading.Tasks;

namespace eTrackerSol.Common
{
    public enum JiraResource
    {
        project
    }
 

    public class AppCommonSettings
    {
        public IList<work_item_external_ref> GetWorkItemsFromExternalSource()
        {

            Common.IImportWorkItem importmanager;
            importmanager = new JIRAImport();
            return importmanager._GetWorkItemsFromExternalSource();
        }

    }

    



    interface  IImportWorkItem
    {


        IList<work_item_external_ref> _GetWorkItemsFromExternalSource(); 
    }

    /// <summary>
    /// A 'ConcreteProduct' class
    /// </summary>
    public class JIRAImport : IImportWorkItem
    {

        List<work_item_external_ref> externalSourceWorkItems;

        public IList<work_item_external_ref> _GetWorkItemsFromExternalSource()
        {
            externalSourceWorkItems = RunQuery(JiraResource.project);
            return externalSourceWorkItems;

        }



        private const string m_BaseUrl = "https://jira.atlassian.com/rest/api/latest/issue/JRA-9.json";
        private string m_Username;
        private string m_Password;

        public void SetLogin(string username, string password)
        {
            m_Username = username;
            m_Password = password;


        }

        public List<work_item_external_ref> RunQuery(JiraResource resource, string argument = null, string data = null, string method = "GET")
        {
            SetLogin("myuser", "mypassword");

            //string url = string.Format("{0}{1}/", m_BaseUrl, resource.ToString());

            //if (argument != null)
            //{
            //    url = string.Format("{0}{1}/", url, argument);
            //}

            //string url = m_BaseUrl;

            //HttpWebRequest request = WebRequest.Create(url) as HttpWebRequest;
            //request.ContentType = "application/json";
            //request.Method = method;

            //if (data != null)
            //{
            //    using (StreamWriter writer = new StreamWriter(request.GetRequestStream()))
            //    {
            //        writer.Write(data);
            //    }
            //}

            //string base64Credentials = GetEncodedCredentials();
            //request.Headers.Add("Authorization", "Basic " + base64Credentials);

            //HttpWebResponse response = request.GetResponse() as HttpWebResponse;

            
            string result = string.Empty;
            string filepath = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/work_item_ref_stub.txt");
            using (StreamReader reader = new StreamReader(filepath))
            {
                result = reader.ReadToEnd();
            }

            JObject apidata = JObject.Parse(result);
            JArray NewlyReceivedWorkItems = (JArray)apidata["WorkItems"]["row"];


            List<work_item_external_ref> NewlyReceivedWorkItemsToBeShown = new List<work_item_external_ref>();
            foreach (var wkitem in NewlyReceivedWorkItems)
            {
                work_item_external_ref row = new work_item_external_ref();
                row.work_item_ext_id = (wkitem["work_item_ext_id"] == null ? "<<Not available>>" : wkitem["work_item_ext_id"].ToString());
                row.work_item_title = (wkitem["work_item_title"] == null ? "<<Not available>>" : wkitem["work_item_title"].ToString());
                row.sprint_nm = (wkitem["sprint_nm"] == null ? "<<Not available>>" : wkitem["sprint_nm"].ToString());
                NewlyReceivedWorkItemsToBeShown.Add(row);
            }
            return NewlyReceivedWorkItemsToBeShown;
        }

        private string GetEncodedCredentials()
        {
            string mergedCredentials = string.Format("{0}:{1}", m_Username, m_Password);
            byte[] byteCredentials = UTF8Encoding.UTF8.GetBytes(mergedCredentials);
            return Convert.ToBase64String(byteCredentials);
        }

   
    }
}