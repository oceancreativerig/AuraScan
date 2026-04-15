import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let faceLandmarker: FaceLandmarker | null = null;
let filesetResolver: FilesetResolver | null = null;
let isLoading = false;

export const getFaceLandmarker = async () => {
  if (faceLandmarker) return faceLandmarker;
  if (isLoading) {
    while (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return faceLandmarker;
  }

  isLoading = true;
  try {
    if (!filesetResolver) {
      filesetResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
    }
    
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver as any, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "CPU"
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO",
      numFaces: 1
    });
    
    return faceLandmarker;
  } catch (error) {
    console.error("Failed to initialize FaceLandmarker:", error);
    throw error;
  } finally {
    isLoading = false;
  }
};

export const closeFaceLandmarker = () => {
  if (faceLandmarker) {
    faceLandmarker.close();
    faceLandmarker = null;
  }
};
