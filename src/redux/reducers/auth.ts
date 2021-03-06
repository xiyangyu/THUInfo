import {AuthState, LoginStatus} from "../states/auth";
import {AuthAction} from "../actions/auth";
import {
	DO_LOGOUT,
	LOGIN_FAILURE,
	LOGIN_REQUEST,
	LOGIN_SUCCESS,
} from "../constants";
import {defaultAuthState} from "../defaults";

export const auth = (
	state: AuthState = defaultAuthState,
	action: AuthAction,
): AuthState => {
	switch (action.type) {
		case LOGIN_REQUEST: {
			const payload = action.payload;
			return {
				...state,
				userId: payload.userId,
				password: payload.password,
				status: LoginStatus.LoggingIn,
			};
		}
		case LOGIN_SUCCESS: {
			const payload = action.payload;
			return {
				...state,
				userId: payload.userId,
				password: payload.password,
				status: LoginStatus.LoggedIn,
			};
		}
		case LOGIN_FAILURE:
			return {
				...state,
				userId: "",
				password: "",
				status: action.payload,
			};
		case DO_LOGOUT:
			return {
				...state,
				userId: "",
				password: "",
				status: LoginStatus.None,
			};
		default:
			return state;
	}
};
