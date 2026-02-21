// Face matching utility using face-api.js
// This runs client-side in the browser to avoid server load

export async function loadFaceApiModels() {
    const faceapi = await import('face-api.js');

    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);

    return faceapi;
}

export async function getFaceDescriptor(
    faceapi: any,
    imageElement: HTMLImageElement
): Promise<Float32Array | null> {
    const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true)
        .withFaceDescriptor();

    return detection?.descriptor || null;
}

export function compareFaces(
    descriptor1: Float32Array,
    descriptor2: Float32Array
): number {
    // Euclidean distance — lower = more similar  
    // Threshold of ~0.6 is a good match
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = descriptor1[i] - descriptor2[i];
        sum += diff * diff;
    }
    return Math.sqrt(sum);
}

export const FACE_MATCH_THRESHOLD = 0.6;
