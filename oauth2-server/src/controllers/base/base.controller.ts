import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../../core/error.response';
import ErrorMessage from '../../enum/error.message';

class BaseController {
  validate(data: any, schema: (data: any) => Joi.ValidationResult): void {
    const { error } = schema(data);
    if (error) {
      throw new BadRequestError(error.details[0].message);
    }
  }

  checkDataNotNull(data: any, message: string = ErrorMessage.BAD_REQUEST): void {
    if (!data) {
      throw new BadRequestError(message);
    }
  }
}

export default BaseController;
