import {useAppSelector} from '../Components/hooks';
import {
  Auth_docType,
  MLA_docType,
  whatsapp_broadCast_docType,
  whatsapp_chat_docType,
  whatsapp_chat_mobile_docType,
  whatsapp_chat_smarty_flow_docType1,
  whatsapp_chat_task_docType,
  whatsapp_chat_wa_task_management_docType,
} from '../Config/docType';

export const setLocalHttpsInDomain = 'https://';

export const useApiURLs = () => {
  const selectedDomain = useAppSelector(
    state => state.domains?.selectedDomain?.domain,
  );

  const getApiURL = endpoint =>
    `${selectedDomain}${whatsapp_chat_docType}${endpoint}`;
  const getApiAuthURL = endpoint =>
    `${selectedDomain}${Auth_docType}${endpoint}`;
  const getApiURLMobile = endpoint =>
    `${selectedDomain}${whatsapp_chat_mobile_docType}${endpoint}`;
  const getApiURLTaskManagement = endpoint =>
    `${selectedDomain}${whatsapp_chat_wa_task_management_docType}${endpoint}`;
  const getApiURLSmartFlow = endpoint =>
    `${selectedDomain}${whatsapp_chat_smarty_flow_docType1}${endpoint}`;
  const getApiURLTASK = endpoint =>
    `${selectedDomain}${whatsapp_chat_task_docType}${endpoint}`;

  const getApiBroadCastUrl = endpoint =>
    `${selectedDomain}${whatsapp_broadCast_docType}${endpoint}`;

  return {
    getApiURL,
    getApiAuthURL,
    getApiURLMobile,
    getApiURLTaskManagement,
    getApiURLSmartFlow,
    getApiURLTASK,
    getApiBroadCastUrl,
    USER_LOGIN: getApiAuthURL('app_login'),
    GET_WHATSAPP_MESSAGE: getApiURL('get_whatsapp_message_with_pagination'),
    GET_CHAT_WITH_WHATSAPP_NUMBER: getApiURL('get_chat_with_whatsapp_number'),
    SEND_OUTGONIG_TEXT_MESSAGE: getApiURL('send_outgoing_text_message'),
    SEND_OUTGONIG_MEDIA: getApiURL('send_outgoing_media_message'),
    GET_WHATSAPP_TEMPLATES: getApiURL('get_whatsapp_templates'),
    GET_UPLOADED_MEDIA: getApiURL('get_uploaded_media'),
    SEND_TEMPLATE: getApiURL('send_template'),
    SEND_TEMPLATE_TO_MULTIPLE_NUMBERS: getApiURL(
      'send_template_to_multiple_numbers',
    ),
    GET_WHATSAPP_MESSAGE_LIST_KEYWORD_MESSAGE: getApiURL(
      'list_whatsapp_keyword_messages',
    ),
    GET_WHATSAPP_MESSAGE_LIST_KEYWORD_FLOW: getApiURL('list_whatsapp_flows'),
    GET_WHATSAPP_MESSAGE_LIST_INTERACTIVE_MESSGAE: getApiURL(
      'list_whatsapp_interactive_messages',
    ),
    GET_WHATSAPP_MESSAGE_LIST_OPTION_MESSAGE: getApiURL(
      'list_whatsapp_option_messages',
    ),
    SEND_WHATSAPP_KEYWORD_MESSAGE: getApiURL('send_keyword_message'),
    MARK_ALL_MESSGAE_AS_READ: getApiURL('mark_all_message_read'),
    SEARCH_MESSAGE: getApiURL('search_whatsapp_message'),
    DELETE_CHAT: getApiURL('delete_chats'),
    DELETE_CONTACT: getApiURL('delete_contacts'),
    DELETE_ALL_CHAT: getApiURL('delete_all_chats'),

    // mobile
    GET_WHATSAPP_FLOW_DATA: getApiURLMobile('get_whatsapp_flow_data'),
    GET_WHATSAPP_CONTACTS: getApiURLMobile('get_contacts'),
    GET_WHATSAPP_CONTACT_CATEGORY: getApiURLMobile('get_contact_category'),
    GET_WHATSAPP_CONTACT_DETAILS: getApiURLMobile('get_contact_details'),
    CREATE_WHATSAPP_CONTACT: getApiURLMobile('create_contact'),
    SEARCH_CONTACT: getApiURLMobile('search_contact'),

    // task management
    GET_TODAY_TASK: getApiURLTaskManagement('get_todays_tasks'),
    GET_YESTERDAY_TASK: getApiURLTaskManagement('get_yesterdays_tasks'),
    GET_THIS_WEEKS_TASK: getApiURLTaskManagement('get_this_weeks_tasks'),
    GET_LAST_WEEKS_TASK: getApiURLTaskManagement('get_last_weeks_tasks'),
    GET_THIS_MONTHS_TASK: getApiURLTaskManagement('get_this_months_tasks'),
    GET_LAST_MONTHS_TASK: getApiURLTaskManagement('get_last_months_tasks'),
    GET_THIS_YEARS_TASK: getApiURLTaskManagement('get_this_years_tasks'),
    GET_ALL_TIME_TASK: getApiURLTaskManagement('get_all_tasks'),

    // smart flow
    GET_FLOW_COMPLETE_JSON: getApiURLSmartFlow('flow_response_json'),
    GET_FLOW_IN_COMPLETE_JSON: getApiURLSmartFlow('flow_incomplete'),

    // task
    GET_TASK_CATEGORY: getApiURLTASK('get_category'),
    GET_TASK_FREQUENCY: getApiURLTASK('get_frequency'),
    GET_TASK_HOUR: getApiURLTASK('get_start_hour'),
    GET_TASK_MINUTES: getApiURLTASK('get_start_minutes'),
    GET_TASK_EXPECTED_TIME: getApiURLTASK('get_expected_time_options'),
    GET_TASK_PRIORITY: getApiURLTASK('get_priority'),
    GET_TASK_IMPORTANCE: getApiURLTASK('get_importance'),
    GET_TASK_SELECT_TEAM_MEMBER: getApiURLTASK('get_user'),
    GET_TASK_MONTH: getApiURLTASK('get_month_options'),
    GET_TASK_DAY: getApiURLTASK('get_day_options'),
    GET_TASK_DATE_OF_MONTH: getApiURLTASK('get_date_options'),
    CREATE_REPEAT_TASK: getApiURLTASK('create_repeat_task'),
    CREATE_TASK: getApiURLTASK('create_task'),
    UPDATE_TASK_STATUS: getApiURLTASK('update_task_status'),
    GET_PENDING_TASK_ASSIGNED_BY_ME: getApiURLTASK(
      'get_pending_task_assigned_by_me',
    ),
    GET_PENDING_TASK_ASSIGNED_TO_ME: getApiURLTASK(
      'get_pending_task_assigned_to_me',
    ),
    GET_OVERDUE_TASK_ASSIGNED_BY_ME: getApiURLTASK(
      'get_overdue_task_assigned_by_me',
    ),
    GET_OVERDUE_TASK_ASSIGNED_TO_ME: getApiURLTASK(
      'get_overdue_task_assigned_to_me',
    ),
    GET_COMPLETED_TASK_ASSIGNED_BY_ME: getApiURLTASK(
      'get_completed_task_assigned_by_me',
    ),
    GET_COMPLETED_TASK_ASSIGNED_TO_ME: getApiURLTASK(
      'get_completed_task_assigned_to_me',
    ),
    GET_TASK_COMMENT: getApiURLTASK('get_task_comments'),
    GET_TASK_STATUS: getApiURLTASK('get_task_status'),
    CHANGE_TASK_STATUS: getApiURLTASK('change_task_status'),
    ATTACH_FILE_TO_TASK: getApiURLTASK('attach_file_to_task'),
    GET_FILE_ATTACHMENT_TO_TASK: getApiURLTASK('get_files_attached_to_task'),
    SEND_COMMENTS_TO_TASK: getApiURLTASK('add_comments_to_task'),

    // broadCast
    GET_BROADCAST_GROUP: getApiBroadCastUrl('get_broadcast_groups'),
    GET_BROADCAST_GROUP_DETAILS: getApiBroadCastUrl(
      'get_broadcast_group_detail',
    ),
    CREATE_NEW_GROUP: getApiBroadCastUrl('create_new_group'),
    ADD_MEMBER_IN_GROUP: getApiBroadCastUrl('add_contact_to_broadcast_group'),
    GET_CRITERIA: getApiBroadCastUrl('get_criteria'),
    GET_OPERATOR: getApiBroadCastUrl('get_operator'),
    GET_LOGICAL_OPERATOR: getApiBroadCastUrl('get_logical_operator'),
    GET_SENT_BROADCASTED_MESSAGE: getApiBroadCastUrl(
      'get_sent_broadcasted_messages',
    ),
  };
};

export const GET_WHATSAPP_MESSAGE = `${whatsapp_chat_docType}get_whatsapp_message_with_pagination`;
export const GET_CHAT_WITH_WHATSAPP_NUMBER = `${whatsapp_chat_docType}get_chat_with_whatsapp_number`;
export const SEND_OUTGOING_TEXT_MESSAGE = `${whatsapp_chat_docType}send_outgoing_text_message`;
export const SEND_OUTGOING_MEDIA = `${whatsapp_chat_docType}send_outgoing_media_message`;
export const GET_WHATSAPP_TEMPLATES = `${whatsapp_chat_docType}get_whatsapp_templates`;
export const GET_UPLOADED_MEDIA = `${whatsapp_chat_docType}get_uploaded_media`;
export const SEND_TEMPLATE = `${whatsapp_chat_docType}send_template`;
export const SEND_TEMPLATE_TO_MULTIPLE_NUMBERS = `${whatsapp_chat_docType}send_template_to_multiple_numbers`;
export const LIST_WHATSAPP_KEYWORD_MESSAGES = `${whatsapp_chat_docType}list_whatsapp_keyword_messages`;
export const LIST_WHATSAPP_FLOWS = `${whatsapp_chat_docType}list_whatsapp_flows`;
export const LIST_WHATSAPP_INTERACTIVE_MESSAGES = `${whatsapp_chat_docType}list_whatsapp_interactive_messages`;
export const LIST_WHATSAPP_OPTION_MESSAGES = `${whatsapp_chat_docType}list_whatsapp_option_messages`;
export const SEND_WHATSAPP_KEYWORD_MESSAGE = `${whatsapp_chat_docType}send_keyword_message`;
export const MARK_ALL_MESSAGE_READ = `${whatsapp_chat_docType}mark_all_message_read`;
export const SEARCH_MESSAGE = `${whatsapp_chat_docType}search_whatsapp_message`;
export const DELETE_CHAT = `${whatsapp_chat_docType}delete_chats`;
export const DELETE_CONTACT = `${whatsapp_chat_docType}delete_contacts`;
export const DELETE_ALL_CHAT = `${whatsapp_chat_docType}delete_all_chats`;

// Mobile APIs
export const GET_WHATSAPP_FLOW_DATA = `${whatsapp_chat_mobile_docType}get_whatsapp_flow_data`;
export const GET_WHATSAPP_CONTACTS = `${whatsapp_chat_mobile_docType}get_contacts`;
export const GET_WHATSAPP_CONTACT_CATEGORY = `${whatsapp_chat_mobile_docType}get_contact_category`;
export const GET_WHATSAPP_CONTACT_DETAILS = `${whatsapp_chat_mobile_docType}get_contact_details`;
export const CREATE_WHATSAPP_CONTACT = `${whatsapp_chat_mobile_docType}create_contact`;
export const SEARCH_CONTACT = `${whatsapp_chat_mobile_docType}search_contact`;

// Task Management APIs
export const GET_TODAY_TASK = `${whatsapp_chat_wa_task_management_docType}get_todays_tasks`;
export const GET_YESTERDAY_TASK = `${whatsapp_chat_wa_task_management_docType}get_yesterdays_tasks`;
export const GET_THIS_WEEKS_TASK = `${whatsapp_chat_wa_task_management_docType}get_this_weeks_tasks`;
export const GET_LAST_WEEKS_TASK = `${whatsapp_chat_wa_task_management_docType}get_last_weeks_tasks`;
export const GET_THIS_MONTHS_TASK = `${whatsapp_chat_wa_task_management_docType}get_this_months_tasks`;
export const GET_LAST_MONTHS_TASK = `${whatsapp_chat_wa_task_management_docType}get_last_months_tasks`;
export const GET_THIS_YEARS_TASK = `${whatsapp_chat_wa_task_management_docType}get_this_years_tasks`;
export const GET_ALL_TIME_TASK = `${whatsapp_chat_wa_task_management_docType}get_all_tasks`;

// Smart Flow APIs
export const GET_FLOW_COMPLETE_JSON = `${whatsapp_chat_smarty_flow_docType1}flow_response_json`;
export const GET_FLOW_INCOMPLETE_JSON = `${whatsapp_chat_smarty_flow_docType1}flow_incomplete`;

// Task APIs
export const GET_TASK_CATEGORY = `${whatsapp_chat_task_docType}get_category`;
export const GET_TASK_FREQUENCY = `${whatsapp_chat_task_docType}get_frequency`;
export const GET_TASK_HOUR = `${whatsapp_chat_task_docType}get_start_hour`;
export const GET_TASK_MINUTES = `${whatsapp_chat_task_docType}get_start_minutes`;
export const GET_TASK_EXPECTED_TIME = `${whatsapp_chat_task_docType}get_expected_time_options`;
export const GET_TASK_PRIORITY = `${whatsapp_chat_task_docType}get_priority`;
export const GET_TASK_IMPORTANCE = `${whatsapp_chat_task_docType}get_importance`;
export const GET_TASK_SELECT_TEAM_MEMBER = `${whatsapp_chat_task_docType}get_user`;
export const GET_TASK_MONTH = `${whatsapp_chat_task_docType}get_month_options`;
export const GET_TASK_DAY = `${whatsapp_chat_task_docType}get_day_options`;
export const GET_TASK_DATE_OF_MONTH = `${whatsapp_chat_task_docType}get_date_options`;
export const CREATE_REPEAT_TASK = `${whatsapp_chat_task_docType}create_repeat_task`;
export const CREATE_TASK = `${whatsapp_chat_task_docType}create_task`;
export const UPDATE_TASK_STATUS = `${whatsapp_chat_task_docType}update_task_status`;
export const GET_PENDING_TASK_ASSIGNED_BY_ME = `${whatsapp_chat_task_docType}get_pending_task_assigned_by_me`;
export const GET_PENDING_TASK_ASSIGNED_TO_ME = `${whatsapp_chat_task_docType}get_pending_task_assigned_to_me`;
export const GET_OVERDUE_TASK_ASSIGNED_BY_ME = `${whatsapp_chat_task_docType}get_overdue_task_assigned_by_me`;
export const GET_OVERDUE_TASK_ASSIGNED_TO_ME = `${whatsapp_chat_task_docType}get_overdue_task_assigned_to_me`;
export const GET_COMPLETED_TASK_ASSIGNED_BY_ME = `${whatsapp_chat_task_docType}get_completed_task_assigned_by_me`;
export const GET_COMPLETED_TASK_ASSIGNED_TO_ME = `${whatsapp_chat_task_docType}get_completed_task_assigned_to_me`;
export const GET_TASK_COMMENT = `${whatsapp_chat_task_docType}get_task_comments`;
export const GET_TASK_STATUS = `${whatsapp_chat_task_docType}get_task_status`;
export const CHANGE_TASK_STATUS = `${whatsapp_chat_task_docType}change_task_status`;
export const ATTACH_FILE_TO_TASK = `${whatsapp_chat_task_docType}attach_file_to_task`;
export const GET_FILE_ATTACHMENT_TO_TASK = `${whatsapp_chat_task_docType}get_files_attached_to_task`;
export const SEND_COMMENTS_TO_TASK = `${whatsapp_chat_task_docType}add_comments_to_task`;

// BroadCast APIs
export const GET_BROADCAST_GROUP = `${whatsapp_broadCast_docType}get_broadcast_groups`;
export const GET_BROADCAST_GROUP_DETAILS = `${whatsapp_broadCast_docType}get_broadcast_group_detail`;
export const CREATE_NEW_GROUP = `${whatsapp_broadCast_docType}create_new_group`;
export const ADD_MEMBER_IN_GROUP = `${whatsapp_broadCast_docType}add_contact_to_broadcast_group`;
export const GET_CRITERIA = `${whatsapp_broadCast_docType}get_criteria`;
export const GET_OPERATOR = `${whatsapp_broadCast_docType}get_operator`;
export const GET_LOGICAL_OPERATOR = `${whatsapp_broadCast_docType}get_logical_operator`;
export const GET_SENT_BROADCASTED_MESSAGE = `${whatsapp_broadCast_docType}get_sent_broadcasted_messages`;
export const GET_BROADCAST_MESSAGE_STATUS = `${whatsapp_broadCast_docType}get_broadcast_message_status`;
export const GET_CONTACTS_BY_BROADCAST_STATUS = `${whatsapp_broadCast_docType}get_contacts_by_broadcast_status`;
export const CREATE_NEW_BROADCAST_MESSAGE = `${whatsapp_broadCast_docType}create_new_broadcast`;
export const GET_BROADCAST_MESSAGE_TEMPLATE = `${whatsapp_broadCast_docType}get_whatsapp_templates`;


// project APIs
export const Update_PROJECT_Details = `${MLA_docType}update_project_details`;
