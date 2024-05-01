const message = document.querySelector("#message")
const numbers = document.querySelector("#numbers")
const video = document.getElementById("video")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const speech = window.speechSynthesis

let poses = []
let poseNet
let neuralNetwork


let poseTimers = {}; // Object to store timers for each pose
let currentPose = null;

function startApp(){
    ctx.strokeStyle = 'white';
    ctx.fillStyle = "green";
    ctx.lineWidth = 3;
    ctx.translate(640, 0);
    ctx.scale(-1, 1)

    initWebcam()
    
    neuralNetwork = ml5.neuralNetwork({ task: 'regression' })

     
    const modelInfo = {
        model: './model (20).json',
        metadata: './model_meta (20).json',
        weights: 'model.weights (20).bin',
    
        //weights: 'C:\Users\Tejaswini\OneDrive\Desktop\yoga pose detection system\model.weights.bin'
    }

    neuralNetwork.load(modelInfo, yogaModelLoaded)
}

function yogaModelLoaded() {
    message.innerHTML = "Yoga model loaded"
    poseNet = ml5.poseNet(video, "single", poseModelReady)
    poseNet.on("pose", gotPoses)
    drawCameraAndPoses()
}

function poseModelReady() {
    message.innerHTML = "Pose model loaded"
    poseNet.singlePose(video)
}

function gotPoses(results) {
    poses = results;
    if (poses.length > 0) {
        let currentLabel = null;
        let pose = poses[0].pose;
        if (pose.keypoints[0].score > 0.2 && pose.keypoints[15].score > 0.2 && pose.keypoints[16].score > 0.2) {
            currentLabel = "Tree";
        } else if (pose.keypoints[5].score > 0.2 && pose.keypoints[6].score > 0.2 && pose.keypoints[11].score > 0.2) {
            currentLabel = "Warrior2";
        } else if (pose.keypoints[0].score > 0.2 && pose.keypoints[13].score > 0.2 && pose.keypoints[14].score > 0.2) {
            currentLabel = "Mountain";
        }
        if (currentLabel !== currentPose) {
            if (currentPose !== null) {
                clearInterval(poseTimers[currentPose]);
                message.innerHTML = `Stopped ${currentPose} pose`;
            }
            currentPose = currentLabel;
            if (currentPose !== null) {
                message.innerHTML = `Detected ${currentPose} pose`;
                poseTimers[currentPose] = Date.now(); // Start timer when pose is detected
                setInterval(() => {
                    const elapsedTime = Math.floor((Date.now() - poseTimers[currentPose]) / 1000);
                    // message.innerHTML = `Detected ${currentPose} pose - Elapsed time: ${elapsedTime} seconds`;
                }, 1000);
            }
        }
    } else {
        if (currentPose !== null) {
            clearInterval(poseTimers[currentPose]);
            message.innerHTML = `Stopped ${currentPose} pose`;
            currentPose = null;
        }
    }
}

function initWebcam() {
    // Create a webcam capture
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            video.srcObject = stream
            video.play()

        })
    }
}


// A function to draw the video and poses into the canvas independently of posenet
function drawCameraAndPoses() {
    ctx.drawImage(video, 0, 0, 640, 360) // 640 x 360 or 640 x 480
    drawKeypoints()
    drawSkeleton()
    classifyKeyPoints()
    window.requestAnimationFrame(drawCameraAndPoses)
}





// A function to draw ellipses over the detected keypoints

function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i += 1) {
        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j += 1) {
            let keypoint = poses[i].pose.keypoints[j]
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                ctx.beginPath()
                ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI)
                ctx.stroke()
            }
        }
    }
} 

// // A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i ++) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j ++) {
            let partA = poses[i].skeleton[j][0]
            let partB = poses[i].skeleton[j][1]
            ctx.beginPath()
            ctx.moveTo(partA.position.x, partA.position.y)
            ctx.lineTo(partB.position.x, partB.position.y)
            ctx.stroke()
        }
    }
}

function classifyKeyPoints(){
    if(poses.length > 0) {
        let points = []
        for (let keypoint of poses[0].pose.keypoints) {
            points.push(Math.round(keypoint.position.x))
            points.push(Math.round(keypoint.position.y))
        }
        numbers.innerHTML = points.toString()


        neuralNetwork.classify(points, yogaResult)
    }
}

function yogaResult(error, result) {
    if (error) console.error(error)
    console.log(poses)
    //console.log(result[0].label + " confidence:" + result[0].confidence.toFixed(2))
    const elapsedTime = currentPose ? Math.floor((Date.now() - poseTimers[currentPose]) / 1000) : 0;
    message.innerHTML = `Pose: "${result[0].label}" --- Accuracy: ${result[0].confidence.toFixed(2)} --- Elapsed Time: ${elapsedTime} seconds`;
    speak(`It is a ${result[0].label}pose`);
}

//speak(`It is a ${result[0].label}pose`)

function speak(text){
    if(speech.speaking){
      return
    }
    if(text!==""){
       let say=new SpeechSynthesisUtterance(text)
       speech.speak(say)
       }
  }
startApp()




