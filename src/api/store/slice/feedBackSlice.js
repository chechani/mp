import {createApi} from '@reduxjs/toolkit/query/react';
import {customBaseQuery} from '../utils';

export const feedBackSlice = createApi({
  reducerPath: 'feedBackSlice',
  baseQuery: customBaseQuery,
  tagTypes: ['feedBackSlice'],
  endpoints: builder => ({
    // Fetch all Complains
    SendComments: builder.mutation({
      query: ({hd_ticket_name, message}) => ({
        url: `api/method/mla.MlaHelpDesk.send_text_message`,
        method: 'POST',
        body: {
          hd_ticket_name,
          message,
        },
      }),
    }),

    // check message received more than 24 hours ago or not
    CheckSeesionForSendComment: builder.query({
      query: ({hd_ticket_name}) => ({
        url: `api/method/mla.MlaHelpDesk.send_whatsapp_message_check?hd_ticket_name=${hd_ticket_name}`,
        method: 'GET',
      }),
    }),

    // Get all village
    GetAllVillages: builder.query({
      query: ({panchayat}) => ({
        url: `api/method/mla.MlaHelpDesk.get_villages?panchayat=${panchayat}`,
        method: 'GET',
      }),
    }),

    // Get all Panchayat
    GetAllPanchayat: builder.query({
      query: ({tehsil}) => ({
        url: `api/method/mla.MlaHelpDesk.get_panchayat?tehsil=${tehsil}`,
        method: 'GET',
      }),
    }),

    // Get all Tehsil
    GetAllTehsil: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_tehsil`,
        method: 'GET',
      }),
    }),

    // Get all Profession
    GetAllProfession: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_profession`,
        method: 'GET',
      }),
    }),

    // Get all Status
    GetAllStatus: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_status`,
        method: 'GET',
      }),
    }),

    // Get Filter data
    GetAllFilteredComplaintsData: builder.query({
      query: ({
        page,
        limit,
        village,
        panchayat,
        tehsil,
        profession,
        mobile,
        status,
      }) => {
        const params = new URLSearchParams({
          page,
          limit,
          village,
          panchayat,
          tehsil,
          profession,
          mobile,
          status,
        });

        return {
          url: `api/method/mla.MlaHelpDesk.get_feedback_tickets_filtered?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

      // update status 
      UpdateStatus: builder.mutation({
        query: ({ticket_name, status}) => ({
          url: `api/method/mla.MlaHelpDesk.update_ticket`,
          method: 'PUT',
          body: {
            ticket_name,
            status,
          },
        }),
      }),
  }),
});

export const {
  useSendCommentsMutation,
  useCheckSeesionForSendCommentQuery,
  // all filters
  useLazyGetAllPanchayatQuery,
  useLazyGetAllProfessionQuery,
  useLazyGetAllStatusQuery,
  useLazyGetAllTehsilQuery,
  useLazyGetAllVillagesQuery,
  useLazyGetAllFilteredComplaintsDataQuery,
  useUpdateStatusMutation
} = feedBackSlice;
