import Foundation
import CoreGraphics
import ImageIO

// A vector clip works in the system launch storyboard without runtime layer attributes.
let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent()
let assets = root.appendingPathComponent("../PaDlroliroBox/PaDlroliroBox/Assets.xcassets")
let source = assets.appendingPathComponent("AppIcon.appiconset/paliraoon.jpg")
let output = assets.appendingPathComponent("PaliroLaunchLogo.imageset/paliro-launch-logo.pdf")
guard let imageSource = CGImageSourceCreateWithURL(source as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(imageSource, 0, nil) else {
    fatalError("Unable to read the existing Paliro app icon")
}
var bounds = CGRect(x: 0, y: 0, width: 70, height: 70)
guard let context = CGContext(output as CFURL, mediaBox: &bounds, nil) else {
    fatalError("Unable to create the Paliro launch logo asset")
}
context.beginPDFPage(nil)
context.addPath(CGPath(roundedRect: bounds, cornerWidth: 20, cornerHeight: 20, transform: nil))
context.clip()
context.draw(image, in: bounds)
context.endPDFPage()
context.closePDF()
print(output.path)
