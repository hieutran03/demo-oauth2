export const ReasonPhrases = {
  // 1xx Informational
  CONTINUE: 'Continue',
  SWITCHING_PROTOCOLS: 'Switching Protocols',
  PROCESSING: 'Processing',

  // 2xx Success
  OK: 'OK',
  CREATED: 'Created',
  ACCEPTED: 'Accepted',
  NON_AUTHORITATIVE_INFORMATION: 'Non Authoritative Information',
  NO_CONTENT: 'No Content',
  RESET_CONTENT: 'Reset Content',
  PARTIAL_CONTENT: 'Partial Content',
  MULTI_STATUS: 'Multi-Status',

  // 3xx Redirection
  MULTIPLE_CHOICES: 'Multiple Choices',
  MOVED_PERMANENTLY: 'Moved Permanently',
  MOVED_TEMPORARILY: 'Moved Temporarily',
  SEE_OTHER: 'See Other',
  NOT_MODIFIED: 'Not Modified',
  USE_PROXY: 'Use Proxy',
  TEMPORARY_REDIRECT: 'Temporary Redirect',
  PERMANENT_REDIRECT: 'Permanent Redirect',

  // 4xx Client Errors
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  PAYMENT_REQUIRED: 'Payment Required',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  METHOD_NOT_ALLOWED: 'Method Not Allowed',
  NOT_ACCEPTABLE: 'Not Acceptable',
  PROXY_AUTHENTICATION_REQUIRED: 'Proxy Authentication Required',
  REQUEST_TIMEOUT: 'Request Timeout',
  CONFLICT: 'Conflict',
  GONE: 'Gone',
  LENGTH_REQUIRED: 'Length Required',
  PRECONDITION_FAILED: 'Precondition Failed',
  REQUEST_TOO_LONG: 'Request Entity Too Large',
  REQUEST_URI_TOO_LONG: 'Request-URI Too Long',
  UNSUPPORTED_MEDIA_TYPE: 'Unsupported Media Type',
  REQUESTED_RANGE_NOT_SATISFIABLE: 'Requested Range Not Satisfiable',
  EXPECTATION_FAILED: 'Expectation Failed',
  IM_A_TEAPOT: "I'm a teapot",
  INSUFFICIENT_SPACE_ON_RESOURCE: 'Insufficient Space on Resource',
  METHOD_FAILURE: 'Method Failure',
  MISDIRECTED_REQUEST: 'Misdirected Request',
  UNPROCESSABLE_ENTITY: 'Unprocessable Entity',
  LOCKED: 'Locked',
  FAILED_DEPENDENCY: 'Failed Dependency',
  PRECONDITION_REQUIRED: 'Precondition Required',
  TOO_MANY_REQUESTS: 'Too Many Requests',
  REQUEST_HEADER_FIELDS_TOO_LARGE: 'Request Header Fields Too Large',
  UNAVAILABLE_FOR_LEGAL_REASONS: 'Unavailable For Legal Reasons',

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  NOT_IMPLEMENTED: 'Not Implemented',
  BAD_GATEWAY: 'Bad Gateway',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
  GATEWAY_TIMEOUT: 'Gateway Timeout',
  HTTP_VERSION_NOT_SUPPORTED: 'HTTP Version Not Supported',
  INSUFFICIENT_STORAGE: 'Insufficient Storage',
  NETWORK_AUTHENTICATION_REQUIRED: 'Network Authentication Required',
} as const;

export type ReasonPhraseKey = keyof typeof ReasonPhrases;
export type ReasonPhraseValue = (typeof ReasonPhrases)[ReasonPhraseKey];

export default ReasonPhrases;
