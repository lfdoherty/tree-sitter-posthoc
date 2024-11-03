// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterPosthoc",
    products: [
        .library(name: "TreeSitterPosthoc", targets: ["TreeSitterPosthoc"]),
    ],
    dependencies: [
        .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
    ],
    targets: [
        .target(
            name: "TreeSitterPosthoc",
            dependencies: [],
            path: ".",
            sources: [
                "src/parser.c",
                // NOTE: if your language has an external scanner, add it here.
            ],
            resources: [
                .copy("queries")
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("src")]
        ),
        .testTarget(
            name: "TreeSitterPosthocTests",
            dependencies: [
                "SwiftTreeSitter",
                "TreeSitterPosthoc",
            ],
            path: "bindings/swift/TreeSitterPosthocTests"
        )
    ],
    cLanguageStandard: .c11
)
