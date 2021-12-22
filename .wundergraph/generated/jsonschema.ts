import { JSONSchema7 } from "json-schema";

interface Schema {
	Hello: {
		input: JSONSchema7;
		response: JSONSchema7;
	};
}

const jsonSchema: Schema = {
	Hello: {
		input: { type: "object", properties: {}, additionalProperties: false },
		response: {
			type: "object",
			properties: { data: { type: "object", properties: {}, additionalProperties: false } },
			additionalProperties: false,
		},
	},
};
export default jsonSchema;
