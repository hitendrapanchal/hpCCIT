using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace eTrackerSol.Controllers
{
    public class CheckListController : Controller
    {
        //
        // GET: /Report/

        public ActionResult Index()
        {

            return View("CheckListTemplatesIndex");
        }

        public ActionResult CheckList()
        {

            return View("CheckListIndex");
        }



        
    }
}
