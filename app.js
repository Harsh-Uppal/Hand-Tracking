const videoElement = document.getElementsByClassName('input_video')[0];
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');
const sounds = [];
const fingerTouchThreshold = .04;
let isFingerTouching = -1;

for (let i = 0; i < 8; i++) {
    let sound = document.createElement(
        'audio'
    );
    sound.src = `./Sounds/${i}.wav`;
    sounds.push(sound);
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(
        results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            let fingersTouch = false;

            for (let t = 2; t <= 5; t++) {
                let tip0 = landmarks[4];
                let tip1 = landmarks[t * 4];
                if (dist3d(tip0, tip1) < fingerTouchThreshold) {
                    if (isFingerTouching == -1) {
                        isFingerTouching = t + i * 4;
                        onFingersTouch(t - 2 + i * 4);
                    }
                }
                else if (isFingerTouching > -1)
                    isFingerTouching = -1;

                drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
                drawLandmarks(canvasCtx, landmarks, { color: '#00FFFF', lineWidth: 2 });
            }
        }
        canvasCtx.restore();
    }
}

function onFingersTouch(i) {
    if (i < 8)
        sounds[i].play();
}

const hands = new Hands({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }
});
hands.setOptions({
    maxNumHands: 4,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({ image: videoElement });
    },
    width: 1280,
    height: 720
});
camera.start();


function dist3d(v0, v1) {
    return Math.sqrt((v0.x - v1.x) * (v0.x - v1.x) + (v0.y - v1.y) * (v0.y - v1.y) + (v0.z - v1.z) * (v0.z - v1.z));
}