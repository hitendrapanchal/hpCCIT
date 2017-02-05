using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using eTrackerSol.Common;

namespace eTrackerSol.Controllers
{
    public class SettingsController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ImportWorkItems()
        {
            return View("ImportWorkItems");
        }
        public ActionResult ImportMasterData()
        {
            return View("ImportMasterData");
        }
        public ActionResult FileManager()
        {
            return View("FileManager");
        }
        public ActionResult FlushCache()
        {
            try
            {
                GlobalCachingProvider.Instance.RemoveAll();
                ViewBag.Message = "Successfully flushed the cache.";
            }
            catch (Exception ex)
            {
                ViewBag.Message = "Error occured while flushing the cache. " + ex.Message;
            }
            return View("Index");
        }
    }
}
