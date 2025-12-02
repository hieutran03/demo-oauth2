const ErrorMessage = {
  // Auth
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  INVALID_TOKEN: 'Invalid token',
  TOKEN_EXPIRED: 'Token expired',
  
  // User
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User already exists',
  USER_IS_DEACTIVED: 'User is deactivated',
  USER_CREATED: 'User created successfully',
  WRONG_PASSWORD: 'Wrong password',
  PASSWORD_NOT_MATCH: 'Password does not match',
  CREATE_USER_ERROR: 'Error creating user',
  ACCOUNT_HAS_BEEN_DELETED: 'Account has been deleted',
  
  // Auth success
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  
  // General
  PAGE_NOT_FOUND: 'Page not found',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  BAD_REQUEST: 'Bad request',
  VALIDATION_ERROR: 'Validation error',
  
  // OAuth
  CLIENT_NOT_FOUND: 'Client not found',
  CLIENT_ALREADY_EXISTS: 'Client already exists',
  INVALID_GRANT: 'Invalid grant',
  INVALID_SCOPE: 'Invalid scope',
} as const;

export type ErrorMessageType = typeof ErrorMessage[keyof typeof ErrorMessage];
export default ErrorMessage;
