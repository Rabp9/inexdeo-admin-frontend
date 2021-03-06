'use strict';

/**
 * @ngdoc service
 * @name inexdeoAdminApp.envService
 * @description
 * # envService
 * Factory in the inexdeoAdminApp.
 */
angular.module('inexdeoAdminApp')
.factory('EnvService', function () {
    return {
        getHost: function() {
            switch (window.location.hostname) {
                case 'localhost':
                    return 'http://localhost:8000/inexdeo-backend/';
                case 'admin.inexdeo.robertobocanegra.com':
                    return 'http://inexdeo.robertobocanegra.com/api/';
                case 'admin.iedsa.com.pe':
                    return 'http://iedsa.com.pe/api/';
                case 'www.admin.iedsa.com.pe':
                    return 'http://iedsa.com.pe/api/';
            }
        }
    };
});