'use strict';

module.exports = {
    app: {
        title: 'Always notes',
        description: 'Simple application for note everyday work',
        keywords: 'table note, simple note, always note'
    },
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    sessionSecret: 'MEAN',
    sessionCollection: 'sessions',
    assets: {
        lib: {
            css: [
                'public/lib/bootstrap/dist/css/bootstrap.css',
                'public/lib/bootstrap/dist/css/bootstrap-theme.css',
            ],
            js: [
                'public/lib/jquery/dist/jquery.min.js',
                'public/lib/jquery-ui/jquery-ui.min.js',
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-cookies/angular-cookies.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-touch/angular-touch.js',
                'public/lib/angular-sanitize/angular-sanitize.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/angular-moment/angular-moment.min.js',
                'public/lib/angular-filter/dist/angular-filter.min.js',
                'public/lib/bootstrap-daterangepicker/daterangepicker.js',
                'public/lib/angular-daterangepicker/js/angular-daterangepicker.min.js',
                'public/lib/angular-ui-sortable/sortable.min.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css',
            'public/lib/bootstrap-daterangepicker/daterangepicker-bs3.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/modules/*/tests/*.js'
        ]
    }
};