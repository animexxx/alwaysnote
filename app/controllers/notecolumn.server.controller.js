'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    NoteColumn = mongoose.model('Notecolumn'),
    NoteValue = mongoose.model('Notevalue'),
    _ = require('lodash');

/**
 * Create a Notecolumn
 */
exports.create = function (req, res) {
    var notecl = new NoteColumn(req.body);
    notecl.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        }
        else {
            res.json(notecl);
        }
    });
};

/**
 * Show the current Notecolumn
 */
exports.read = function (req, res) {

};

/**
 * Update a Notecolumn
 */
exports.update = function (req, res) {

    NoteColumn.update({_id: req.body.columnid}, {columnname: req.body.columnname}, function (err) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json();
        }
    });
};


/**
 * Delete an Notecolumn
 */
exports.delete = function (req, res) {
    var notecl = req.body;
    NoteColumn.findById(notecl._id).exec(function (err, ncl) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            ncl.remove(function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                }
            });
            //remove value
            NoteValue.find({notecolumn: ncl._id}).remove().exec();
            res.json();
        }
    });
};

/**
 * List of Notecolumns
 */
exports.list = function (req, res) {
    var note = req.note;
    NoteColumn.find({note: note._id}).sort('position').exec(function (err, ncl) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {


            res.json(ncl);
        }
    });
};

exports.sort = function (req, res) {

    var updateidarr = [];
    var notecl = req.body;

    for (var x in notecl) {
        updateidarr[x] = notecl[x]._id;
    }


    NoteColumn.find({_id: {$in: updateidarr}}).exec(function (err, response) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {

            for (var i in response) {

                for (var j in notecl) {
                    if (response[i]._id === notecl[j]._id) {
                        response[i].position = parseInt(notecl[j].position);
                        break;
                    }
                }
                response[i].save();
            }
            res.json();
        }
    });
};