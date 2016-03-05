'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Notevalue Schema
 */
var NotevalueSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    columnvalue: {
        type: String,
        default: '',
        trim: true
    },
    notecolumn: {
        type: Schema.ObjectId,
        ref: 'Notecolumn'
    }
});

mongoose.model('Notevalue', NotevalueSchema);