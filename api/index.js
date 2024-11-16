const express = require('express');
const { Client } = require("youtubei");
const youtube = new Client();
const app = express();
const port = 8080;

app.use(express.json());

app.get('/',(req,res)=>{
    res.send("Hello I am up");
})

app.post('/getPlayListVideoList', async (req, res) => {
    try {
        const body = req.body;
        const data = await getPlaylistVideos(body.playListId);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
});
app.post('/getSearchResults', async (req, res) => {
    try {
        const body = req.body;
        const data = await getSearchResults(body.query);
        res.send(data);
    } catch (error) {
        res.send(error);
    }
});

app.listen(port, () => {
    console.log('Server is running on port 8080');
})


async function getPlaylistVideos(playlistId) {
    try {
        const playlist = await youtube.getPlaylist(playlistId);
        const data = playlist.videos.items.map(videoData => {
            return videoData.id
        })
        return data;
    } catch (e) {
        console.log(e);
        return [];
    }
};
async function getSearchResults(searchQuery) {
    try {
        const searchResult = await youtube.search(searchQuery, {
            type: "all",
        });
        const searchResultData = searchResult.items.map((video) => {
            return {
                id: video.id,
                title: video.title,
                description: video.description,
                thumbnail: video.thumbnails[0],
            }
        })
        return searchResultData

    } catch (e) {
        console.log(e);
        return [];
    }
};

module.exports = app;