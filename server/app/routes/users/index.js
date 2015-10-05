var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Song = mongoose.model('Song');
require("string_score");
var echojs = require('echojs');
var echo = echojs({
  key: "BC5YTSWIE5Q9YWVGF"
});
var deepPopulate = require("mongoose-deep-populate")(mongoose);


router.get("/", function (req, res) {
	User.find()
	.then(function (users) {
		users = users.map(function (user) {
			return _.omit(user.toJSON(), ['salt', 'password']);
		});
		res.json(users);
	});
});

router.get('/:userId', function (req, res) {
	res.json(_.omit(req.foundUser.toJSON(), ['salt', 'password']));
});

router.get('/:userId/library', function (req, res, next) {
	User.populate(req.foundUser, 'musicLibrary.song')
		.then(function (populatedUser) {
			console.log('the popul8d usr lolz', populatedUser);
			res.json(populatedUser);
		})
		.then(null, next);
});

function checkLibrary(artist, title){
	return new Promise(function(resolve, reject){
		echo("song/search").get({artist: artist, title: title}, function (err, json) {
		if (err) console.log("EROR: ",err);
		var songToAdd;

		if (json.response.status.message === "Success" && json.response.songs.length > 0) {
			songToAdd = _.max(json.response.songs, function(song){
				return song.title.score(title);
			});
			return Song.findOne({echoNestId: songToAdd.id})
			.then(function(foundSong){
				return resolve(foundSong || "not found");
			});
		} else {
			return Song.find({})
			.then(function(allSongs){
				var newSong = _.max(allSongs, function(eachSong){
					var tS = eachSong.title.score(title);
					var aS = eachSong.artist.score(artist);
					if (aS === 0 || tS === 0) return;
					return (tS + aS);
				});
				if (newSong <= 0 || !newSong) {
					return resolve("not found");
				} else {
					return resolve(newSong);
				}
			});
		}
	})});
}

//#1
router.put('/:userId/library', function (req, res, next) {
	checkLibrary(req.body.artist, req.body.title)
	.then(function(song){

		if (song !== "not found"){
			req.song = song;
			next();
		} else {
			req.song = {
				title: req.body.title,
				artist: req.body.artist,
				youtube: {
					url: req.body.url,
					title: req.body.videoTitle,
					duration: req.body.duration,
				},
			};
			Song.create(req.song).then(function(newSong){
				req.song = newSong;
				req.newSong = true;
				next();
			})
		}
	});
});


//#2
router.put('/:userId/library', function (req, res, next) {
	if (req.newSong) {
		req.index = -1;
		next();
	} else {
		return User.populateMusicLibrary(req.foundUser)
			.then(function(populatedUser){
				req.index = populatedUser.findMatchIndex(req.song);
				next();
			})
			.then(null, function (err){
				console.log("ERROR", err);
				next(err);
			});
	}
});

//#3
router.put('/:userId/library', function (req, res, next) {
	req.foundUser.addToLibraryOrUpdate(req.song, req.index);
	return req.foundUser.save()
	.then(function(savedUser){
		savedUser.deepPopulate('musicLibrary.song', function(err, user){
			if (err) {
				console.log("DP ERROR", err);
				// return reject(err);
				return;
			}
			res.status(201).json(user.musicLibrary);
		});
	}).then(null, next);
});

router.param('userId', function (req, res, next, userId) {
	User.findById(userId)
	.then(function (user) {
		req.foundUser = user;
		next();
	})
	.then(null, next);
});
