import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { STORAGE_KEYS } from '../api/store/slice/authSlice';

export async function getHeaders() {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  // console.log('token', token);
    
  if (token) {
    return {
      Authorization: `${token}`, 
    };
  }
  return {};
}

export async function apiReq(
  endPoint,
  data,
  method,
  headers,
  requestOptions = {},
) {
  return new Promise(async (res, rej) => {
    const getTokenHeader = await getHeaders();

    headers = {
      ...getTokenHeader,
      ...headers,
    };

    if (method === 'get' || method === 'delete') {
      data = {
        requestOptions,
        ...data,
        headers,
      };
    }
    console.log('endPointendPoint', endPoint);

    axios[method](endPoint, data, { headers })
      .then(result => {
        const { data } = result;
        if (data.status === false) {
          return rej(data);
        }

        return res(data);
      })
      .catch(error => {
        console.log(error);
        console.log(error && error.response, 'the error respne');
        if (error && error.response && error.response.status === 401) {
          //logout user
          console.log('user not valid');
        }
        if (error && error.response && error.response.data) {
          if (!error.response.data.message) {
            return rej({
              ...error.response.data,
              message: error.response.data.message || 'Network Error',
            });
          }
          return rej(error.response.data);
        } else {
          return rej({ message: 'Network Error', message: 'Network Error' });
        }
      });
  });
}

export function apiPost(endPoint, data, headers = {}, requestOptions) {
  return apiReq(endPoint, data, 'post', headers, requestOptions);
}

export function apiDelete(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'delete', headers);
}

export function apiGet(endPoint, data, headers = {}, requestOptions) {
  return apiReq(endPoint, data, 'get', headers, requestOptions);
}

export function apiPut(endPoint, data, headers = {}) {
  return apiReq(endPoint, data, 'put', headers);
}
