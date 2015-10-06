console.log('YOOOOOOOOOO');
function checkCategory () {
	console.log("checking category");
	var category = $('.watch-info-tag-list').filter(function () {
		var $this = $(this);
	  	var $h4 = $this.siblings('h4');
	  	return $h4.text().trim() === 'Category';
	}).find('li a').text();
	if (category === "Music") {
		return sendSong();
	}
}

function findTitleAndArtist() {
	var titleAndArtist = $('.watch-meta-item').filter(function() {
		var $this = $(this);
		var $h4 = $this.children('h4');
		return $h4.text().trim() === "Music";
	}).find("ul li").text().split("\"");
	console.log("title and artist: ",titleAndArtist);
		if (titleAndArtist.length >= 2) {
		var songTitle = titleAndArtist[1];
		var byArtist = titleAndArtist[2].split("(")[0];
		var artist = byArtist.substring(3).trim();
		console.log("songTitle & artist", songTitle, artist);
		return [songTitle, artist];
	}
	console.log("couldnt split, returning empty strings");
	return ['', ''];
}

function sendSong() {
	//console.log('sending song');
	var titleAndArtist = findTitleAndArtist();
	var songObj = {
		message: "YouTube",
	    url: location.href,
	    videoTitle: $("#eow-title").text().trim(),
	    category: 'Music',
	    duration: $('.ytp-time-duration').text(),
	    title: titleAndArtist[0],
	    artist: titleAndArtist[1]
	};
	if (songObj.title === "" && songObj.artist === "") {
		songObj.artist = songObj.videoTitle.split(" - ")[0] || "unknown artist";
		songObj.title = songObj.videoTitle.split(" - ")[1] || "unknown title";
	}

	console.log('the object', songObj);
	chrome.runtime.sendMessage(songObj, function (response) {
	    console.log('response from router:', response);
	});
	return songObj;
}

// var port = chrome.runtime.connect({name: "videoStatus"});
// port.onMessage.addListener(function(request) {
// 	console.log("in listener");
//  	if (request.message == "newSongLoaded") {
//   		console.log("recieved connection message", request);
//   	}
// });

checkCategory();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	console.log("content script request", request);
	if (request.message === 'newSongLoaded') {
		checkCategory();
		sendResponse({response: "song item sent to background"});
	}
	return false;
});
