/**
 * Response Helpers Module
 * Standardized response formatting for API endpoints
 */

const ResponseHelpers = {
    /**
     * Send a successful response
     * @param {Object} e - Request event
     * @param {Object} data - Response data
     * @param {number} status - HTTP status code (default: 200)
     */
    success: function(e, data, status = 200) {
        return e.json(status, {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        });
    },

    /**
     * Send an error response
     * @param {Object} e - Request event
     * @param {string} message - Error message
     * @param {Object} details - Additional error details
     * @param {number} status - HTTP status code (default: 400)
     */
    error: function(e, message, details = null, status = 400) {
        const response = {
            success: false,
            error: {
                message: message,
                timestamp: new Date().toISOString()
            }
        };

        if (details) {
            response.error.details = details;
        }

        return e.json(status, response);
    },

    /**
     * Send a validation error response
     * @param {Object} e - Request event
     * @param {Array} errors - Array of validation error messages
     */
    validationError: function(e, errors) {
        return this.error(e, 'Validation failed', {
            type: 'validation',
            errors: errors
        }, 422);
    },

    /**
     * Send a Rivet-specific error response
     * @param {Object} e - Request event
     * @param {string} rivetError - Rivet error message
     * @param {Object} metadata - Additional metadata
     */
    rivetError: function(e, rivetError, metadata = {}) {
        return this.error(e, 'Rivet workflow execution failed', {
            type: 'rivet_execution',
            rivet_error: rivetError,
            ...metadata
        }, 500);
    },

    /**
     * Send an internal server error response
     * @param {Object} e - Request event
     * @param {string} message - Error message
     * @param {string} details - Detailed error information
     */
    internalError: function(e, message, details) {
        return this.error(e, message, {
            type: 'internal_server_error',
            details: details
        }, 500);
    },

    /**
     * Send a not found error response
     * @param {Object} e - Request event
     * @param {string} resource - Resource that was not found
     */
    notFound: function(e, resource = 'Resource') {
        return this.error(e, `${resource} not found`, {
            type: 'not_found'
        }, 404);
    },

    /**
     * Send an unauthorized error response
     * @param {Object} e - Request event
     * @param {string} message - Custom message (optional)
     */
    unauthorized: function(e, message = 'Unauthorized access') {
        return this.error(e, message, {
            type: 'unauthorized'
        }, 401);
    },

    /**
     * Send a forbidden error response
     * @param {Object} e - Request event
     * @param {string} message - Custom message (optional)
     */
    forbidden: function(e, message = 'Access forbidden') {
        return this.error(e, message, {
            type: 'forbidden'
        }, 403);
    },

    /**
     * Send a rate limit error response
     * @param {Object} e - Request event
     * @param {Object} limitInfo - Rate limit information
     */
    rateLimited: function(e, limitInfo = {}) {
        return this.error(e, 'Rate limit exceeded', {
            type: 'rate_limited',
            ...limitInfo
        }, 429);
    },

    /**
     * Format data for consistent API responses
     * @param {*} data - Data to format
     * @param {Object} options - Formatting options
     */
    formatData: function(data, options = {}) {
        const formatted = {
            data: data,
            meta: {
                timestamp: new Date().toISOString()
            }
        };

        if (options.pagination) {
            formatted.meta.pagination = options.pagination;
        }

        if (options.filter) {
            formatted.meta.filter = options.filter;
        }

        if (options.sort) {
            formatted.meta.sort = options.sort;
        }

        return formatted;
    },

    /**
     * Create a paginated response
     * @param {Object} e - Request event
     * @param {Array} data - Data array
     * @param {Object} pagination - Pagination info
     */
    paginated: function(e, data, pagination) {
        return this.success(e, this.formatData(data, {
            pagination: {
                page: pagination.page || 1,
                limit: pagination.limit || 20,
                total: pagination.total || data.length,
                pages: Math.ceil((pagination.total || data.length) / (pagination.limit || 20))
            }
        }));
    },

    /**
     * Send a created response (for POST requests)
     * @param {Object} e - Request event
     * @param {Object} data - Created resource data
     * @param {string} location - Location header value (optional)
     */
    created: function(e, data, location = null) {
        if (location) {
            e.response.header().set('Location', location);
        }
        
        return this.success(e, {
            message: 'Resource created successfully',
            resource: data
        }, 201);
    },

    /**
     * Send a "no content" response (for DELETE requests)
     * @param {Object} e - Request event
     */
    noContent: function(e) {
        return e.noContent(204);
    },

    /**
     * Send an accepted response (for async operations)
     * @param {Object} e - Request event
     * @param {Object} data - Response data
     */
    accepted: function(e, data) {
        return this.success(e, {
            message: 'Request accepted for processing',
            ...data
        }, 202);
    }
};

module.exports = ResponseHelpers;
