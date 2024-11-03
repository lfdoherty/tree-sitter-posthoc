/**
 * @file Posthoc grammar for tree-sitter
 * @author Liam
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "posthoc",


  externals: $ => [
    $._newline,
    $._indent,
    $._dedent,
  ],
  extras: $ => [
    $.line_comment,
    /[\s\f]|\r/,
    $.block_comment
  ],
  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($._top_level_statement),
  

    line_comment: $ => token(/\/\/[^\n]*/),
    block_comment: $ => token(/\/\*(.|\n)*\*\//),


    _top_level_statement: $ => choice(
      $.function_definition,
      $.assignment,
      $.include,
    ),

    include: $ => seq(
      '!include ',
      /[a-z\-\_\.\/]+/,
      $._newline,
    ),
    return_if: $ => seq(
      'return-if',
      $._newline,
      $._indent,
      $.expr,
      $.expr,
      $._dedent,
    ),
    assignment: $ => seq(
      repeat1($.assignment_name),
      ': ',
      choice(
        $.identifier,
        $.compound_identifier,
        $.number,
        $.string,
        $.multiline_call,
        //$.lambda_definition,
        $.base_single_line_call,
      ),
      optional($._newline),
    ),
    assignment_name: $ => seq(
      $.identifier,
      optional(seq(
        '|',
        $.single_line_expr,
      )),
    ),
    function_parameter: $ => seq(
      $.parameter_name,
      '|',
      $.single_line_expr,//TODO type_expr?
    ),
    function_definition: $ => seq(
      $.function_name,
      optional(seq(
        ':',
        $.identifier,
      )),
      ' /',
      $.single_line_expr,//TODO type_expr?
      ' ',
      repeat(seq($.function_parameter, ' ')),
      choice(
        seq('=>',$._newline, $._indent, $.block, $._dedent),
        seq('=> ', choice(
          seq($.identifier, $._newline),
          seq($.compound_identifier, $._newline),
          seq($.number, $._newline),
          seq($.string, $._newline),
          $.multiline_call,
          $.base_single_line_call,     
        )),
      ),
    ),
    lambda_definition: $ => seq(
      '::',
      repeat(seq(' ', $.parameter_name)),
      $._newline,
      $._indent,
      $.block,
      $._dedent,
    ),
    block: $ => seq(
      repeat(seq(
        choice(
          $.assignment,
          $.return_if,
        ),
        //optional($._newline),
      )),
      $.expr,
    ),
    multiline_call: $ => seq(
      $.identifier,
      $._indent,
      repeat1(seq(
        $.expr,
      )),
      $._dedent,
    ),
    base_single_line_call: $ => prec(9, seq(
      $.identifier,
      repeat(seq(' ', $.single_line_expr)),
      optional(seq(
        ' ',
        choice(
          seq($.identifier, $._newline),
          seq($.compound_identifier, $._newline),
          seq($.number, $._newline),
          seq($.string, $._newline),
          $.multiline_call,
          $.lambda_definition,
        )
      )),
    )),
    single_line_call: $ => seq(
      $.identifier,
      '(',
      optional(
        seq(
          $.single_line_expr, 
          repeat(seq(' ', $.single_line_expr)),
        )
      ),
      ')'
    ),
    expr: $ => choice(
      $.identifier,
      $.compound_identifier,
      $.number,
      $.string,
      $.multiline_call,
      $.lambda_definition,
      $.base_single_line_call,
    ),
    single_line_expr: $ => choice(
      $.identifier,
      $.compound_identifier,
      $.number,
      $.string,
      $.single_line_call,
    ),
    identifier: $ => /[a-z&][a-z\-0-9]*/,
    parameter_name: $ => /[a-z+][a-z\-0-9]*/,
    function_name: $ => /[a-z&][a-z\-0-9]*/,
    compound_identifier: $ => /[a-z][a-z\-0-9\.]*/,
    number: $ => choice(/\d+/, /\-\d+/), //TODO
    string: $ => seq(
      "'",
      /[^']*/,
      "'",
    ),
  }
});