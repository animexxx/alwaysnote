'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    NoteValue = mongoose.model('Notevalue'),
    _ = require('lodash');

/**
 * Create a Notevalue
 */
exports.create = function (req, res) {
    var time = req.body.time;
    var data = req.body.data;
    var isupdate = req.body.isupdate;

    if (data.length > 1) {
        var notevalue = [];
        var updateidarr = [];
        var xxx = 0;
        for (var i in data) {

            if (typeof data[i].notevalueid !== 'undefined' && data[i].notevalueid !== null && data[i].notevalueid !== '') {
                updateidarr[xxx++] = data[i].notevalueid;
            }

            notevalue[i] = {
                created: time,
                columnvalue: data[i]._value,
                notecolumn: data[i]._id,
                notevalueid: data[i].notevalueid
            };

        }
        if (isupdate === true) {
            if(updateidarr.length > 0)
            NoteValue.find({_id: {$in: updateidarr}}).exec(function (err, response) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    for (var i in response) {
                        for (var j in notevalue) {
                            if (response[i]._id === notevalue[j].notevalueid) {
                                response[i].columnvalue = notevalue[j].columnvalue;
                                break;
                            }
                        }
                        response[i].save();
                    }

                }
            });

            //if not update, then insert more
            var insertmore = [];
            var xx = 0;
            for (var x in notevalue) {
                if (typeof notevalue[x].notevalueid === 'undefined' || notevalue[x].notevalueid === null || notevalue[x].notevalueid === '') {
                    insertmore[xx++] = notevalue[x];
                }
            }
            //remove time cl
            insertmore.shift();
            if(insertmore.length > 0) {
            NoteValue.create(insertmore, function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var docs = [];
                    var j = 0;
                    for (var i = 1; i < arguments.length; i++) {
                        docs[j++] = arguments[i];
                    }
                    res.json(docs);
                }
            });
            }
            else {
                res.json();
            }

        }
        else {

            NoteValue.create(notevalue, function (err) {
                if (err) {
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                } else {
                    var docs = [];
                    var j = 0;
                    for (var i = 1; i < arguments.length; i++) {
                        docs[j++] = arguments[i];
                    }
                    res.json(docs);
                }
            });
        }

    }

};

/**
 * Show the current Notevalue
 */
exports.read = function (req, res) {

};

/**
 * Update a Notevalue
 */
exports.update = function (req, res) {

};

/**
 * Delete an Notevalue
 */
exports.delete = function (req, res) {
    var time = req.params.rowtime;
    NoteValue.find({created: time}).remove().exec(function (err, response) {
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
 * List of Notevalues
 */
exports.list = function (req, res) {
    var vl = req.body.colid;
    var daterange = req.body.daterange;
    NoteValue.find(
        {
            notecolumn: {$in: vl},
            created: {
                $gte: daterange.startDate,
                $lt: daterange.endDate
            }
        }
    ).sort({created: 1, position: 1}).populate('notecolumn', 'position').exec(function (err, ncl2) {
            if (err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            } else {
                res.json(ncl2);
            }
        });
};