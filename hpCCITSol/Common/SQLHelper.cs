using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.OleDb;
using System.Data;

namespace eTrackerSol.Common
{
    public class SQLHelper
    {

        private OleDbConnection GetOleDBConnection(string connectstr)
        {
            try {
                return new OleDbConnection(connectstr);
            }
            catch ( Exception ex){
                throw ex;
            }
        }

        public DataSet  GetDataSets(string cmdtext, string connectstr)
        {
            OleDbConnection conn;
            DataSet ds;
            try
            {
                conn = GetOleDBConnection(connectstr);
                conn.Open();
                OleDbCommand cmd = new OleDbCommand(cmdtext, conn);
                OleDbDataAdapter da = new OleDbDataAdapter(cmd);
                ds = new DataSet();
                da.Fill(ds);
                conn.Close();
                return ds;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        
        }

    }

    
}