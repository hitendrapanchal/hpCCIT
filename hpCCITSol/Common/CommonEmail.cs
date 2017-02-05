using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Net.Mail;
using System.Net;
using System.Configuration;

namespace eTrackerSol.Common
{
    public class CommonEmail
    {


        #region SMTP Email
        SmtpClient smtpclient = new SmtpClient();
        public void SendEmail(string emailTo, string emailSubject, string emailbody , Attachment[] attachments )
        {
            try
            {
                MailMessage mail = new MailMessage();
                mail.From = new MailAddress(AppSettingValue("smtpCredentialsUser"));

                string[] emailIDs = emailTo.Split(';');
                foreach (string emailid in emailIDs)
                {
                    mail.To.Add(emailid);
                }

                foreach (Attachment attach in attachments)
                {
                    mail.Attachments.Add(attach);
                }
                mail.Subject = (string.IsNullOrEmpty(emailSubject) ? "Subject is not provided" : emailSubject);
                mail.Body = emailbody;

                smtpclient.Send(mail);
            }
            catch (Exception ex)
            {
                throw (ex);
            }

        }

        public void ConfigureSMTPClient(string smtpHost, int smtpPort,SmtpDeliveryMethod smtpDeliveryMetho, bool smtpEnableSsl, bool smtpUseDefaultCredentials, NetworkCredential smtpCredentials  )
        {
            try
            {
                smtpclient.Host = smtpHost; // "smtp.gmail.com";
                smtpclient.Port = 587;  //465; //587;
                smtpclient.DeliveryMethod = smtpDeliveryMetho; //System.Net.Mail.SmtpDeliveryMethod.Network;
                smtpclient.EnableSsl = smtpEnableSsl; //true;
                smtpclient.UseDefaultCredentials = smtpUseDefaultCredentials; // false;
                smtpclient.Credentials = smtpCredentials; // new System.Net.NetworkCredential("from@gmail.com", "xxxpasword");
            }
            catch (Exception ex)
            {
                throw (ex);
            }
        }

        public void ConfigureDefaultSMTPclient()
        {
            try
            {
                string smtpHost = AppSettingValue("smtpHost");
                int smtpPort = Convert.ToInt32(AppSettingValue("smtpPort"));
                SmtpDeliveryMethod smtpDeliveryMethod = SmtpDeliveryMethod.Network;
                bool smtpEnableSsl = Convert.ToBoolean(AppSettingValue("smtpEnableSsl"));
                bool smtpUseDefaultCredentials = Convert.ToBoolean(AppSettingValue("smtpUseDefaultCredentials"));
                string smtpCredentialsUser = AppSettingValue("smtpCredentialsUser");
                string smtpCredentialsPassword = AppSettingValue("smtpCredentialsPassword");
                NetworkCredential smtpCredentials = new NetworkCredential(smtpCredentialsUser, smtpCredentialsPassword);
                ConfigureSMTPClient(smtpHost, smtpPort, smtpDeliveryMethod, smtpEnableSsl, smtpUseDefaultCredentials, smtpCredentials);
            }
            catch (Exception ex)
            {
                throw (ex);
            }

        }

        #endregion

        public string AppSettingValue(string key)
        {
            if (!string.IsNullOrEmpty(ConfigurationManager.AppSettings[key]))
            {
                return ConfigurationManager.AppSettings[key].ToString();
            }
            else
                return string.Empty;
        }


    }
}