import {createApi} from '@reduxjs/toolkit/query/react';
import {
  GET_UPLOADED_MEDIA,
  GET_WHATSAPP_TEMPLATES,
  SEND_TEMPLATE_TO_MULTIPLE_NUMBERS,
} from '../../../Config/url';
import {customBaseQuery} from '../utils';

export const TempleteApiSlices = createApi({
  reducerPath: 'TempleteApiSlices',
  baseQuery: customBaseQuery,
  tagTypes: ['Templete'],
  endpoints: builder => ({
    // get Temepete
    GetAllTemplete: builder.query({
      query: () => ({
        url: `${GET_WHATSAPP_TEMPLATES}`,
        method: 'GET',
      }),
    }),
    // Uploade media
    UploadeMedia: builder.mutation({
      query: ({header_type}) => ({
        url: `${GET_UPLOADED_MEDIA}`,
        method: 'POST',
        body: header_type,
      }),
    }),
    // Send multiple number to templete
    SendTemplateToMultipleNumber: builder.mutation({
      query: ({
        media_url,
        media_type,
        header_type,
        template,
        mobile_numbers,
        components,
        filename,
        filedata,
        media_name,
      }) => ({
        url: `${SEND_TEMPLATE_TO_MULTIPLE_NUMBERS}`,
        method: 'POST',
        body: {
          media_url,
          media_type,
          header_type,
          template,
          mobile_numbers,
          components,
          filename,
          filedata,
          media_name,
        },
      }),
    }),
  }),
});

export const {
  useGetAllTempleteQuery,
  useUploadeMediaMutation,
  useSendTemplateToMultipleNumberMutation,
} = TempleteApiSlices;
