import Joi, { ObjectSchema } from 'joi';

class UserValidator {
  registerValidate(body: any): Joi.ValidationResult {
    const schema: ObjectSchema = Joi.object({
      fullName: Joi.string().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
      confirmPassword: Joi.string().required(),
    });

    return schema.validate(body);
  }

  login(body: any): Joi.ValidationResult {
    const schema: ObjectSchema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      client_id: Joi.string(),
      redirect_uri: Joi.string(),
      state: Joi.string(),
      response_type: Joi.string(),
      scope: Joi.string().allow(''),
    }).required();

    return schema.validate(body);
  }
}

export default new UserValidator();
