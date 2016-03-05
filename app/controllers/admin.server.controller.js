'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Create a Admin
 */
exports.create = function (req, res) {

};

/**
 * Show the current Admin
 */
exports.read = function (req, res) {

};

/**
 * Update a Admin
 */
exports.update = function (req, res) {

};

/**
 * Delete an Admin
 */
exports.delete = function (req, res) {

};

/**
 * List of Admins
 */
exports.list = function (req, res) {

    User.find().sort('-created').exec(function (err, users) {
        if (err) {
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.json(users);
        }

    });

};

exports.isAdminDuy = function (req, res, next) {
    if (req.user.username !== 'Duy') {
        return res.status(403).send({
            message: 'Admin is not authorized'
        });
    }
    next();
};