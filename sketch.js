let video;
let bodyPose;
let poses = [];
let connections;
let squatCount = 0;
let previousY = null;
let state = "Up";

let goalCount = 3; // 목표 개수

let isStampVisible = false; // 도장 표시 여부를 추적하는 변수
let stampTime = 0; // 도장 표시 시작 시간을 추적하는 변수
let stampDelay = 5000; // 도장이 찍힌 후 5초 후에 Figma로 이동 (5,000ms)

let isRecording = false; // 버튼 상태 (false: 멈춤, true: 레코딩 중)
let btn_pause, btn_record, top_, bottom, Calendar, person;
let iconSize = 50; // 아이콘 크기
let btnSize = 100; // 버튼 크기
let btnX, btnY;

let stampTriggered = false; // 탭이 이미 열렸는지 추적하는 변수


function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
  
  // 추가
  btn_pause = loadImage('img/Deactivation.png');
  btn_record = loadImage('img/activation.png');
  top_ = loadImage('img/top.png');
  bottom = loadImage('img/bottom.png');
  Calendar = loadImage('img/Calendar.png');
  person = loadImage('img/person.png');
  
}

function setup() {
  createCanvas(windowWidth, windowHeight); 
  
  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
  
  btnX = width / 2 - btnSize / 2; // 버튼의 X 위치
  btnY = height - bottom.height * (width / bottom.width) / 2 - btnSize / 2; // 버튼의 Y 위치
}

function draw() {
  background(0);

  // Draw the webcam video
  image(video, 0, 0, width, height);

  let bottomBarHeight = bottom.height * (width / bottom.width);
  let stampY = height - bottomBarHeight * 0.65; // 하단바 높이를 고려하여 도장 위치 조정

  // 상단바와 하단바 표시
  image(top_, 0, 0, width, top_.height * (width / top_.width)); // 상단바
  image(bottom, 0, height - bottom.height * (width / bottom.width), width, bottom.height * (width / bottom.width)); // 하단바

  // 아이콘 표시
  image(Calendar, width * 0.1, height - bottom.height * (width / bottom.width) / 2 - iconSize / 2, iconSize, iconSize); // 캘린더 아이콘
  image(person, width * 0.9 - iconSize, height - bottom.height * (width / bottom.width) / 2 - iconSize / 2, iconSize, iconSize); // 개인보관함 아이콘

  let btnSize = 100; // 버튼 크기
  let btnX = width / 2 - btnSize / 2; // 버튼 위치
  let btnY = height - bottom.height * (width / bottom.width) / 2 - btnSize / 2;

  stroke(255, 0, 0); 
  line(0, height * 0.6, width, height * 0.6);

  // 스쿼트 로직
  if (poses.length > 0) {
    let pose = poses[0];
    let leftHipY = pose.keypoints[11].y; 
    let rightHipY = pose.keypoints[12].y; 

    let hipY = (leftHipY + rightHipY) / 2;

    let thresholdY = height * 0.6;

    if (hipY > thresholdY) {
      if (state === "Up") {
        state = "Down";
      }
    } else {
      if (state === "Down") {
        state = "Up";
        // 스쿼트 목표를 달성했을 때
        if (squatCount < goalCount) {
          squatCount++; // 목표 미달성 시에만 증가
        }
      }
    }

    let countX = btnX + btnSize / 2; // 버튼 중앙의 X 좌표
    let countY = btnY - btnSize / 2 - 150; // 버튼 위로 약간 띄운 Y 좌표

    // Squats 텍스트 배경
    let boxWidth = 400; // 배경 박스 너비
    let boxHeight = 100; // 배경 박스 높이
    let boxRadius = 20; // 둥근 모서리 반지름

    fill(50, 50, 50, 200); // 박스 색 (반투명)
    noStroke(); // 스트로크 끄기
    rectMode(CENTER); // 박스의 중심 좌표 기준
    rect(countX, countY, boxWidth, boxHeight, boxRadius); // 배경 박스 그리기

    // Squats 텍스트
    fill(255); // 텍스트 색
    textSize(64);
    textAlign(CENTER, CENTER); // 텍스트 중앙 정렬
    // Squat 진행 상황 표시
    text("Squat " + squatCount + "/" + goalCount, countX, countY); // 텍스트 출력
  }

  // 스쿼트 목표 달성 시 도장 표시
  if (squatCount >= goalCount && !isStampVisible) {
    isStampVisible = true;
    stampTime = millis(); // 도장 표시 시작 시간 기록
  }

  // 도장 표시
  if (isStampVisible) {
    let stampX = width / 2;

    let stampSize = min(width, height) * 0.1; // 화면 가로 또는 세로의 10% 크기로 설정

    fill(255, 165, 0, 200); // 주황색
    noStroke();
    ellipse(stampX, stampY, stampSize, stampSize); // 도장 모양 그리기

  // 도장이 찍힌 후 5초 뒤에 Figma 프로토타입 페이지로 이동
  if (isStampVisible && !stampTriggered && millis() - stampTime > 5000) { // 5초 후
    window.location.href = "https://www.figma.com/proto/tcwqCpMcNFNmMGdf2abYxQ/%EC%9C%B5%EC%BA%A1%EB%94%94?node-id=204-794&t=2AcmhHOKpPxl8VBE-1";
    stampTriggered = true; // 탭이 이미 열렸음을 기록
  }
  }

  // Draw the skeleton connections
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      // Only draw a line if both points are confident enough
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.1
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }
  }
}

function mousePressed() {
  let fs = fullscreen(); // 현재 fullscreen 상태
  fullscreen(!fs); // fullscreen 상태를 반전
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
