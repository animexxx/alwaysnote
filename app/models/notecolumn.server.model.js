'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Notecolumn Schema
 */
var NotecolumnSchema = new Schema({
    columnname: {
        type: String,
        default: '',
        trim: true,
        required: 'Name of column cannot be blank'
    },
    position: {
        type: Number,
        default: 0,
        trim: true,
        required: 'Position of column cannot be blank'
    },
    note: {
        type: Schema.ObjectId,
        ref: 'Note'
    }
});

mongoose.model('Notecolumn', NotecolumnSchema);