(number) @number
(string) @string
(function_definition name: (identifier) @function)
(assignment_name) @variable
[
    (line_comment)
    (block_comment)
] @comment
(boolean) @boolean
(parameter_name) @variable
[
    "|"
    "=>"
    "=> "
    "::"
] @operator
(return_if) @operator

