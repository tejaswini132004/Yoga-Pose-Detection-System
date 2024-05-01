let message = document.querySelector("#message");
let nn;

function start() {
  const options = {
    dataUrl: "./yogaa.csv",
    inputs: [
      "leftAnklex",
      "leftAnkley",
      "leftEarx",
      "leftEary",
      "leftElbowx",
      "leftElbowy",
      "leftEyex",
      "leftEyey",
      "leftHipx",
      "leftHipy",
      "leftKneex",
      "leftKneey",
      "leftShoulderx",
      "leftShouldery",
      "leftWristx",
      "leftWristy",
      "nosex",
      "nosey",
      "rightAnklex",
      "rightAnkley",
      "rightEarx",
      "rightEary",
      "rightElbowx",
      "rightElbowy",
      "rightEyex",
      "rightEyey",
      "rightHipx",
      "rightHipy",
      "rightKneex",
      "rightKneey",
      "rightShoulderx",
      "rightShouldery",
      "rightWristx",
      "rightWristy",
    ],
    outputs: ["yogapose"],
    task: "regression",
    debug: true,
  };

  nn = ml5.neuralNetwork(options, dataLoaded);
}

function dataLoaded() {
  message.innerHTML = "Finished loading - Start training";

  nn.normalizeData();
  const trainingOptions = {
    epochs: 32,
    batchSize: 12,
  };

  nn.train(trainingOptions, finishedTraining);
}

function finishedTraining() {
  console.log("Finished training!");
  message.innerHTML = "Finished training";

  nn.save();
}

function classify(input) {
  nn.classify(input, handleResults);
}

function handleResults(error, result) {
  if (error) console.error(error);
  console.log(result[0].label + " confidence:" + result[0].confidence);
  message.innerHTML = result[0].label + " confidence:" + result[0].confidence;
}

start();
