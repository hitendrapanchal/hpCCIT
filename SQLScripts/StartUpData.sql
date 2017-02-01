USE [hpCCITDB]

truncate table report_part_ref
GO
INSERT INTO [dbo].[report_part_ref] ([report_part_id],[report_part_nm],[report_part_type])  VALUES(1,'ReportHeader','RFC')
INSERT INTO [dbo].[report_part_ref] ([report_part_id],[report_part_nm],[report_part_type])  VALUES(2,'ReportDetail','RFC')
INSERT INTO [dbo].[report_part_ref] ([report_part_id],[report_part_nm],[report_part_type])  VALUES(3,'ReportFooter','RFC')
INSERT INTO [dbo].[report_part_ref] ([report_part_id],[report_part_nm],[report_part_type])  VALUES(4,'Rollout','RFC')
INSERT INTO [dbo].[report_part_ref] ([report_part_id],[report_part_nm],[report_part_type])  VALUES(5,'Rollback','RFC')
GO


truncate table status_type_ref
INSERT INTO [dbo].[status_type_ref] ([status_type_id] ,[status_type_nm]) VALUES (1,'DEFAULT')
INSERT INTO [dbo].[status_type_ref] ([status_type_id] ,[status_type_nm]) VALUES (2,'CHECKLIST')
INSERT INTO [dbo].[status_type_ref] ([status_type_id] ,[status_type_nm]) VALUES (3,'REVIEW')
GO


truncate table status_ref
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (0, 'NOTSTARTED',2)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (1, 'ACTIVE',1)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (2, 'INACTIVE',1)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (3, 'DELETED',1)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (4, 'INPROGRESS',2)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (5, 'COMPLETED',2)
INSERT INTO [dbo].[status_ref] ([status_id],[status_nm],[status_type_id]) VALUES (6, 'NOTAPPLICABLE',2)
GO


truncate table application_ref

INSERT INTO [dbo].[application_ref] ([application_nm]) VALUES ('Application1')
INSERT INTO [dbo].[application_ref] ([application_nm]) VALUES ('Application2')
INSERT INTO [dbo].[application_ref] ([application_nm]) VALUES ('Application3')
GO

truncate table deployment_environment_ref
INSERT INTO [dbo].[deployment_environment_ref] ([deployment_environment_id],[deployment_environment_nm]) VALUES (1,'DEV')
INSERT INTO [dbo].[deployment_environment_ref] ([deployment_environment_id],[deployment_environment_nm]) VALUES (2,'DEV_INT')
INSERT INTO [dbo].[deployment_environment_ref] ([deployment_environment_id],[deployment_environment_nm]) VALUES (3,'QA')
INSERT INTO [dbo].[deployment_environment_ref] ([deployment_environment_id],[deployment_environment_nm]) VALUES (4,'Production')
GO

truncate table deployment_mse_environment_ref

INSERT INTO [dbo].[deployment_mse_environment_ref] ([deployment_mse_environment_id], [deployment_mse_environment_nm]) VALUES (1, 'Environment-A')
INSERT INTO [dbo].[deployment_mse_environment_ref] ([deployment_mse_environment_id], [deployment_mse_environment_nm]) VALUES (2, 'Environment-B')
INSERT INTO [dbo].[deployment_mse_environment_ref] ([deployment_mse_environment_id], [deployment_mse_environment_nm]) VALUES (3, 'Staging1')
INSERT INTO [dbo].[deployment_mse_environment_ref] ([deployment_mse_environment_id], [deployment_mse_environment_nm]) VALUES (4, 'Staging2')


GO

truncate table deployment_type_ref

INSERT INTO [dbo].[deployment_type_ref]([deployment_type_nm],[is_smp_deployment],[is_jenkins_deployment],[is_manual_deployment],[is_other_deployment]) VALUES ('SMP UI Deployment', 1,0,0,0)
INSERT INTO [dbo].[deployment_type_ref]([deployment_type_nm],[is_smp_deployment],[is_jenkins_deployment],[is_manual_deployment],[is_other_deployment]) VALUES ('Jenkins UI', 0,1,0,0)
INSERT INTO [dbo].[deployment_type_ref]([deployment_type_nm],[is_smp_deployment],[is_jenkins_deployment],[is_manual_deployment],[is_other_deployment]) VALUES ('Manual Deployment', 0,0,1,0)
INSERT INTO [dbo].[deployment_type_ref]([deployment_type_nm],[is_smp_deployment],[is_jenkins_deployment],[is_manual_deployment],[is_other_deployment]) VALUES ('Trisha/Other Tools Deployment', 0,0,0,1)
GO

truncate table scope_ref

INSERT INTO [dbo].[scope_ref]([scope_nm],[is_dev_int],[is_qa],[is_production]) VALUES ('Full Scope',1,1,1)
INSERT INTO [dbo].[scope_ref]([scope_nm],[is_dev_int],[is_qa],[is_production]) VALUES ('Analysis',0,0,0)
INSERT INTO [dbo].[scope_ref]([scope_nm],[is_dev_int],[is_qa],[is_production]) VALUES ('Design Only',0,0,0)
INSERT INTO [dbo].[scope_ref]([scope_nm],[is_dev_int],[is_qa],[is_production]) VALUES ('Production Only',1,1,1)
INSERT INTO [dbo].[scope_ref]([scope_nm],[is_dev_int],[is_qa],[is_production]) VALUES ('SQA and Production',1,1,1)

GO


truncate table server_type_ref

INSERT INTO [dbo].[server_type_ref]([server_type_nm]) VALUES ('UI Servers')
INSERT INTO [dbo].[server_type_ref]([server_type_nm]) VALUES ('Component Servers')
INSERT INTO [dbo].[server_type_ref]([server_type_nm]) VALUES ('App Servers')
INSERT INTO [dbo].[server_type_ref]([server_type_nm]) VALUES ('Rule Servers')
INSERT INTO [dbo].[server_type_ref]([server_type_nm]) VALUES ('Data Servers')
GO

truncate table server_ref

INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (1,'ServerName1',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (1,'ServerName2',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (1,'ServerName3',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (1,'ServerName4',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (1,'ServerName5',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (2,'ServerName6',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (2,'ServerName7',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (3,'ServerName8',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (3,'ServerName9',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (4,'ServerName10',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (4,'ServerName11',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (5,'ServerName12',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (5,'ServerName13',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (6,'ServerName14',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (6,'ServerName15',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (7,'ServerName16',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (7,'ServerName17',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (8,'ServerName18',0)
INSERT INTO [dbo].[server_ref]([server_type_id],[server_nm],[is_dr]) VALUES (8,'ServerName19',0)

GO

truncate table config_type_ref
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('Web.Config')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('AppSettings.config')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('ServiceConfig.xml')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('Internal.resx')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('Codebase')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('RuleConfig.xml')
INSERT INTO [dbo].[config_type_ref] ([config_type_nm]) VALUES ('DB config')
GO

truncate table [dbo].[type_ref]
INSERT INTO [dbo].[type_ref] ([type_id],[type_nm]) VALUES(1, 'CheckList')
INSERT INTO [dbo].[type_ref] ([type_id],[type_nm]) VALUES(2, 'Development')
INSERT INTO [dbo].[type_ref] ([type_id],[type_nm]) VALUES(3, 'ProductionReadiness')
INSERT INTO [dbo].[type_ref] ([type_id],[type_nm]) VALUES(4, 'Validation')
GO


truncate table [dbo].[sub_type_ref]
INSERT INTO [dbo].[sub_type_ref]([sub_type_id],[sub_type_nm],[type_id]) VALUES(1,'IT Validation',1)
INSERT INTO [dbo].[sub_type_ref]([sub_type_id],[sub_type_nm],[type_id]) VALUES(2,'Development',1)
INSERT INTO [dbo].[sub_type_ref]([sub_type_id],[sub_type_nm],[type_id]) VALUES(3,'Testing',1)
GO

truncate table [dbo].[client_ref]
GO
INSERT INTO [dbo].[client_ref] ([client_nm])  
Select ('Myclient1') union all
Select ('Myclient2') union all
Select ('Myclient3') union all
Select ('Myclient4') union all
Select ('Myclient5') union all
Select ('Myclient6') union all
Select ('Myclient7') union all
Select ('Myclient8') union all
Select ('Myclient9') 

GO


truncate table [dbo].[api_type_ref]
GO
INSERT INTO [dbo].[api_type_ref] ([api_type_nm])  
Select ('TIBCO Service') union all
Select ('Google API') union all
Select ('SharePoint API') union all
Select ('Service API') union all
Select ('Other') 

GO