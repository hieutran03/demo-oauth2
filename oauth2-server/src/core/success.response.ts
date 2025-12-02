import { Request, Response } from 'express';
import { applicationLogger } from '../loggers/mylogger.log';

const StatusCode = {
  CREATED: 201,
  OK: 200,
} as const;

const ReasonStatusCode = {
  CREATED: 'Created!',
  OK: 'SUCCESS',
} as const;

interface SendOptions {
  saveDataLog?: boolean;
  deleteCaching?: boolean;
  saveCaching?: boolean;
  deleteOptions?: string[];
}

export class SuccessResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  data: T;

  constructor({
    success,
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    data = {} as T,
  }: {
    success?: boolean;
    message?: string;
    statusCode?: number;
    reasonStatusCode?: string;
    data?: T;
  }) {
    this.success = success ?? true;
    this.message = message || reasonStatusCode;
    this.code = statusCode;
    this.data = data;
  }

  async send(req: Request, res: Response, options: SendOptions = {}): Promise<Response> {
    if (options.saveDataLog) {
      applicationLogger.log(`output data::: ${req.method}`, [
        req.path,
        { requestId: req.requestId },
        { data: this },
      ]);
    }
    return res.status(this.code).json(this);
  }
}

export class OK<T = any> extends SuccessResponse<T> {
  constructor({ success, message, data }: { success?: boolean; message?: string; data?: T }) {
    super({ success, message, data });
  }
}

export class GETLISTOK<T = any> extends SuccessResponse<T> {
  pagination: Record<string, any>;
  totalInfo?: any;

  constructor({
    success,
    pagination = {},
    message,
    data,
    totalInfo,
  }: {
    success?: boolean;
    pagination?: Record<string, any>;
    message?: string;
    data?: T;
    totalInfo?: any;
  }) {
    super({ success, message, data });
    this.pagination = pagination;
    this.totalInfo = totalInfo;
  }
}

export class CREATED<T = any> extends SuccessResponse<T> {
  constructor({
    message,
    statusCode = StatusCode.CREATED,
    reasonStatusCode = ReasonStatusCode.CREATED,
    data,
  }: {
    message?: string;
    statusCode?: number;
    reasonStatusCode?: string;
    data?: T;
  }) {
    super({ message, statusCode, reasonStatusCode, data });
  }
}
