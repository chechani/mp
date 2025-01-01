import {createApi} from '@reduxjs/toolkit/query/react';
import {customBaseQuery} from '../utils';
import {GET_WHATSAPP_MESSAGE} from '../../../Config/url';

export const MessageApiSlices = createApi({
  reducerPath: 'MessageApiSlices',
  baseQuery: customBaseQuery,
  tagTypes: ['Message'],
  endpoints: builder => ({
    // Fetch All Message List
    GetAllMessageList: builder.query({
      query: ({page, page_size}) => ({
        url: `${GET_WHATSAPP_MESSAGE}?page=${page}&page_size=${page_size}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {useLazyGetAllMessageListQuery} = MessageApiSlices;
