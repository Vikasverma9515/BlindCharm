"use client";
import React, { useRef, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api"; // fallback for detection

export default function FaceVerification() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadModels = async () => {
      setLoading(true);

      // Load face-api.js models (used for detection only)
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.ageGenderNet.loadFromUri("/models");

      // Start video
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          })
          .catch((err) => console.error("Camera error:", err));
      }

      setLoading(false);
    };

    loadModels();
  }, []);

  const detectGender = async () => {
    if (!videoRef.current) return;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withAgeAndGender();

    if (detections && detections.gender) {
      setGender(detections.gender); // "male" or "female"
    }
  };

  useEffect(() => {
    const interval = setInterval(detectGender, 2000); // check every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        width={320}
        height={240}
        className="rounded-2xl shadow-lg border"
      />
      {loading ? (
        <p className="text-gray-500">Loading face detection...</p>
      ) : gender ? (
        <p className="text-lg font-semibold">
          Detected Gender:{" "}
          <span className={gender === "male" ? "text-blue-600" : "text-pink-600"}>
            {gender}
          </span>
        </p>
      ) : (
        <p className="text-gray-400">Looking for a face...</p>
      )}
    </div>
  );
}
