export const LOGIN_PAGE = {
  EMAIL_INPUT_PLACEHOLDER: "Enter email address",
  PASSWORD_INPUT_PLACEHOLDER: "Enter password",
  EMAIL: "Email Address",
  PASSWORD: "Password",
  EMAIL_ERROR: "Must be a valid email",
  EMAIL_REQUIRED_MESSAGE: "Email is required",
  PASSWORD_REQUIRED_MESSAGE: "Password is required",
  LOGIN_BUTTON: "Login",
  REQUEST_BUTTON: "Request for access",
  FORGOT_PASSWORD: "Forgot Password?",
  SEND_REQUEST: "Send Request",
  OTP_DESC:"Please enter the OTP (One Time Password) sent to your register email id to complete your verification",
  NEW_PASSWORD:"New Password",
  CONFIRM_PASSWORD:"Confirm Password"
};

export const API_SUCCESS_MESSAGE = {
  FETCHED_SUCCESSFULLY: "Data fetched successfully",
  USER_CREATED: "User created successfully",
  DETAILS_UPDATED: "Details updated successfully",
  LOGGED_OUT: "Logged out successfully",
  OTP_SENT:"OTP sent successfully",
  PASSWORD_RESET:"Password reset successfully",
  OTP_VERIFY:"OTP verified successfully",
  UPDATED_SUCCESSFULLY: "Data updated successfully",
  DOWNLOADED_SUCCESSFULLY: "File downloaded successfully",
  DELETED_SUCCESSFULLY:"Deleted successfully",
  UPLOADED_SUCCESSFULLY:"Uploaded successfully",
  SECTOR_DELETED:"Sector deleted successfully",
  USER_DISABLED:"User access is disabled successfully",
  USER_ENABLED:"User access is enabled successfully",
  INDUSTRY_DELETED:"Industry deleted successfully",
  ROLE_DELETED:"Role deleted successfully",
  STANDARD_DELETED:"Standard deleted successfully",
};

export const API_ERROR_MESSAGE = {
  INVALID_PASSWORD: "Invalid Password",
  INTERNAL_SERVER_ERROR: "Internal server error",
  FILE_SIZE_200MB: "Total file size should not exceed 200MB.",
  PLEASE_SELECT_DOC_TYPE: "Please select a document type.",
  NO_FILE_SELECTED: "No file selected",
  INCORRECT_EMAIL:"Email Id is not valid",
  INVALID_OTP:"Invalid OTP",
  VERIFY_OTP:"Error occurred while verifying OTP.",
  CUSTOM_REGULATORY_SINGLE_FILE_ONLY : "You can upload only one Standard document",
  DOCUMENT_NOT_FOUND: "Please add Project documents to run the assessment",
  FAILED_TO_RUN_ASSESSMENT : "Failed to run assessment",
  PASSWORD_EXPIRED:"Your password is expired please try to reset it",

};

export const STORAGE_KEYS = {
  AUTH_INFO: "_AUTH_INFO",
  AUTH_TOKEN: "_AUTH_TOKEN",
  RESOURCE_PERMISSIONS: "RESOURCE_PERMISSIONS",
  USER_INFO: "USER_INFO",
  USER_SYSTEM_SETTINGS: "USER_SYSTEM_SETTINGS",
};

export const APP_ROLES = {
  MPH_ADMIN: "MPH_ADMIN",
  INTERNAL_DEVELOPER: "INTERNAL_DEVELOPER",
  EXTERNAL_DEVELOPER: "EXTERNAL_DEVELOPER",
  AFFILIATE_COMPLIANCE_MANAGER: "COMPLIANCE_MANAGER",
  DEVELOPER: "DEVELOPER",
};

export const USER_ROLES = {
  Super_Admin: "MPH_ADMIN",
  Admin: "AFFILIATE_ADMIN",
  IT_Support: "MPH_SUPPORT",
  Org_Owner: "ORG_OWNER",
  IT_Admin: "IT_ADMIN",
  ORGANIZATION_ADMIN: "Organization Admin",
};

export const COUNT_CARD_LABELS = Object.freeze({
  TOTAL_PROJECTS: "Total Projects",
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  SUCCESS: "Success",
  FAILED: "Failed",
  NO_OF_RUNS: "No. of runs",
});

export const LISTING_PAGE = Object.freeze({
  PROJECT_NAME: "Project Name",
  PROJECT_No: "Project No",
  NO_OF_RUNS: "No. of runs",
  INDUSTRY: "Industry",
  MAPPING_STANDARDS: "Mapping Standards",
  REGULATORY_SANTARDS: "Regulatory",
  START_DATE: "Created Date",
  LAST_RUN: "Last Run",
  STATUS: "Status",
  ACTION: "Action",
  INDEX: "Index",
  NAME: "Name",
  EMAIL: "Email ID",
  PHONE_NO: "Mobile No.",
  SECTOR: "Sector",
  INDUSTRY: "Industry",
  ORG_NAME: "Organization",
  PROFILE_URL: "Profile Link",
  CERTIFICATE_NAME: "Certificate Name",
  CERTIFICATE_SUBJECT: "Certificate Subject",
  ISSUER: "Issuer",
  DATE_OF_ISSUE: "Date of Issue",
  DATE_OF_EXPIRE: "Expires",
  ORG_NAME: "Organization Name",
  ORG_EMAIL:"Email ID",
  ORG_PRIMARY_EMAIL:"Primary Email ID",
  ORG_WEBSITE:"Website",
  ORG_ADDRESS:"Address",
  ROLE:"Role",
  DESCRIPTION:"Description",
  FILE_UPLOADED:"File Uploaded",
  PERMISSION_NAME:"Permission Name",
  PERMISSION_DESC:"Description",
  PERMISSION_CATEGORY: "Category",
  STANDARD_NAME:"Standard Name"
});

export const TAB_LABEL = Object.freeze({
  OVERVIEW: "Overview",
  SUMMARY_REPORT: "Summary Report",
  CHAT_AI: "Chat AI",
});

export const PROJECT_DETAIL_PAGE = Object.freeze({
  CURRENT_PROGRESS_STATUS: "Current Progress Status",
  UPLOADED_FILES: "Uploaded File Details",
  LAST_RUN_DETAILS: "Last Run Details",
  CHECKLIST_REPORT: "Checklist Report",
  ASSESSMENT_REPORT: "Assessment Report",
  HISTORY_DETAILS: "History Details",
});

export const STATUS = Object.freeze({
  DRAFT: "Draft",
  IN_PROGRESS: "In Progress",
  ACTIVE: "Active",
  FAILED: "Failed",
  SUCCESS: "Success",
  NOT_STARTED: "Not Started",
  VALID: "Valid",
  EXPIRED: "Expired",
});

export const BUTTON_LABEL = Object.freeze({
  DONE: "Done",
  FILTER: "Filter",
  SEARCH: "Search",
  RUN_PROJECT: "Run Assessment",
  RUN_CHECKLIST:"Run Checklist",
  SAVE_DRAFT: "Save as Draft",
  SAVE_PROJECT:"Save Project",
  CREATE_PROJECT: "Add New Project",
  VIEW: "View",
  UPLOAD_DOCUMENTS: "Upload Documents",
  CREATE_USER: "Add New User",
  UPLOAD_CERTIFICATE: "Upload Certificate",
  SUBMIT: "Submit",
  BACK: "Back",
  SKIP: "Skip",
  NEXT: "Next",
  FINISH: "Finish",
  CREATE_ORGANIZATION:"Add New Organization",
  LIST_VIEW:"List View",
  ADD_NEW:"Add New",
  CLOSE:"Close",
  UPDATE:"Update",
});

export const GENERIC_DATA_LABEL = Object.freeze({
  NO_DATA: "No Data Found",
});

export const FORM_LABEL = Object.freeze({
  CERTIFICATE_NAME: "Certificate Name",
  CERTIFICATE_SUBJECT: "Certificate Subject",
  ISSUER: "Issuer",
  ISSUE_EXPIRY_DATE: "Certificate Issue and Expiry date",
  FILE_UPLOAD: "File Upload",
  ISSUE_DATE: "Issue Date",
  EXPIRY_DATE: "Expiry Date",
  SEARCH: "Search",
  CERTIFICATE_UPLOAD: "Certificate Upload",
  DRAG_DROP_FILE: "Drag 'n' drop some files here, or click to select files",
  TOTAL_FILE_SIZE: "Total upload files size",
  PROJECT_DOCUMENT: "Project Document",
  // CUSTOM_REGULATORY: "Custom Regulatory",
  CUSTOM_REGULATORY: "Custom Standards",
  DOCUMENT_TYPE: "Document Type",
  SELECT_TYPE: "Select Type",
  PROJECT_NAME: "Project Name",
  PROJECT_NO: "Project No.",
  PROJECT_DESC: "Project Description",
  REGULATORY_STANDARDS: "Regulatory Standards",
  REGULATORY: "Regulatory",
  INVITE_MEMBERS: "Invite Team Members",
  DOCUMENT_UPLOAD: "Project Document Upload",
  DROP_HERE: "Drop here or",
  OPTIONAL: "Optional",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  EMAIL: "Email",
  PHONE: "Phone No.",
  STREET: "Street",
  CITY: "City",
  STATE: "State",
  COUNTRY: "Country",
  ZIP: "Zip",
  ORGANIZATION: "Organization",
  SECTOR: "Sector",
  INDUSTRY: "Industry",
  ROLE: "Role",
  ORG_NAME: "Organization Name",
  ORG_WEBSITE:"Website URL",
  ORG_LOGO:"Logo",
  ORG_EMAIL:"Organization Email ID",
  PRIMARY_CONTACT:"Primary Contact Details",
  SECONDARY_CONTACT:"Secondary Contact Details",
  SECTOR_NAME:"Sector Name",
  INDUSTRY_NAME: "Industry Name",
  ROLE_NAME:"Role Name",
  ROLE_DESC:"Description",
  STANDARD_NAME: "Standard Name",

});
export const STEPPER_LABEL = Object.freeze({
  PROJECT_CREATION: "Project Creation",
  PROJECT_DOCUMENT:"Project Document",
  STANDARD_DOCUMENT:"Regulatory Standards",
  CUSTOM_STANDARD_DOCUMENT: "Custom Standard Document",
  IN_PROGRESS: "In Progress",
  CHECKLIST_REPORT: "Checklist Report",
  ASSESSMENT_REPORT: "Assessment Report",
  FINAL_STEP: "Final Step",
  FINISH_STATUS: "finish",
  PROCESS_STATUS: "process",
  ERROR_STATUS: "error",
  PERSONAl_DETAILS: "Personal Detail",
  ADDRESS_DETAILS: "Address Details",
  ORG_DETAILS: "Organization Details",
  ORG_CONTACT:"Contact Details"
});

export const FILE_TYPE = Object.freeze({
  IMAGE: "image",
  APPLICATION: "application",
  TEXT: "text",
  APPLICATION_PDF: "application/pdf",
  APPLICATION_EXCEL: "application/vnd.ms-excel",
  APPLICATION_SHEET:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  APPLICATION_WORD: "application/msword",
  APPLICATION_OFFICE:"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  TEXT_CSV: "text/csv",
});

export const HEADING = Object.freeze({
  CREATE_NEW_PROJECT: "Create a New Project",
  CREATE_USER: "Create User",
  CREATE_ORG:"Create Organization",
  EDIT_PROJECT:"Edit Project Details",
  INVITE_USERS:"Invite users",
});

export const CLOSE_ALERT_DESCRIPTION =
  "Closing this tab will not save your changes, do you want to proceed?";

export const LANDING_PAGE = Object.freeze({
  HEADING: "It's time to take control of your healthcare!",
  SUBHEADING: "Please log in to continue to MPH portal",
  BTN_TEXT_LOGIN: "Log in",
  BTN_TEXT_SIGNUP: "Sign up",
});

export const RESOURCE_NAMES = {
  ORGANIZATIONS: "ORGANIZATIONS",
  ORG_DETAILS: "ORG_DETAILS",
  ORG_PARTNERS: "ORG_PARTNERS",
  ORG_LOBS: "ORG_LOBS",
  ORG_USERS: "ORG_USERS",
  ORG_ALERTS: "ORG_ALERTS",
  ORG_REPORTS: "ORG_REPORTS",
  ORG_APPROVER: "ORG_APPROVER",
  ADMIN_SETTINGS: "ADMIN_SETTINGS",
  DEV_DASHBOARD: "DEV_DASHBOARD",
  DEV_APPLICATIONS: "DEV_APPLICATIONS",
  DEV_APPLICATION_CRUD: "DEV_APPLICATION_CRUD",
  DEV_APPLICATION_APPROVER: "DEV_APPLICATION_APPROVER",
  MEMBERS: "MEMBERS",
  DEV_API_OVERVIEW: "DEV_API_OVERVIEW",
  DEV_SANDBOX: "DEV_SANDBOX",
  DEV_SETTINGS: "DEV_SETTINGS",
  APPLICATION_CRUD: "APPLICATION_CRUD",
  DEV_PRICELIST: "DEV_PRICELIST",
  MEDICAL_PAGE: "MEDICAL_PAGE",
  RULES: "RULES",
  APPLICATION: "APPLICATION",
  CONFIG: "CONFIG",
  CMDE: "CMDE",
};

export const PRICELIST_FILE_NAME = [
  {
    label: "In-Network Rate",
    value: "in-network-rate",
  },
  {
    label: "Out of Network",
    value: "out-of-network",
  },
  {
    label: "Prescription Drug",
    value: "prescription-drug",
  },
];

export const RESOURCE_TYPES = Object.freeze({
  1: "Coverage",
  2: "InsurancePlan",
  3: "Organization",
  4: "Practitioner",
  5: "Patient",
  6: "Device",
  7: "Encounter",
  8: "AllergyIntolerance",
  9: "CarePlan",
  10: "CareTeam",
  11: "Condition",
  12: "Goal",
  13: "Procedure",
  14: "Observation",
  15: "DiagnosticReport",
  16: "Claim",
  17: "ExplanationOfBenefit",
  18: "Medication",
  19: "MedicationRequest",
  20: "MedicationKnowledge",
  21: "Immunization",
  22: "Consent",
  23: "DocumentReference",
});

export const RESOURCES = [
  "Coverage",
  "InsurancePlan",
  "Organization",
  "Practitioner",
  "Patient",
  "Device",
  "Encounter",
  "AllergyIntolerance",
  "CarePlan",
  "CareTeam",
  "Condition",
  "Goal",
  "Procedure",
  "Observation",
  "DiagnosticReport",
  "Claim",
  "ExplanationOfBenefit",
  "Medication",
  "MedicationRequest",
  "MedicationKnowledge",
  "Immunization",
  "Consent",
  "DocumentReference",
];

export const FILTER_LIST = [
  { key: 0, value: "Consent status" },
  { key: 1, value: "Affiliate" },
  { key: 2, value: "LOB" },
  { key: 3, value: "Expires on" },
];

export const BUTTON_TITLES = {
  CANCEL: `Cancel`,
  APPLY_FILTERS: `Apply filters`,
  REMOVE: "Remove",
  CREATE_ROLE: "Create a new role",
  PROCEED: "Proceed",
};

export const statusFilterMenuItems = [
  { label: "All", value: "all" },
  { label: "Pending", value: "Pending" },
  { label: "Active", value: "Active" },
  { label: "Cancelled", value: "Cancelled" },
  { label: "Not initiated", value: "Notinitiated" },
  { label: "Expired", value: "Expired" },
  { label: "Terminated", value: "Terminated" },
];

export const PERMISSION_CODES = {
  READ: "P004",
  CREATE: "P001",
  DELETE: "P002",
  APPROVE: "P003",
};
