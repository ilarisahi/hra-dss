import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
import * as moment from "moment";

export const DateScalar = new GraphQLScalarType({
    name: "Date",
    description: `The \`Date\` scalar type represents a Date instance.
                  It is of type \`String\` and follows the format \`YYYY-MM-DD\`.`,
    serialize(value) {
        // To client
        return moment(value).format("YYYY-MM-DD");
    },
    parseValue(value) {
        // From client
        return new Date(value);
    },
    parseLiteral(ast) {
        // From query
        if (ast.kind === Kind.INT) {
            return new Date(parseInt(ast.value));
        } else if (ast.kind === Kind.STRING) {
            return new Date(ast.value);
        }
        return null;
    }
});
