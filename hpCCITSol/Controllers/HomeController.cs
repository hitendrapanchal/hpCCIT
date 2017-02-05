using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eTrackerSol.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult Contact()
        {
            return View("Contact");
        }

        public FileResult DownloadPresenation()
        {
            return File(Server.MapPath("~/Documents/" + "hpCCIT_Tool_v1.pptx"), "application/vnd.ms-powerpoint", "hpCCIT Tool Presentation v1.pptx");
        }
        
    }
}
