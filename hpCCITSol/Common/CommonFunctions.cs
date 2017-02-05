using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Web;
using System.IO;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;

namespace eTrackerSol.Common
{
    public class CommonFunctions
    {

        public string GetCSVOutput( DataTable dt)
        {
            StringBuilder sb = new StringBuilder();

            IEnumerable<string> columnNames = dt.Columns.Cast<DataColumn>().
                                              Select(column => column.ColumnName);
            sb.AppendLine(string.Join(",", columnNames));

            foreach (DataRow row in dt.Rows)
            {
                IEnumerable<string> fields = row.ItemArray.Select(field => field.ToString());
                sb.AppendLine(string.Join(",", fields));
            }
            return sb.ToString();
        }

        public string [] GetCSVOutput(DataSet ds)
        {

            string[] strCSVoutput = new string[ds.Tables.Count];
            for(int i=0; i<ds.Tables.Count; i++)
            {
                strCSVoutput[i]=GetCSVOutput(ds.Tables[i]);
            }
            return strCSVoutput;
        }

        #region DirectoryFileIO

        public string GetApplicationPath()
        {
            return HttpContext.Current.Server.MapPath("~");
        }
        public Dictionary<string,string> GetFiles(string directory)
        {
            Dictionary<string, string> dictfiles = new Dictionary<string, string>();
            try {
                DirectoryInfo dirinfo = new DirectoryInfo(directory);
                FileInfo[] filesinfo = dirinfo.GetFiles();

                foreach (FileInfo fileinfo in filesinfo)
                {
                    dictfiles.Add(fileinfo.Name, fileinfo.FullName);
                }
            }
            catch(Exception ex)
            {
                throw ex;
            }
            return dictfiles;
        }

        public Dictionary<string, string> GetDirectories(string path)
        {
            Dictionary<string, string> dicdirs = new Dictionary<string, string>();
            try
            {
                DirectoryInfo dirinfo = new DirectoryInfo(path);
                DirectoryInfo[] dirsinfo = dirinfo.GetDirectories();

                foreach (DirectoryInfo item in dirsinfo)
                {
                    dicdirs.Add(item.Name, item.FullName);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return dicdirs;
        }
        #endregion

        public  MemoryStream SerializeToStream(object o)
        {
            MemoryStream stream = new MemoryStream();
            IFormatter formatter = new BinaryFormatter();
            formatter.Serialize(stream, o);
            return stream;
        }
    }
}