USE [hpCCITDB]
GO

/****** Object:  Table [dbo].[config_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[config_type_ref](
	[config_type_id] [smallint] IDENTITY(1,1) NOT NULL,
	[config_type_nm] [nvarchar](200) NULL,
	[is_codebase] [bit] NULL,
 CONSTRAINT [PK_config_type_ref] PRIMARY KEY CLUSTERED 
(
	[config_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[application_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[application_ref](
	[application_id] [smallint] IDENTITY(1,1) NOT NULL,
	[application_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_application_ref] PRIMARY KEY CLUSTERED 
(
	[application_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[scope_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[scope_ref](
	[scope_id] [smallint] IDENTITY(1,1) NOT NULL,
	[scope_nm] [nvarchar](200) NULL,
	[is_dev_int] [bit] NULL,
	[is_qa] [bit] NULL,
	[is_production] [bit] NULL,
 CONSTRAINT [PK_scope_ref] PRIMARY KEY CLUSTERED 
(
	[scope_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[sprint_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[sprint_ref](
	[sprint_id] [smallint] IDENTITY(1,1) NOT NULL,
	[sprint_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_sprint_ref] PRIMARY KEY CLUSTERED 
(
	[sprint_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[release_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[release_ref](
	[release_id] [smallint] IDENTITY(1,1) NOT NULL,
	[release_nm] [nvarchar](200) NOT NULL,
	[release_descr] [nvarchar](1000) NULL,
	[release_dt] [datetime] NULL,
	[release_notes_status_id] [smallint] NULL,
	[it_validation_status_id] [smallint] NULL,
	[status_id] [smallint] NULL,
	[comments] [nvarchar](1000) NULL,
	[created_dtm] [datetime] NULL,
	[created_usr_id] [nvarchar](200) NULL,
	[modified_dtm] [datetime] NULL,
	[modified_usr_id] [nvarchar](200) NULL,
 CONSTRAINT [PK_release_ref] PRIMARY KEY CLUSTERED 
(
	[release_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[work_item_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[work_item_ref](
	[work_item_id] [int] IDENTITY(1,1) NOT NULL,
	[work_item_ext_id] [nvarchar](100) NULL,
	[work_item_title] [nvarchar](1000) NULL,
	[sprint_id] [smallint] NULL,
	[scope_id] [smallint] NULL,
	[comments] [nvarchar](1000) NULL,
	[created_dtm] [datetime] NULL,
	[created_usr_id] [nvarchar](200) NULL,
	[modified_dtm] [datetime] NULL,
	[modified_usr_id] [nvarchar](200) NULL,
 CONSTRAINT [PK_work_item_ref] PRIMARY KEY CLUSTERED 
(
	[work_item_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[release_work_item_xref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[release_work_item_xref](
	[release_work_item_id] [int] IDENTITY(1,1) NOT NULL,
	[release_id] [smallint] NULL,
	[work_item_id] [int] NULL,
	[biz_validation_sql] [ntext] NULL,
	[biz_validation_comments] [ntext] NULL,
	[is_biz_validation_required] [bit] NULL,
	[biz_validator_nm] [nvarchar](200) NULL,
	[biz_validation_status] [tinyint] NULL,
 CONSTRAINT [PK_release_work_item_xref] PRIMARY KEY CLUSTERED 
(
	[release_work_item_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[release_sprint_xref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[release_sprint_xref](
	[release_sprint_id] [int] IDENTITY(1,1) NOT NULL,
	[release_id] [smallint] NULL,
	[sprint_id] [smallint] NULL,
 CONSTRAINT [PK_release_sprint_xref] PRIMARY KEY CLUSTERED 
(
	[release_sprint_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[rfc_template_application_xref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[rfc_template_application_xref](
	[rfc_template_application_id] [smallint] IDENTITY(1,1) NOT NULL,
	[rfc_template_id] [smallint] NULL,
	[application_id] [smallint] NULL,
	[pdf_file_name] [nvarchar](200) NULL,
 CONSTRAINT [PK_rfc_template_application_xref] PRIMARY KEY CLUSTERED 
(
	[rfc_template_application_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[deployment_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[deployment_type_ref](
	[deployment_type_id] [smallint] IDENTITY(1,1) NOT NULL,
	[deployment_type_nm] [nvarchar](200) NULL,
	[is_smp_deployment] [bit] NULL,
	[is_jenkins_deployment] [bit] NULL,
	[is_manual_deployment] [bit] NULL,
	[is_other_deployment] [bit] NULL,
 CONSTRAINT [PK_deployment_type_ref] PRIMARY KEY CLUSTERED 
(
	[deployment_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[server_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[server_type_ref](
	[server_type_id] [smallint] IDENTITY(1,1) NOT NULL,
	[server_type_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_server_type_ref] PRIMARY KEY CLUSTERED 
(
	[server_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[server_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[server_ref](
	[server_id] [smallint] IDENTITY(1,1) NOT NULL,
	[server_type_id] [smallint] NOT NULL,
	[server_nm] [nvarchar](200) NULL,
	[is_dr] [bit] NULL,
 CONSTRAINT [PK_server_ref] PRIMARY KEY CLUSTERED 
(
	[server_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[checklist_template_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[checklist_template_ref](
	[checklist_template_id] [smallint] IDENTITY(1,1) NOT NULL,
	[checklist_template_nm] [nvarchar](1000) NULL,
	[sub_type_id] [smallint] NULL,
 CONSTRAINT [PK_checklist_template_ref] PRIMARY KEY CLUSTERED 
(
	[checklist_template_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[checklist_template_xref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[checklist_template_xref](
	[checklist_template_xref_id] [int] IDENTITY(1,1) NOT NULL,
	[checklist_template_id] [smallint] NOT NULL,
	[checklist_id] [int] NOT NULL,
	[powershell_script] [ntext] NULL,
	[powershell_script_timedout] [int] NULL,
	[priority_order] [smallint] NULL,
 CONSTRAINT [PK_checklist_template_xref] PRIMARY KEY CLUSTERED 
(
	[checklist_template_xref_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[status_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[status_type_ref](
	[status_type_id] [tinyint] NOT NULL,
	[status_type_nm] [nvarchar](100) NULL,
 CONSTRAINT [PK_status_type_ref] PRIMARY KEY CLUSTERED 
(
	[status_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[status_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[status_ref](
	[status_id] [smallint] NOT NULL,
	[status_nm] [nvarchar](200) NULL,
	[status_type_id] [tinyint] NULL,
 CONSTRAINT [PK_status_ref] PRIMARY KEY CLUSTERED 
(
	[status_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[report_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[report_ref](
	[report_id] [smallint] IDENTITY(1,1) NOT NULL,
	[report_nm] [nvarchar](500) NULL,
	[report_descr] [nvarchar](1000) NULL,
	[db_connectionstr] [nvarchar](1000) NULL,
	[sql_script] [ntext] NULL,
	[is_scheduling] [bit] NULL,
	[scheduler_interval_minutes] [smallint] NULL,
	[scheduler_output_type] [tinyint] NULL,
	[scheduler_email_ids] [ntext] NULL,
	[scheduler_last_executed] [datetime] NULL,
	[comments] [ntext] NULL,
 CONSTRAINT [PK_rpt_ref] PRIMARY KEY CLUSTERED 
(
	[report_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[deployment_environment_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[deployment_environment_ref](
	[deployment_environment_id] [tinyint] NOT NULL,
	[deployment_environment_nm] [nvarchar](500) NULL,
 CONSTRAINT [PK_deployment_environment_ref] PRIMARY KEY CLUSTERED 
(
	[deployment_environment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[deployment_mse_environment_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[deployment_mse_environment_ref](
	[deployment_mse_environment_id] [tinyint] NOT NULL,
	[deployment_mse_environment_nm] [nvarchar](500) NULL,
 CONSTRAINT [PK_deployment_mse_environment_ref] PRIMARY KEY CLUSTERED 
(
	[deployment_mse_environment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[report_part_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[report_part_ref](
	[report_part_id] [tinyint] NOT NULL,
	[report_part_nm] [nvarchar](200) NULL,
	[report_part_type] [nvarchar](100) NULL,
 CONSTRAINT [PK_report_part_ref] PRIMARY KEY CLUSTERED 
(
	[report_part_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[rfc_template_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[rfc_template_ref](
	[rfc_template_id] [smallint] IDENTITY(1,1) NOT NULL,
	[rfc_template_nm] [nvarchar](1000) NULL,
	[rfc_template_descr] [nvarchar](max) NULL,
	[deployment_type_id] [smallint] NULL,
	[server_type_id] [smallint] NULL,
	[deployment_environment_id] [tinyint] NULL,
	[deployment_mse_environment_id] [tinyint] NULL,
	[rfc_template_filename] [nvarchar](200) NULL,
 CONSTRAINT [PK_rfc_template_ref] PRIMARY KEY CLUSTERED 
(
	[rfc_template_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[sub_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[sub_type_ref](
	[sub_type_id] [smallint] NOT NULL,
	[sub_type_nm] [nvarchar](200) NULL,
	[type_id] [smallint] NULL,
 CONSTRAINT [PK_sub_type_ref] PRIMARY KEY CLUSTERED 
(
	[sub_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[type_ref](
	[type_id] [smallint] NOT NULL,
	[type_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_type_ref] PRIMARY KEY CLUSTERED 
(
	[type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[checklist_action_xref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[checklist_action_xref](
	[checklist_action_xref_id] [int] IDENTITY(1,1) NOT NULL,
	[checklist_action_id] [int] NULL,
	[checklist_id] [int] NOT NULL,
	[status_id] [smallint] NULL,
	[powershell_script] [ntext] NULL,
	[powershell_script_execution_comments] [ntext] NULL,
	[powershell_script_timedout] [int] NULL,
	[priority_order] [smallint] NULL,
	[comments] [ntext] NULL,
 CONSTRAINT [PK_checklist_action_xref] PRIMARY KEY CLUSTERED 
(
	[checklist_action_xref_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[checklist_action_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[checklist_action_ref](
	[checklist_action_id] [int] IDENTITY(1,1) NOT NULL,
	[checklist_action_nm] [nvarchar](1000) NULL,
	[checklist_template_id] [smallint] NULL,
	[sub_type_id] [smallint] NULL,
	[comments] [ntext] NULL,
	[created_dtm] [datetime] NULL,
	[created_usr_id] [nvarchar](200) NULL,
	[modified_dtm] [datetime] NULL,
	[modified_usr_id] [nvarchar](200) NULL,
 CONSTRAINT [PK_checklist_action_ref] PRIMARY KEY CLUSTERED 
(
	[checklist_action_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[rfc_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[rfc_ref](
	[rfc_id] [int] IDENTITY(1,1) NOT NULL,
	[rfc_nm] [nvarchar](200) NULL,
	[rfc_descr] [nvarchar](1000) NULL,
	[rfc_number] [nvarchar](100) NULL,
	[release_id] [smallint] NULL,
	[rfc_template_id] [smallint] NULL,
	[deployment_type_id] [smallint] NULL,
	[server_type_id] [smallint] NULL,
	[deployment_environment_id] [tinyint] NULL,
	[deployment_mse_environment_id] [tinyint] NULL,
	[rfc_template_filename] [nvarchar](200) NULL,
	[comments] [ntext] NULL,
 CONSTRAINT [PK_rfc_ref] PRIMARY KEY CLUSTERED 
(
	[rfc_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[rfc_template_detail_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[rfc_template_detail_ref](
	[rfc_template_detail_id] [smallint] IDENTITY(1,1) NOT NULL,
	[rfc_template_id] [smallint] NULL,
	[rfc_report_part_id] [tinyint] NULL,
	[rfc_template_detail_key] [nvarchar](30) NULL,
	[rfc_template_detail_nm] [ntext] NULL,
 CONSTRAINT [PK_rfc_template_detail_ref] PRIMARY KEY CLUSTERED 
(
	[rfc_template_detail_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[rfc_detail_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[rfc_detail_ref](
	[rfc_detail_id] [int] IDENTITY(1,1) NOT NULL,
	[rfc_id] [int] NULL,
	[rfc_report_part_id] [tinyint] NULL,
	[rfc_detail_key] [nvarchar](30) NULL,
	[rfc_detail_nm] [ntext] NULL,
 CONSTRAINT [PK_rfc_detail_ref] PRIMARY KEY CLUSTERED 
(
	[rfc_detail_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[client_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[client_ref](
	[client_id] [smallint] IDENTITY(1,1) NOT NULL,
	[client_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_client_ref] PRIMARY KEY CLUSTERED 
(
	[client_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[api_type_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[api_type_ref](
	[api_type_id] [smallint] IDENTITY(1,1) NOT NULL,
	[api_type_nm] [nvarchar](200) NULL,
 CONSTRAINT [PK_api_type_ref] PRIMARY KEY CLUSTERED 
(
	[api_type_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[api_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[api_ref](
	[api_id] [int] IDENTITY(1,1) NOT NULL,
	[api_name] [nvarchar](500) NULL,
	[api_type_id] [smallint] NULL,
	[client_id] [smallint] NULL,
	[application_id] [smallint] NULL,
	[api_dev_url] [nvarchar](200) NULL,
	[api_dev_version] [nvarchar](10) NULL,
	[api_dev_metadata] [nvarchar](1000) NULL,
	[api_dev_int_url] [nvarchar](200) NULL,
	[api_dev_int_version] [nvarchar](10) NULL,
	[api_dev_int_metadata] [nvarchar](1000) NULL,
	[api_qa_url] [nvarchar](200) NULL,
	[api_qa_version] [nvarchar](10) NULL,
	[api_qa_metadata] [nvarchar](1000) NULL,
	[api_prod_url] [nvarchar](200) NULL,
	[api_prod_version] [nvarchar](10) NULL,
	[api_prod_metadata] [nvarchar](1000) NULL,
	[api_metadata] [nvarchar](1000) NULL,
	[api_comments] [nvarchar](500) NULL,
 CONSTRAINT [PK_api_ref] PRIMARY KEY CLUSTERED 
(
	[api_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

/****** Object:  Table [dbo].[checklist_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[checklist_ref](
	[checklist_id] [int] IDENTITY(1,1) NOT NULL,
	[checklist_nm] [nvarchar](1000) NULL,
	[sub_type_id] [smallint] NULL,
	[default_powershell_script] [ntext] NULL,
	[default_powershell_script_timedout] [int] NULL,
 CONSTRAINT [PK_checklist_ref] PRIMARY KEY CLUSTERED 
(
	[checklist_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[inventory_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[inventory_ref](
	[inventory_id] [smallint] IDENTITY(1,1) NOT NULL,
	[inventory_nm] [nvarchar](200) NULL,
	[deployment_environment_id] [tinyint] NULL,
	[server_type_id] [smallint] NULL,
	[deployment_mse_environment_id] [tinyint] NULL,
	[application_id] [smallint] NULL,
	[port_number] [nvarchar](20) NULL,
	[is_https] [bit] NULL,
	[website_nm] [nvarchar](100) NULL,
	[virtual_directory] [nvarchar](100) NULL,
	[physical_path] [nvarchar](200) NULL,
	[validation_interface] [nvarchar](200) NULL,
	[auto_validation_url] [nvarchar](300) NULL,
	[gtm_name] [nvarchar](300) NULL,
	[vip_name] [nvarchar](300) NULL,
	[metadata] [nvarchar](1000) NULL,
	[comments] [ntext] NULL,
 CONSTRAINT [PK_inventory_ref] PRIMARY KEY CLUSTERED 
(
	[inventory_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

/****** Object:  Table [dbo].[configuration_ref]    Script Date: 01-02-2017 8:50:30 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[configuration_ref](
	[config_id] [int] IDENTITY(1,1) NOT NULL,
	[config_nm] [nvarchar](1000) NULL,
	[config_key] [nvarchar](1000) NULL,
	[config_dev_value] [ntext] NULL,
	[config_dev_int_value] [ntext] NULL,
	[config_qa_value] [ntext] NULL,
	[config_prod_value] [ntext] NULL,
	[is_pdf] [bit] NULL,
	[pdfaction] [tinyint] NULL,
	[work_item_id] [int] NULL,
	[config_type_id] [smallint] NULL,
	[config_status_id] [smallint] NULL,
	[application_id] [smallint] NULL,
	[comments] [ntext] NULL,
	[created_dtm] [datetime] NULL,
	[created_usr_id] [nvarchar](200) NULL,
	[modified_dtm] [datetime] NULL,
	[modified_usr_id] [nvarchar](200) NULL,
 CONSTRAINT [PK_configuration_ref] PRIMARY KEY CLUSTERED 
(
	[config_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Config Type Name' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'config_type_ref', @level2type=N'COLUMN',@level2name=N'config_type_nm'
GO

EXEC sys.sp_addextendedproperty @name=N'MS_Description', @value=N'Config Type Name' , @level0type=N'SCHEMA',@level0name=N'dbo', @level1type=N'TABLE',@level1name=N'api_type_ref', @level2type=N'COLUMN',@level2name=N'api_type_nm'
GO

