const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('play-pause-btn');
const progressBar = document.getElementById('progress-bar');
const subtitleContainer = document.querySelector('.subtitle-container');

let subtitles = [];

// Function to parse SRT file
function parseSRT(srt) {
    const lines = srt.trim().split('\n');
    const subs = [];
    let i = 0;
    while (i < lines.length) {
        if (lines[i].trim().match(/^\d+$/)) {
            const index = parseInt(lines[i].trim());
            i++;
            const timeString = lines[i].trim();
            const [startTime, endTime] = timeString.split(' --> ').map(time => {
                const parts = time.split(':');
                const seconds = parseInt(parts[2].split(',')[0]);
                const milliseconds = parseInt(parts[2].split(',')[1]);
                return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + seconds + milliseconds / 1000;
            });
            i++;
            let text = '';
            while (i < lines.length && lines[i].trim() !== '') {
                text += lines[i].trim() + ' ';
                i++;
            }
            subs.push({ index, startTime, endTime, text });
        }
        i++;
    }
    return subs;
}


// Function to display subtitles
function displaySubtitles() {
    const currentTime = audio.currentTime;
    const currentSubtitle = subtitles.find(subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime);
    if (currentSubtitle) {
        subtitleContainer.textContent = currentSubtitle.text;
    } else {
        subtitleContainer.textContent = '';
    }
}

// Function to update progress bar
function updateProgressBar() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progress;
}

// Event listeners
playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = 'Pause';
    } else {
        audio.pause();
        playPauseBtn.textContent = 'Play';
    }
});

audio.addEventListener('timeupdate', () => {
    displaySubtitles();
    updateProgressBar();
});

progressBar.addEventListener('input', () => {
    const seekTime = (progressBar.value / 100) * audio.duration;
    audio.currentTime = seekTime;
});

// Load and parse SRT file
fetch('sample.srt')
    .then(response => response.text())
    .then(data => {
        subtitles = parseSRT(data);
    });

// Set audio source
audio.src = 'sample.mp3';
