'use strict';


var users = require('../../app/controllers/users.server.controller'),
    note = require('../../app/controllers/noteapp.server.controller'),
    notecolumn = require('../../app/controllers/notecolumn.server.controller'),
    notevalue = require('../../app/controllers/notevalue.server.controller'),
    admin = require('../../app/controllers/admin.server.controller');

module.exports = function (app) {
    // Routing logic
    app.route('/note')
        .get(users.requiresLogin, note.list)
        .post(users.requiresLogin, note.create);

    app.route('/note/:noteId')
        .put(users.requiresLogin, note.hasAuthorization, note.update)
        .delete(users.requiresLogin, note.hasAuthorization, note.delete);

    app.route('/notecolumn')
        .post(users.requiresLogin, notecolumn.create);

    app.route('/notecolumn/sort')
        .post(users.requiresLogin, notecolumn.sort);

    app.route('/notecolumn/delcl')
        .post(users.requiresLogin, notecolumn.delete);

    app.route('/notecolumn/:noteId')
        .get(users.requiresLogin, notecolumn.list)
        .put(users.requiresLogin, note.hasAuthorization, notecolumn.update)
        .delete(users.requiresLogin, note.hasAuthorization, notecolumn.delete);

    app.route('/notevalue')
        .post(users.requiresLogin, notevalue.list);

    app.route('/notevalue/:rowtime')
        .delete(users.requiresLogin, notevalue.delete);

    app.route('/notevalue/add')
        .post(users.requiresLogin, notevalue.create);

    app.route('/admin')
        .get(users.requiresLogin, admin.isAdminDuy, admin.list);

    app.param('noteId', note.noteByID);
};