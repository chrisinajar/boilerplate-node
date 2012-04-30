#
# Copyright Chris "inajar" Vickery
#
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
#
express = require 'express'
flow = require 'jar-flow'
config = require './config'
stylus = require 'stylus'
jade = require 'jade'

# not found error, used to make 404 work correctly
class NotFound extends Error
	constructor: ->

app = express.createServer()

# where all the .jade and .styl files are
viewdir = __dirname + '/views'
# statically served content
staticdir = __dirname + '/static'
# destination directory for the compiled css files
cssdir = __dirname + '/css'

app.configure ->
	app.use express.errorHandler({ dumpExceptions: true, showStack: true })
	app.use express.logger()
	app.use express.bodyParser()

	app.set 'views', viewdir
	app.set 'view engine', 'jade'

	app.use '/css', stylus.middleware {
		src: viewdir
		dest: cssdir
		debug: true
		compile: (str, path)->
			stylus(str)
				.set('filename', path)
				.set('warn', true)
				.set('compress', true)
	}

	app.use '/css', express.static(cssdir)
	app.use '/static', express.static(staticdir)

# Error pages!
renderError = (err, res)->
	console.log err.message
	if (err instanceof NotFound)
		res.render 'error', {
			status: 404,
			err: err,
			title: 'Not Found'}
	else
		res.render 'error', {
			status: 500,
			err: err,
			title: 'Server Error!'}

app.error (err, req, res, next) ->
	renderError err, res

app.get '/', (req, res, next) ->
	res.render 'main'

app.get '/favicon.ico', (req, res, next) ->
	res.redirect '/static/favicon.ico'

app.get '/*', (req, res, next) ->
	next new NotFound()

app.listen config.port
