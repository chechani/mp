import { createApi } from '@reduxjs/toolkit/query/react';
import { SEARCH_CONTACT, SEARCH_MESSAGE } from '../../../Config/url';
import { customBaseQuery } from '../utils';

export const SearchApiSlices = createApi({
  reducerPath: 'SearchApiSlices',
  baseQuery: customBaseQuery,
  tagTypes: ['search'],
  endpoints: builder => ({
    
    // search message
    searchMessage: builder.query({
      query: ({search_query}) => ({
        url: `${SEARCH_MESSAGE}?search_query=${search_query}`,
        method: 'GET',
      }),
    }),
    // search Contact
    searchConatct: builder.query({
      query: ({search_query}) => ({
        url: `${SEARCH_CONTACT}?search_query=${search_query}`,
        method: 'GET',
      }),
    }),
   
  }),
});

export const {useLazySearchMessageQuery,useLazySearchConatctQuery} = SearchApiSlices;
