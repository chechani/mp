import {createApi} from '@reduxjs/toolkit/query/react';
import {
  ADD_MEMBER_IN_GROUP,
  CREATE_NEW_GROUP,
  GET_BROADCAST_GROUP,
} from '../../../Config/url';
import {customBaseQuery} from '../utils';

export const BroadCastGroupApiSlices = createApi({
  reducerPath: 'BroadCastGroupApiSlices',
  baseQuery: customBaseQuery,
  tagTypes: ['BroadCastGroup'],
  endpoints: builder => ({
    // Fetch search BroadCast group Member
    SearchBroadCastGroupMember: builder.query({
      query: ({name, search_query}) => ({
        url: `api/method/frappe_whatsapp.broadcasting.search_contact_in_broadcast_group?name=${name}&search_query=${search_query}`,
        method: 'GET',
      }),
    }),

    // Fetch BroadCast group Details
    fetchBroadCastGroupDetails: builder.query({
      query: ({name}) => ({
        url: `api/method/frappe_whatsapp.broadcasting.get_broadcast_group_detail?name=${name}`,
        method: 'GET',
      }),
    }),
    // Get BroadCast group
    getBroadCastGroup: builder.query({
      query: () => ({
        url: `${GET_BROADCAST_GROUP}`,
        method: 'GET',
      }),
    }),
    // Get BroadCast group
    addMemberInGroup: builder.mutation({
      query: ({name, contact_name, contact_mobile_no}) => ({
        url: `${ADD_MEMBER_IN_GROUP}`,
        method: 'POST',
        body: {
          name,
          contact_name,
          contact_mobile_no,
        },
      }),
    }),
    // Get BroadCast group
    createNewGroup: builder.mutation({
      query: payload => ({
        url: `${CREATE_NEW_GROUP}`,
        method: 'POST',
        body: payload,
      }),
    }),
  }),
});

export const {
  useSearchBroadCastGroupMemberQuery,
  useFetchBroadCastGroupDetailsQuery,
  useGetBroadCastGroupQuery,
  useAddMemberInGroupMutation,
  useCreateNewGroupMutation
} = BroadCastGroupApiSlices;
