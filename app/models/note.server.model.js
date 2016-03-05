'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Note Schema
 */
var NoteSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    notename: {
        type: String,
        default: '',
        trim: true,
        required: 'Name of note cannot be blank'
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

mongoose.model('Note', NoteSchema);