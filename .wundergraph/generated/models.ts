

export interface GraphQLError {
	message: string;
	path?: ReadonlyArray<string | number>;
}

export interface HelloResponse {
	data?: {};
	errors?: ReadonlyArray<GraphQLError>;
}

export interface GraphQLError {
	message: string;
	path?: ReadonlyArray<string | number>;
}

export interface HelloResponseData {}
