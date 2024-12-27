import { createApi } from '@reduxjs/toolkit/query/react';
import { customBaseQuery } from '../utils';

export const ComplainsSlice = createApi({
  reducerPath: 'ComplainsSlice',
  baseQuery: customBaseQuery,
  tagTypes: ['ComplainsSlice'],
  endpoints: (builder) => ({
    // Fetch all Complains
    fetchAllComplains: builder.query({
      query: () => ({
        url: 'api/method/mla.helpdesk.get_complain_tickets',
        method: 'GET',
      }),
    }),

    // Fetch all Complains
    SendComments: builder.mutation({
      query: ({ hd_ticket_name, message }) => ({
        url: `api/method/mla.helpdesk.send_text_message`,
        method: 'POST',
        body: {
          hd_ticket_name,
          message,
        },
      }),
    }),

    // check message received more than 24 hours ago or not
    CheckSeesionForSendComment: builder.query({
      query: ({ hd_ticket_name }) => ({
        url: `api/method/mla.helpdesk.send_whatsapp_message_check?hd_ticket_name=${hd_ticket_name}`,
        method: 'GET',
      }),
    }),

    // Get all village
    GetAllVillages: builder.query({
      query: ({ panchayat }) => ({
        url: `api/method/mla.helpdesk.get_villages?panchayat=${panchayat}`,
        method: 'GET',
      }),
    }),

    // Get all Panchayat
    GetAllPanchayat: builder.query({
      query: ({ tehsil }) => ({
        url: `api/method/mla.helpdesk.get_panchayat?tehsil=${tehsil}`,
        method: 'GET',
      }),
    }),

    // Get all Tehsil
    GetAllTehsil: builder.query({
      query: () => ({
        url: `api/method/mla.helpdesk.get_tehsil`,
        method: 'GET',
      }),
    }),

    // Get all Profession
    GetAllProfession: builder.query({
      query: () => ({
        url: `api/method/mla.helpdesk.get_profession`,
        method: 'GET',
      }),
    }),

    // Get all Status
    GetAllStatus: builder.query({
      query: () => ({
        url: `api/method/mla.helpdesk.get_status`,
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
          url: `api/method/mla.helpdesk.get_complain_tickets_filtered?${params.toString()}`,
          method: 'GET',
        };
      },
    }),

    // update status 
    UpdateStatus: builder.mutation({
      query: ({ticket_name, status}) => ({
        url: `api/method/mla.helpdesk.update_ticket`,
        method: 'POST',
        body: {
          ticket_name,
          status,
        },
      }),
    }),
  }),
});

export const {
  useFetchAllComplainsQuery,
  useSendCommentsMutation,
  useCheckSeesionForSendCommentQuery,
  // all filters
  useLazyGetAllPanchayatQuery,
  useLazyGetAllProfessionQuery,
  useLazyGetAllStatusQuery,
  useLazyGetAllTehsilQuery,
  useLazyGetAllVillagesQuery,
  useGetAllFilteredComplaintsDataQuery,
  useLazyGetAllFilteredComplaintsDataQuery,
  
  useUpdateStatusMutation
} = ComplainsSlice;
