'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Note = mongoose.model('Note'),
    NoteColumn = mongoose.model('Notecolumn'),
    NoteValue = mongoose.model('Notevalue'),
    _ = require('lodash');

/**
 * Create a Noteapp
 */
exports.create = function (req, res) {
    var note = new Note(req.body);
    note.user = req.user;
    note.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }

        //add default column
        var ncolumn = new NoteColumn({
            columnname: '#',
            position: 0,
            note: note._id
        });

        ncolumn.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });

        ncolumn = new NoteColumn({
            columnname: 'Name',
            position: 1,
            note: note._id
        });

        ncolumn.save(function (err) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });

        res.json(note);
    });
};

/**
 * Show the current Noteapp
 */
exports.read = function (req, res) {

};

/**
 * Update a Noteapp
 */
exports.update = function (req, res) {
    var note = req.note;

    note = _.extend(note, req.body);

    note.save(function(err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });
};

/**
 * Delete an Noteapp
 */
exports.delete = function (req, res) {
    var note = req.note;

    //delete notecolumn .remove();
    NoteColumn.find({note: note._id}).sort('+position').exec(function (err, ncl) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            var columnidarr = [];
            for(var i in ncl) {
                columnidarr[i] = ncl[i]._id ;
                ncl[i].remove();
            }
            //remove value
            NoteValue.find({notecolumn: {$in: columnidarr}}).remove().exec();
        }
    });

    note.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(note);
        }
    });
};

/**
 * List of Noteapps
 */
exports.list = function (req, res) {
    Note.find({user: req.user._id}).sort('-created').exec(function (err, notes) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(notes);
        }

    });
};



/**
 * Note middleware
 */
exports.noteByID = function (req, res, next, id) {
    Note.findById(id).populate('user', '_id').exec(function (err, note) {
        if (err) return next(err);
        if (!note) return next(new Error('Failed to load note ' + id));
        req.note = note;
        next();
    });
};

/**
 * Note authorization middleware
 */
exports.hasAuthorization = function (req, res, next) {
    if (req.note.user.id !== req.user.id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
    next();
};