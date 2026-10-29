// Score video stills for a thumbnail: is there one face, smiling, with both eyes open?
//
//   swift scripts/publish/find-smiles.swift <frames dir>
//
// Prints tab-separated `file  smile  eyesOpen  faceHeightFraction` for every frame with a face.
// Uses Core Image's built-in face detector, so it needs macOS but nothing to install.
import CoreImage
import Foundation

let dir = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "."
let detector = CIDetector(
  ofType: CIDetectorTypeFace,
  context: nil,
  options: [CIDetectorAccuracy: CIDetectorAccuracyHigh]
)!

let files = (try? FileManager.default.contentsOfDirectory(atPath: dir))?
  .filter { $0.hasSuffix(".jpg") || $0.hasSuffix(".png") }
  .sorted() ?? []

for file in files {
  let url = URL(fileURLWithPath: dir).appendingPathComponent(file)
  guard let image = CIImage(contentsOf: url) else { continue }
  let faces = detector.features(
    in: image,
    options: [CIDetectorSmile: true, CIDetectorEyeBlink: true]
  ).compactMap { $0 as? CIFaceFeature }
  // Skip frames with no face or several (e.g. a screen share showing people).
  guard faces.count == 1, let face = faces.first else { continue }
  let eyesOpen = !face.leftEyeClosed && !face.rightEyeClosed
  let height = face.bounds.height / image.extent.height
  print("\(file)\t\(face.hasSmile ? 1 : 0)\t\(eyesOpen ? 1 : 0)\t\(String(format: "%.2f", height))")
}
