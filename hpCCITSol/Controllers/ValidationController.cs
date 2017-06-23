using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using eTrackerSol.Common;

namespace eTrackerSol.Controllers
{
    public class ValidationController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ConfigVault()
        {
            return View("ConfigVault");
        }
    }
}
