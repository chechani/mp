import {createApi} from '@reduxjs/toolkit/query/react';
import {customBaseQuery} from '../utils';
import {Update_PROJECT_Details} from '../../../Config/url';

export const ProjectSlice = createApi({
  reducerPath: 'ProjectSlice',
  baseQuery: customBaseQuery,
  tagTypes: ['ProjectSlice'],
  endpoints: builder => ({
    // Get all Project
    GetAllProject: builder.query({
      query: ({page, limit, village, panchayat, tehsil, status}) => {
        const params = new URLSearchParams({
          page,
          limit,
          village,
          panchayat,
          tehsil,
          status,
        });

        return {
          url: `api/method/mla.MlaHelpDesk.get_projects?${params.toString()}`,
          method: 'GET',
        };
      },
    }),
    // Get Villages
    GetProjectVillages: builder.query({
      query: ({panchayat}) => ({
        url: `api/method/mla.MlaHelpDesk.get_project_villages?panchayat=${panchayat}`,
        method: 'GET',
      }),
    }),

    // Get Panchayat
    GetProjectPanchayat: builder.query({
      query: ({tehsil}) => ({
        url: `api/method/mla.MlaHelpDesk.get_project_panchayat?tehsil=${tehsil}`,
        method: 'GET',
      }),
    }),

    // Get all Tehsil
    GetProjectTehsil: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_project_tehsil`,
        method: 'GET',
      }),
    }),
    // Get all Status
    GetProjectStatus: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_project_status`,
        method: 'GET',
      }),
    }),
    // Create Project
    CreateProject: builder.mutation({
      query: payload => ({
        url: `api/method/mla.MlaHelpDesk.create_project`,
        method: 'POST',
        body: payload,
      }),
    }),

    // Get Project type
    GetProjectType: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_project_type`,
        method: 'GET',
      }),
    }),

    // Get Project Scheme
    GetProjectScheme: builder.query({
      query: () => ({
        url: `api/method/mla.MlaHelpDesk.get_project_scheme`,
        method: 'GET',
      }),
    }),
    // Get all Panchayat
    GetProjectAllPanchayat: builder.query({
      query: ({tehsil}) => ({
        url: `api/method/mla.MlaHelpDesk.get_all_panchayat?tehsil=${tehsil}`,
        method: 'GET',
      }),
    }),

    // Get All Villages
    GetProjectAllVillages: builder.query({
      query: ({panchayat}) => ({
        url: `api/method/mla.MlaHelpDesk.get_all_villages?panchayat=${panchayat}`,
        method: 'GET',
      }),
    }),
    // create project scheme
    CreateProjectScheme: builder.mutation({
      query: ({scheme_name}) => ({
        url: `api/method/mla.MlaHelpDesk.create_project_scheme?scheme_name=${scheme_name}`,
        method: 'POST',
      }),
    }),
    // update project status
    updateProjectStatus: builder.mutation({
      query: ({project_name, project_status}) => ({
        url: `api/method/mla.MlaHelpDesk.update_project_status`,
        method: 'PUT',
        body: {
          project_name,
          project_status,
        },
      }),
    }),

    // update project Details
    updateProjectDetails: builder.mutation({
      query: ({
        name,
        project_type,
        project_code,
        project_scheme,
        status,
        estimated_cost,
        allocated_cost,
        actual_cost,
        project_description,
        start_date,
        end_date,
        actual_start_date,
        actual_end_date,
      }) => ({
        url: `${Update_PROJECT_Details}`,
        method: 'PUT',
        body: {
          name,
          project_type,
          project_code,
          project_scheme,
          status,
          estimated_cost,
          allocated_cost,
          actual_cost,
          project_description,
          start_date,
          end_date,
          actual_start_date,
          actual_end_date,
        },
      }),
    }),
  }),
});

export const {
  useLazyGetProjectPanchayatQuery,
  useLazyGetProjectStatusQuery,
  useLazyGetProjectTehsilQuery,
  useLazyGetProjectVillagesQuery,
  useLazyGetAllProjectQuery,
  useCreateProjectMutation,
  useLazyGetProjectTypeQuery,
  useLazyGetProjectAllPanchayatQuery,
  useLazyGetProjectAllVillagesQuery,
  useLazyGetProjectSchemeQuery,
  useCreateProjectSchemeMutation,
  useUpdateProjectStatusMutation,
  useUpdateProjectDetailsMutation,
} = ProjectSlice;
