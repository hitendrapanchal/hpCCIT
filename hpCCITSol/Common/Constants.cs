using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace eTrackerSol.Common
{
    public static class Constants
    {
        public static MasterRef masterFileType;
        public static int DEFAULT_PS_TIMEDOUT = 60000;
        public static string RFCTemplatesPath = @"\Documents\RFCTemplates";
        public static string CACHE_KEY_MASTERDATA = "MasterData";

    }

    public enum CRUD
    {
        None = 0,
        Add = 1,
        Update = 2,
        Delete = 3
    }


    public enum MasterRef
    {
        NotDefined = 0,
        status_ref = 1,
        scope_ref = 2,
        config_type_ref = 3
    }

    public enum StatusTypeRef
    {
        DEFAULT = 1,
        CHECKLIST = 2,
        REVIEW = 3
    }

    public enum CheckListStatus
    {
        NOTSTARTED=0,
        INPROGRESS = 4,
        COMPLETED = 5,
        NOTAPPLICABLE = 6
    }

    public enum RFCReportParts
    {
        ReportHeader = 1,
        ReportDetail = 2,
        ReportFooter = 3,
        Rollout = 4,
        Rollback =5
    }

    public enum TypeRef
    {
        Default = 0,
        CheckList = 1
    }
}