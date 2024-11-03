package tree_sitter_posthoc_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_posthoc "github.com/lfdoherty/tree-sitter-posthoc.git/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_posthoc.Language())
	if language == nil {
		t.Errorf("Error loading Posthoc grammar")
	}
}
