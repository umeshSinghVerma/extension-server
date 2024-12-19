import { YoutubeTranscript } from "youtube-transcript";
import cors from "cors";
import { Client } from "youtubei";
import express from "express";

const app = express();
const youtube = new Client();

app.use(cors({
    origin: '*', // Update to specific origins for better security in production
    methods: ['GET', 'POST'],
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello, I am up and running on Vercel!");
});

app.post('/getPlayListVideoList', async (req, res) => {
    try {
        const { playListId } = req.body;
        if (!playListId) {
            return res.status(400).send({ error: "Playlist ID is required." });
        }
        const data = await getPlaylistVideos(playListId);
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch playlist videos." });
    }
});

app.post('/getSubtitles', async (req, res) => {
    try {
        const { videoId } = req.body;
        if (!videoId) {
            return res.status(400).send({ error: "Video ID is required." });
        }
        const data = await getSubTitles(videoId);
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/getSearchResults', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).send({ error: "Search query is required." });
        }
        const data = await getSearchResults(query);
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: "Failed to fetch search results." });
    }
});

async function getPlaylistVideos(playlistId) {
    try {
        const playlist = await youtube.getPlaylist(playlistId);
        const data = playlist.videos.items.map(videoData => videoData.id);
        return { videoIds: data, playlistTitle: playlist.title };
    } catch (e) {
        console.error(e);
        throw new Error('Failed to fetch playlist videos.');
    }
}

async function getSearchResults(searchQuery) {
    try {
        const searchResult = await youtube.search(searchQuery, { type: "all" });
        return searchResult.items.map(video => ({
            id: video.id,
            title: video.title,
            description: video.description,
            thumbnail: video.thumbnails[0],
        }));
    } catch (e) {
        console.error(e);
        throw new Error('Failed to fetch search results.');
    }
}

async function getSubTitles(videoId) {
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const text = transcript.map(ele => ele.text).join(" ");
        return { text, subtitles: transcript };
    } catch (error) {
        console.error('Error fetching captions:', error);
        throw new Error('Captions cannot be generated for this video.');
    }
}

// Export the handler for Vercel
export default app;
