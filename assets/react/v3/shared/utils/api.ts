import axios, { type AxiosRequestHeaders, type Method } from 'axios';

import config, { tutorConfig } from '@TutorShared/config/config';

import * as querystring from 'querystring';

import { convertToFormData, serializeParams } from './form';

axios.defaults.paramsSerializer = (params: Record<string, string>) => {
  return querystring.stringify(params);
};

export const wpAuthApiInstance = axios.create({
  baseURL: config.WP_API_BASE_URL,
});

wpAuthApiInstance.interceptors.request.use(
  (config) => {
    config.headers ||= {} as AxiosRequestHeaders;

    config.headers['X-WP-Nonce'] = tutorConfig.wp_rest_nonce;

    if (config.method && ['post', 'put', 'patch'].includes(config.method.toLocaleLowerCase())) {
      if (config.data) {
        config.data = convertToFormData(config.data, config.method as Method);
      }

      if (['put', 'patch'].includes(config.method.toLowerCase())) {
        config.method = 'POST';
      }
    }

    if (config.params) {
      config.params = serializeParams(config.params);
    }

    if (config.method && ['get', 'delete'].includes(config.method.toLowerCase())) {
      config.params = { ...config.params, _method: config.method };
    }

    return config;
  },
  (err) => {
    return Promise.reject(err);
  },
);

wpAuthApiInstance.interceptors.response.use((response) => {
  return Promise.resolve(response).then((res) => res);
});

export const wpAjaxInstance = axios.create({
  baseURL: config.WP_AJAX_BASE_URL,
});

wpAjaxInstance.interceptors.request.use(
  (config) => {
    config.headers ||= {} as AxiosRequestHeaders;
    // config.headers['X-WP-Nonce'] = tutorConfig._tutor_nonce;

    // We will use REST methods while using but wp ajax only sent via post method.
    config.method = 'POST';

    if (config.params) {
      config.params = serializeParams(config.params);
    }

    config.data ||= {};

    const nonce_key = tutorConfig.nonce_key;
    const nonce_value = tutorConfig._tutor_nonce;
    config.data = { ...config.data, ...config.params, action: config.url, [nonce_key]: nonce_value };
    config.data = convertToFormData(config.data, config.method as Method);

    config.params = {};
    config.url = undefined;

    return config;
  },
  (error) => Promise.reject(error),
);

wpAjaxInstance.interceptors.response.use((response) => Promise.resolve(response).then((res) => res.data));
