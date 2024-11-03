import XCTest
import SwiftTreeSitter
import TreeSitterPosthoc

final class TreeSitterPosthocTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_posthoc())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Posthoc grammar")
    }
}
