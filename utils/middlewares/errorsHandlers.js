const boom = require('boom')
const { config } = require('../../config/index')
const isRequestAjaxOrApi = require('../../utils/isRequestAjaxOrApi')

function withErrorStack (err, stack) {
  if (config.dev) {
    return { ...err, stack } // misma funcionalidad que hacer: Object.assign({}, err, stack)
  }
}

function logErrors(err, req, res, next) {
  console.log(err.stack)
  next(err)
}

function wrapErrors (err, req, res, next) {
  !err.isBoom ? next(boom.badImplementation(err)) : next(err)
}

function clientErrorHandler(err, req, res, next) {
  const {
    output: { statusCode, payload }
  } = err

  // Catch errors for AJAX request of if an error occurs while streaming
  if (isRequestAjaxOrApi(req) || res.headersSent) {
    res.status(statusCode).json(withErrorStack(payload, err.stack))
  } else {
    next(err)
  }
}

function errorHandler(err, req, res, next) {
  const {
    output: { statusCode, payload }
  } = err

  res.status(statusCode)
  res.render('error', withErrorStack(payload, err.stack))
}

module.exports = {
  logErrors,
  wrapErrors,
  clientErrorHandler,
  errorHandler
}
