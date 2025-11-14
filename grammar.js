/**
 * @file Posthoc grammar for tree-sitter
 * @author Liam
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
	name: "posthoc",

	externals: ($) => [$._newline, $._indent, $._dedent],
	extras: ($) => [$.line_comment, /[\s\f\r]/, $.block_comment],
	conflicts: ($) => [[$._single_line_expr, $.assignment]],
	rules: {
		// TODO: add the actual grammar rules
		source_file: ($) => repeat($._top_level_statement),

		line_comment: ($) => token(/\/\/[^\n]*/),
		// http://stackoverflow.com/questions/13014947/regex-to-match-a-c-style-multiline-comment/36328890#36328890
		block_comment: (_) =>
			token(
				choice(
					seq("//", /[^\r\n\u2028\u2029]*/),
					seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/"),
				),
			),

		_top_level_statement: ($) =>
			choice($.function_definition, $.assignment, $.include),

		include: ($) => seq("!include ", /[a-z\-\_\.\/]+/, $._newline),
		return_if: ($) =>
			seq("return-if", $._newline, $._indent, $._expr, $._expr, $._dedent),

		named_argument: ($) =>
			seq(field("name", $.identifier), ":", field("value", $._expr)),
		function_parameter: ($) =>
			seq(
				field("name", $.parameter_name),
				seq(
					"|",
					field("type", $._single_line_expr), //TODO type_expr?
				),
			),
		function_definition: ($) =>
			seq(
				field("name", $.identifier),
				optional(field("supertype", seq(":", $.identifier))),
				" ",
				"/",
				field("return_type", $._single_line_expr), //TODO type_expr?,
				" ",
				field("parameters", repeat(seq($.function_parameter, " "))),
				"=>",
				$._newline,
				field("body", seq($._indent, $.block, $._dedent)),
			),
		assignment: ($) => {
			const assignment_name = seq(
				field("name", $.identifier),
				optional(seq("|", field("type", $._single_line_expr))),
			);
			const assignment_names = seq(
				assignment_name,
				repeat(seq(" ", assignment_name)),
				": ",
			);
			return seq(
				field("names", assignment_names),
				field(
					"expr",
					choice(
						$.identifier,
						$.compound_identifier,
						$.number,
						$.string,
						$.multiline_call,
						$.base_single_line_call,
					),
				),
				//	optional($._newline),
			);
		},
		zero_parameter_lambda_definition: ($) =>
			seq("--", $._newline, $._indent, $.block, $._dedent),
		lambda_definition: ($) =>
			seq(
				"::",
				repeat(seq(" ", $.parameter_name)),
				$._newline,
				$._indent,
				$.block,
				$._dedent,
			),
		block: ($) =>
			seq(
				repeat(
					seq(
						choice($.assignment, $.return_if),
						//optional($._newline),
					),
				),
				$._expr,
			),
		multiline_arguments: ($) => repeat1(seq(choice($._expr, $.named_argument))),
		multiline_call: ($) =>
			seq(
				field("name", $.identifier),
				$._indent,
				field("arguments", $.multiline_arguments),
				$._dedent,
			),
		base_single_line_call: ($) =>
			prec(
				9,
				seq(
					field("name", $.identifier),
					field(
						"arguments",
						seq(
							repeat(seq(" ", $._single_line_expr)),
							optional(
								seq(
									" ",
									choice(
										seq($.identifier, $._newline),
										seq($.compound_identifier, $._newline),
										seq($.number, $._newline),
										seq($.string, $._newline),
										$.multiline_call,
										$.lambda_definition,
										$.zero_parameter_lambda_definition,
									),
								),
							),
						),
					),
				),
			),
		single_line_call: ($) =>
			seq(
				field("name", $.identifier),
				"(",
				field(
					"arguments",
					optional(
						seq($._single_line_expr, repeat(seq(" ", $._single_line_expr))),
					),
				),
				")",
			),
		_expr: ($) =>
			choice(
				$.identifier,
				$.compound_identifier,
				$.number,
				$.string,
				$.boolean,
				$.multiline_call,
				$.lambda_definition,
				$.zero_parameter_lambda_definition,
				$.base_single_line_call,
			),
		_single_line_expr: ($) =>
			choice(
				$.identifier,
				$.compound_identifier,
				$.boolean,
				$.number,
				$.string,
				$.single_line_call,
			),
		identifier: ($) => /[a-z&][a-z\-0-9]*/,
		parameter_name: ($) => /[a-z\+][a-z\-0-9]*/,
		compound_identifier: ($) => /[a-z][a-z\-0-9\.]*/,
		number: ($) => {
			const decimalDigits = /\d(_?\d)*/;
			const signedInteger = seq(optional(choice("-")), decimalDigits);
			const exponentPart = seq(choice("e", "E"), signedInteger);
			const decimalIntegerLiteral = choice(
				"0",
				seq(
					optional("0"),
					/[1-9]/,
					optional(seq(optional("_"), decimalDigits)),
				),
			);

			const decimalLiteral = choice(
				signedInteger,
				seq(
					optional("-"),
					decimalIntegerLiteral,
					".",
					optional(decimalDigits),
					optional(exponentPart),
				),
				seq(optional("-"), ".", decimalDigits, optional(exponentPart)),
				seq(decimalIntegerLiteral, exponentPart),
				decimalDigits,
			);

			return token(decimalLiteral);
		},
		boolean: ($) => choice("true", "false"),
		string: ($) => /('[^']*')|("[^"]*")/,
	},
});
