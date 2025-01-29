import type collection from '@TutorShared/config/icon-list';
import type { AxiosError, AxiosResponse } from 'axios';
import type { ReactNode } from 'react';

export type CourseProgressSteps = 'basic' | 'curriculum' | 'additional' | 'certificate';

export type IconCollection = keyof typeof collection;

export const localHasOwnProperty = <T extends object>(obj: T, key: PropertyKey): key is keyof T => {
  return key in obj;
};

export const isAxiosError = <T>(error: unknown): error is AxiosError<T> => {
  return (error as AxiosError).isAxiosError;
};

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== undefined && value !== null;
};

export function isString(value: unknown): value is string {
  return typeof value === 'string' || value instanceof String;
}

export function isPrimitivesArray(value: unknown | null): value is unknown[] {
  return !!value && Array.isArray(value) && (!value.length || typeof value[0] !== 'object');
}

export function isStringArray(value: unknown): value is string[] {
  return isPrimitivesArray(value) && (!value.length || typeof value[0] === 'string' || value[0] instanceof String);
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' || value instanceof Number;
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean' || value instanceof Boolean;
}

export function isObject<T>(value: T): value is T {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export interface Option<T> {
  label: string;
  value: T;
  icon?: ReactNode | string;
  disabled?: boolean;
  description?: string;
}
export type CouponStatus = 'active' | 'inactive';
export type ProductStatus = 'draft' | 'published' | 'trashed';
export type ProductDiscount = {
  type: 'percent' | 'amount';
  amount: number | null;
};
export type ProductOptionType = 'color' | 'list';
export interface ProductOptionValue {
  id?: number;
  name: string;
  color?: string;
}

export interface OptionWithIcon<T> {
  label: string;
  value: T;
  icon: ReactNode;
  disabled?: boolean;
}
export interface OptionWithImage<T> {
  label: string;
  value: T;
  image: string;
  disabled?: boolean;
}

export interface PaginatedResult<T> {
  total_items: number;
  results: T[];
}

export interface PaginatedParams {
  limit?: number;
  offset?: number;
  sort?: {
    property?: string;
    direction?: 'asc' | 'desc';
  };
  filter?: Record<string, string>;
}

export interface PostResponse<T> {
  data: {
    status: boolean;
    message: string;
    id: T;
  };
}

export interface TableSelectedItems {
  ids: number[];
  indexes: number[];
}

export interface MoreOptionsProps<T> {
  item: T;
  updateSelectedItems?: () => void;
}

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface WPResponse<T> {
  data: T;
  message: string;
  status_code: AxiosResponse['status'];
}

export type ID = number | string;

export interface TutorMutationResponse<T> {
  data: T;
  message: string;
  status_code: number;
}

export interface WPUser {
  user_id: number;
  display_name: string;
  user_email: string;
  avatar_url: string;
}

export type WPPostStatus = 'publish' | 'private' | 'draft' | 'future' | 'pending' | 'trash';
export type TutorSellingOption = 'subscription' | 'one_time' | 'both';

export interface TutorCategory {
  term_id: number;
  name: string;
  slug: string;
  term_group: number;
  term_taxonomy_id: number;
  taxonomy: string;
  description: string;
  parent: number;
  count: number;
  filter: string;
}

export interface Editor {
  label: string;
  link: string;
  name: string;
}
